/**
 * Garde-fous sécurité avant génération IA.
 *
 * Refus systématique si le profil de l'adhérent contient un signal de
 * risque médical sérieux. Dans ce cas on renvoie `refused_safety` et on
 * propose un fallback : "Programme à valider avec un coach humain".
 *
 * Pas un diagnostic — juste un filet de sécurité pour qu'on ne génère
 * pas un programme de musculation à quelqu'un qui mentionne « hernie
 * discale aiguë » en clair.
 */

const HIGH_RISK_KEYWORDS = [
  // Cardio
  'cardiopath', 'infarctus', 'arythm', 'pacemaker', 'angor', 'pontage',
  'avc', 'ait',
  // Locomoteur aigu
  'hernie discale aig', 'sciatique aig', 'lombalgie invalidan',
  'rupture ligamen', 'fracture récent', 'plâtre', 'attelle', 'béquille',
  'opération récent', 'chirurgie récent', 'post-op', 'post op',
  // Métabolique aigu
  'diabète déséquilibr', 'hypoglycémie sévère',
  // Grossesse à risque
  'grossesse à risque', 'menace accouchement', 'grossesse pathologique',
  // Psychiatrique/eating
  'troubles du comportement alimentaire aig',
  // Mentions explicites
  'douleur aiguë', 'douleur intense actuelle', 'fièvre',
]

const ESCAPE_VALVE = [
  'ne plus être suivi', 'arrêt cardiaque', 'malaise',
]

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

/**
 * @param {object} client - fields lus depuis Client
 * @returns {{ ok: true } | { ok: false, reason: string, matchedTerm?: string }}
 */
export function safetyCheckForProgramGeneration(client) {
  const haystack = [
    client.physicalRestrictions,
    client.contreIndications,
    client.problemesSante,
    client.antecedentsMedicaux,
    client.traitementEnCours,
  ].map(normalize).join(' \n ')

  for (const term of [...HIGH_RISK_KEYWORDS, ...ESCAPE_VALVE]) {
    if (haystack.includes(normalize(term))) {
      return {
        ok: false,
        reason: 'profil à risque — validation humaine requise',
        matchedTerm: term,
      }
    }
  }

  // Sécurité bonus : âge < 16 ou > 75 sans bilan récent → on freine.
  // Pas de date naissance fiable, on skip silencieusement si absent.
  return { ok: true }
}

/**
 * Validation d'une raison de remplacement d'exercice.
 * On accepte un set strict pour éviter les détournements.
 */
export const VALID_REPLACEMENT_REASONS = [
  'machine_prise',
  'pas_le_bon_materiel',
  'trop_dur',
  'douleur',
  'preference',
  'autre',
]

export function isValidReplacementReason(r) {
  return VALID_REPLACEMENT_REASONS.includes(String(r))
}
