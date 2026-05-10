/**
 * Client Anthropic centralisé pour TrackCoach Premium.
 *
 * Responsabilités :
 *  - Instancier un client Anthropic SDK avec la clé serveur.
 *  - Détecter l'absence de clé pour basculer en fallback graceful.
 *  - Exposer un `runTool` qui wrap la requête, mesure latence, capture
 *    tokens, calcule un coût estimé, et délègue le logging à
 *    `cost-tracking`.
 *
 * Sécurité :
 *  - JAMAIS exposé côté client (file utilisé uniquement dans des routes
 *    serveur).
 *  - La clé n'est jamais lue ni renvoyée au client.
 */

import Anthropic from '@anthropic-ai/sdk'
import { recordUsage } from './cost-tracking'

export const DEFAULT_MODEL = 'claude-sonnet-4-5'

// Tarif estimé Sonnet 4.5 (USD / Mtoken) — ajusté à la baisse pour rester
// conservateur. Source : pricing public Anthropic. Ces valeurs servent
// uniquement à un suivi interne — pas un calcul comptable.
const PRICING_USD_PER_MTOKEN = {
  'claude-sonnet-4-5': { input: 3, output: 15 },
  default: { input: 3, output: 15 },
}

export function isAiConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

export function getAnthropicClient() {
  if (!isAiConfigured()) return null
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

/**
 * Calcule un coût estimé en USD. Renvoie null si données insuffisantes.
 */
export function estimateCostUsd({ model, inputTokens, outputTokens }) {
  if (inputTokens == null && outputTokens == null) return null
  const tariff = PRICING_USD_PER_MTOKEN[model] || PRICING_USD_PER_MTOKEN.default
  const inCost  = (Number(inputTokens)  || 0) / 1_000_000 * tariff.input
  const outCost = (Number(outputTokens) || 0) / 1_000_000 * tariff.output
  return Number((inCost + outCost).toFixed(6))
}

/**
 * Wrap d'un appel Anthropic forcé en tool_use, avec metrics + logging.
 *
 * @param {object}  opts
 * @param {string}  opts.kind            - étiquette d'usage (program_generation…).
 * @param {string} [opts.model]          - modèle (default DEFAULT_MODEL).
 * @param {string}  opts.system          - prompt système.
 * @param {string}  opts.userMessage     - message utilisateur unique.
 * @param {object}  opts.tool            - définition tool_use.
 * @param {number} [opts.maxTokens]      - cap tokens output.
 * @param {string} [opts.userId]         - logging.
 * @param {string} [opts.clientId]       - logging.
 * @param {object} [opts.metadata]       - logging metadata sans données sensibles.
 *
 * @returns {Promise<{ ok: boolean, input?: object, raw?: any, error?: string,
 *                     usage?: { inputTokens, outputTokens, latencyMs, costUsd, model } }>}
 */
export async function runTool({
  kind, model = DEFAULT_MODEL, system, userMessage, tool,
  maxTokens = 16000, userId = null, clientId = null, metadata = null,
}) {
  if (!isAiConfigured()) {
    return { ok: false, error: 'AI_NOT_CONFIGURED' }
  }
  const client = getAnthropicClient()
  const startedAt = Date.now()

  let response
  try {
    response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      system,
      tools: [tool],
      tool_choice: { type: 'tool', name: tool.name },
      messages: [{ role: 'user', content: userMessage }],
    })
  } catch (e) {
    const latencyMs = Date.now() - startedAt
    const errorMessage = e?.message || 'inconnue'
    await recordUsage({
      kind, model, userId, clientId,
      inputTokens: null, outputTokens: null,
      latencyMs,
      estimatedCost: null,
      status: 'error',
      errorMessage,
      metadata,
    })
    return { ok: false, error: `IA indisponible (${errorMessage})` }
  }

  const latencyMs = Date.now() - startedAt
  const inputTokens  = response?.usage?.input_tokens  ?? null
  const outputTokens = response?.usage?.output_tokens ?? null
  const estimatedCost = estimateCostUsd({ model, inputTokens, outputTokens })

  const toolUse = (response.content || []).find(c => c.type === 'tool_use' && c.name === tool.name)
  if (!toolUse) {
    await recordUsage({
      kind, model, userId, clientId,
      inputTokens, outputTokens, latencyMs,
      estimatedCost,
      status: 'error',
      errorMessage: 'tool_use_missing',
      metadata,
    })
    return { ok: false, error: 'L\'IA n\'a pas retourné de réponse exploitable.' }
  }

  await recordUsage({
    kind, model, userId, clientId,
    inputTokens, outputTokens, latencyMs,
    estimatedCost,
    status: 'success',
    errorMessage: null,
    metadata,
  })

  return {
    ok: true,
    input: toolUse.input,
    raw: response,
    usage: { inputTokens, outputTokens, latencyMs, costUsd: estimatedCost, model },
  }
}
