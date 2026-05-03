import crypto from 'crypto'

/**
 * Mot de passe / credentials — PR 2B
 *
 * - generateTemporaryPassword(length=16) : génère un MdP temporaire fort,
 *   utilisé à la création de compte adhérent par le coach. L'utilisateur
 *   final est forcé de le changer à la première connexion.
 *
 * - validateNewPassword(pwd) : règles minimales pour un MdP choisi par
 *   l'utilisateur final (>= 12 chars, mix maj/min/chiffre/spécial,
 *   pas dans la liste des MdP courants).
 *
 * Caractères ambigus exclus du charset de génération : 0/O, 1/I/l, etc.
 */

const CHARSET = {
  upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ',  // exclut I, O
  lower: 'abcdefghjkmnpqrstuvwxyz',   // exclut i, l, o
  digit: '23456789',                  // exclut 0, 1
  symbol: '!@#$%&*-_+=?',
}

function pickChar(charset) {
  // Rejection sampling pour éliminer le biais modulo
  const max = 256 - (256 % charset.length)
  for (;;) {
    const byte = crypto.randomBytes(1)[0]
    if (byte < max) return charset[byte % charset.length]
  }
}

function shuffleSecure(arr) {
  // Fisher-Yates avec random crypto
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Génère un MdP temporaire fort.
 * Garantie : au moins 1 caractère de chaque catégorie (majuscule, minuscule,
 * chiffre, symbole). Charset sans caractères ambigus.
 */
export function generateTemporaryPassword(length = 16) {
  if (length < 12) length = 12
  const required = [
    pickChar(CHARSET.upper),
    pickChar(CHARSET.lower),
    pickChar(CHARSET.digit),
    pickChar(CHARSET.symbol),
  ]
  const all = CHARSET.upper + CHARSET.lower + CHARSET.digit + CHARSET.symbol
  for (let i = 0; i < length - 4; i++) {
    required.push(pickChar(all))
  }
  return shuffleSecure(required).join('')
}

// Top 100 mots de passe les plus courants (extrait FR + EN, lowercase).
// Liste non exhaustive — bloque les pires choix évidents.
const COMMON_PASSWORDS = new Set([
  'password', 'password1', 'password123', 'passw0rd', 'motdepasse',
  'azerty', 'azerty123', 'qwerty', 'qwerty123', 'qwertyuiop',
  '12345678', '123456789', '1234567890', '12345', '1234',
  'admin', 'admin123', 'administrator', 'root', 'rootroot',
  'iloveyou', 'welcome', 'welcome1', 'welcome123',
  'letmein', 'abc123', 'abcdef', 'abcd1234',
  'sunshine', 'princess', 'football', 'monkey', 'dragon',
  'test', 'test1234', 'test2026', 'testtest',
  'citycoaching', 'citycoaching2026', 'coaching', 'salle',
  'adherent', 'coach', 'coach2026',
])

const PASSWORD_MIN_LENGTH = 12
const PASSWORD_MAX_LENGTH = 128

/**
 * Valide un mot de passe choisi par un utilisateur final.
 * Retourne { ok: true } ou { ok: false, error: '...' }.
 */
export function validateNewPassword(pwd) {
  if (typeof pwd !== 'string') {
    return { ok: false, error: 'Mot de passe invalide.' }
  }
  if (pwd.length < PASSWORD_MIN_LENGTH) {
    return { ok: false, error: `Le mot de passe doit faire au moins ${PASSWORD_MIN_LENGTH} caracteres.` }
  }
  if (pwd.length > PASSWORD_MAX_LENGTH) {
    return { ok: false, error: 'Mot de passe trop long.' }
  }
  if (!/[A-Z]/.test(pwd)) {
    return { ok: false, error: 'Au moins une majuscule requise.' }
  }
  if (!/[a-z]/.test(pwd)) {
    return { ok: false, error: 'Au moins une minuscule requise.' }
  }
  if (!/[0-9]/.test(pwd)) {
    return { ok: false, error: 'Au moins un chiffre requis.' }
  }
  if (!/[^A-Za-z0-9]/.test(pwd)) {
    return { ok: false, error: 'Au moins un caractere special requis.' }
  }
  if (COMMON_PASSWORDS.has(pwd.toLowerCase())) {
    return { ok: false, error: 'Mot de passe trop courant, choisissez-en un autre.' }
  }
  // Anti pattern simple répétition (aaaaaa, 111111, etc.)
  if (/^(.)\1+$/.test(pwd)) {
    return { ok: false, error: 'Mot de passe trop simple (caractere repete).' }
  }
  return { ok: true }
}

/**
 * Estime la force d'un mot de passe pour affichage UI.
 * Retourne { score: 0-4, label: 'faible'|'moyen'|'bon'|'fort' }.
 */
export function passwordStrength(pwd) {
  if (!pwd) return { score: 0, label: 'vide' }
  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) score++
  if (pwd.length >= 16) score = Math.min(score + 1, 4)
  const labels = ['faible', 'faible', 'moyen', 'bon', 'fort']
  return { score, label: labels[score] || 'fort' }
}
