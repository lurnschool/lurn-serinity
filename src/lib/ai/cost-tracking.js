/**
 * Logging des appels IA (table AiUsageLog).
 *
 * Aucun prompt brut n'est conservé — seulement le type, le modèle, la
 * latence, les tokens, le coût estimé, le statut et un metadata JSON
 * libre (qui doit rester non sensible : ids, paramètres, drapeaux).
 *
 * Échec silencieux : on ne casse jamais une requête utilisateur si le log
 * échoue. Le tracking est best-effort.
 */

import prisma from '../prisma'

export async function recordUsage({
  kind,
  model,
  userId = null,
  clientId = null,
  inputTokens = null,
  outputTokens = null,
  latencyMs = null,
  estimatedCost = null,
  status = 'success',
  errorMessage = null,
  metadata = null,
}) {
  try {
    await prisma.aiUsageLog.create({
      data: {
        kind, model,
        userId, clientId,
        inputTokens, outputTokens, latencyMs,
        estimatedCost,
        status,
        errorMessage,
        metadata: metadata ?? undefined,
      },
    })
  } catch (e) {
    // Best-effort. Log console pour debug Vercel sans casser la requête.
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[ai/cost-tracking] failed to record usage:', e?.message)
    }
  }
}

/**
 * Bilan agrégé pour le cockpit coach (cap 30 derniers jours).
 */
export async function getRecentUsageSummary({ days = 30 } = {}) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const [totals, byKind] = await Promise.all([
    prisma.aiUsageLog.aggregate({
      where: { createdAt: { gte: since } },
      _count: { _all: true },
      _sum: { inputTokens: true, outputTokens: true, estimatedCost: true },
      _avg: { latencyMs: true },
    }),
    prisma.aiUsageLog.groupBy({
      by: ['kind', 'status'],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
      _sum: { estimatedCost: true },
    }),
  ])
  return {
    days,
    totalCalls: totals._count._all,
    inputTokens: totals._sum.inputTokens ?? 0,
    outputTokens: totals._sum.outputTokens ?? 0,
    estimatedCostUsd: Number((totals._sum.estimatedCost ?? 0).toFixed(4)),
    avgLatencyMs: Math.round(totals._avg.latencyMs ?? 0),
    byKind: byKind.map(g => ({
      kind: g.kind,
      status: g.status,
      calls: g._count._all,
      costUsd: Number((g._sum.estimatedCost ?? 0).toFixed(4)),
    })),
  }
}
