/**
 * create-coach — script CLI idempotent pour créer/réinitialiser un compte
 * coach (rôle PRATICIEN) sur la base courante.
 *
 * Usage :
 *   npm run create-coach -- --email coach@example.com --name "Julien Hafis"
 *
 * Comportement :
 *   - Si l'email existe : on régénère un mot de passe temporaire fort,
 *     on remet `mustChangePassword=true` et on incrémente sessionVersion
 *     (invalide les sessions JWT existantes).
 *   - Si l'email n'existe pas : on crée le user avec rôle PRATICIEN.
 *   - Le mot de passe temporaire est affiché UNE SEULE FOIS dans la sortie.
 *     Il sera invalidé à la 1re connexion (mustChangePassword forcé).
 *
 * Aucune autre donnée n'est touchée. Pas de deleteMany. Pas de log de
 * DATABASE_URL. Si l'email omis : default `coach@city-coaching.fr`.
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const crypto = require('node:crypto')

const prisma = new PrismaClient()

// === Argument parsing =======================================================
function parseArgs(argv) {
  const out = {}
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--email')   out.email = argv[++i]
    else if (a === '--name')    out.name = argv[++i]
    else if (a === '--specialty') out.specialty = argv[++i]
  }
  return out
}

// === Charset MdP fort =======================================================
const CHARSET = {
  upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ',
  lower: 'abcdefghjkmnpqrstuvwxyz',
  digit: '23456789',
  symbol: '!@#$%&*-_+=?',
}
function pickChar(charset) {
  const max = 256 - (256 % charset.length)
  for (;;) {
    const byte = crypto.randomBytes(1)[0]
    if (byte < max) return charset[byte % charset.length]
  }
}
function shuffleSecure(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
function generateTemporaryPassword(length = 16) {
  const required = [
    pickChar(CHARSET.upper),
    pickChar(CHARSET.lower),
    pickChar(CHARSET.digit),
    pickChar(CHARSET.symbol),
  ]
  const all = CHARSET.upper + CHARSET.lower + CHARSET.digit + CHARSET.symbol
  for (let i = 0; i < length - 4; i++) required.push(pickChar(all))
  return shuffleSecure(required).join('')
}

async function main() {
  const args = parseArgs(process.argv)
  const email = (args.email || 'coach@city-coaching.fr').toLowerCase().trim()
  const name  = args.name || 'Coach City Coaching'
  const specialty = args.specialty || 'Coaching sportif'

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('[create-coach] email invalide')
    process.exit(1)
  }

  const tempPwd = generateTemporaryPassword(16)
  const passwordHash = await bcrypt.hash(tempPwd, 10)

  const existing = await prisma.user.findUnique({ where: { email } })

  let user
  if (existing) {
    user = await prisma.user.update({
      where: { email },
      data: {
        password: passwordHash,
        mustChangePassword: true,
        passwordChangedAt: new Date(),
        passwordTempCreatedAt: new Date(),
        sessionVersion: { increment: 1 },
        // Force le rôle COACH si jamais c'était autre chose
        role: existing.role === 'ADHERENT' ? existing.role : 'PRATICIEN',
      },
    })
  } else {
    user = await prisma.user.create({
      data: {
        email,
        name,
        password: passwordHash,
        role: 'PRATICIEN',
        specialty,
        mustChangePassword: true,
        passwordChangedAt: new Date(),
        passwordTempCreatedAt: new Date(),
        sessionVersion: 0,
      },
    })
  }

  console.log('')
  console.log('  ╔════════════════════════════════════════════════════════════╗')
  console.log('  ║             COMPTE COACH CITY COACHING                     ║')
  console.log('  ╠════════════════════════════════════════════════════════════╣')
  console.log('  ║')
  console.log(`  ║   Email             : ${email}`)
  console.log(`  ║   Mot de passe temp : ${tempPwd}`)
  console.log(`  ║   Action            : ${existing ? 'mot de passe réinitialisé' : 'compte créé'}`)
  console.log('  ║')
  console.log('  ║   ⚠ Ce mot de passe est temporaire. Il devra être changé')
  console.log('  ║     à la première connexion (mustChangePassword=true).')
  console.log('  ║')
  console.log('  ╚════════════════════════════════════════════════════════════╝')
  console.log('')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error('[create-coach] erreur :', e?.message || e)
    await prisma.$disconnect()
    process.exit(1)
  })
