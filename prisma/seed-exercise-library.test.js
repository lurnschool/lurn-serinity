/**
 * Smoke test du seed bibliothèque exercices.
 *
 * Vérifie offline (sans Prisma client connecté) :
 *  - syntaxe du fichier ;
 *  - ≥40 exercices ;
 *  - slugs uniques ;
 *  - tous les `primaryMuscleGroup` / `level` / `goalTags` dans les
 *    vocabulaires attendus du schema PR 2C ;
 *  - champs obligatoires non vides (name, slug, description, instructions).
 *
 * Usage : `node prisma/seed-exercise-library.test.js`
 *
 * Exit code != 0 si KO. Aucun framework de test requis.
 */

const fs = require('node:fs')
const path = require('node:path')

const SRC = path.join(__dirname, 'seed-exercise-library.js')
const source = fs.readFileSync(SRC, 'utf8')

// Vocabulaires — réinjectés dans le scope d'évaluation pour permettre au
// fichier seed (qui référence MUSCLE.X / LEVEL.X / GOAL.X) d'être évalué
// sans Prisma.
const MUSCLE = Object.fromEntries(
  ['PECTORAUX','DOS','EPAULES','BICEPS','TRICEPS','JAMBES','FESSIERS',
   'ABDOS','MOLLETS','AVANT_BRAS','FULL_BODY','CARDIO'].map(k => [k, k])
)
const LEVEL = Object.fromEntries(
  ['DEBUTANT','INTERMEDIAIRE','AVANCE'].map(k => [k, k])
)
const GOAL = Object.fromEntries(
  ['PRISE_MASSE','PERTE_POIDS','REMISE_FORME','ENDURANCE','FORCE','SOUPLESSE'].map(k => [k, k])
)

// Extrait l'array EXERCISES du fichier source via évaluation isolée.
// Plus robuste qu'un require : ne déclenche pas Prisma client.
function extractExercises() {
  const start = source.indexOf('const EXERCISES = [')
  if (start === -1) throw new Error('EXERCISES introuvable dans le seed')

  // On parse jusqu'au crochet fermant équilibré.
  let depth = 0
  let i = start + 'const EXERCISES = '.length
  const arrStart = i
  for (; i < source.length; i++) {
    const ch = source[i]
    if (ch === '[') depth++
    else if (ch === ']') {
      depth--
      if (depth === 0) {
        const arrSrc = source.slice(arrStart, i + 1)
        // Évaluation contrôlée — pas d'I/O, pas de require, vocab injecté.
        // eslint-disable-next-line no-new-func
        return Function('MUSCLE', 'LEVEL', 'GOAL',
          `"use strict"; return ${arrSrc};`,
        )(MUSCLE, LEVEL, GOAL)
      }
    }
  }
  throw new Error('Crochet de fermeture EXERCISES non trouvé')
}

const VALID_MUSCLE = new Set([
  'PECTORAUX','DOS','EPAULES','BICEPS','TRICEPS','JAMBES','FESSIERS',
  'ABDOS','MOLLETS','AVANT_BRAS','FULL_BODY','CARDIO',
])
const VALID_LEVEL = new Set(['DEBUTANT','INTERMEDIAIRE','AVANCE'])
const VALID_GOAL = new Set([
  'PRISE_MASSE','PERTE_POIDS','REMISE_FORME','ENDURANCE','FORCE','SOUPLESSE',
])

const errors = []
function check(cond, msg) { if (!cond) errors.push(msg) }

const exercises = extractExercises()

check(Array.isArray(exercises), 'EXERCISES doit être un array')
check(exercises.length >= 40, `Au moins 40 exercices attendus, reçu ${exercises.length}`)

const slugs = new Set()
const slugRe = /^[a-z0-9-]+$/

for (const ex of exercises) {
  const tag = `[${ex.slug || '?'}]`
  check(typeof ex.slug === 'string' && slugRe.test(ex.slug), `${tag} slug invalide`)
  check(!slugs.has(ex.slug), `${tag} slug dupliqué`)
  slugs.add(ex.slug)

  check(typeof ex.name === 'string' && ex.name.length > 0, `${tag} name manquant`)
  check(typeof ex.description === 'string' && ex.description.length >= 10, `${tag} description trop courte`)
  check(typeof ex.instructions === 'string' && ex.instructions.length >= 10, `${tag} instructions trop courtes`)

  check(VALID_MUSCLE.has(ex.primaryMuscleGroup), `${tag} primaryMuscleGroup="${ex.primaryMuscleGroup}" invalide`)
  for (const m of ex.secondaryMuscleGroups || []) {
    check(VALID_MUSCLE.has(m), `${tag} secondaryMuscleGroups contient "${m}" invalide`)
  }

  check(VALID_LEVEL.has(ex.level), `${tag} level="${ex.level}" invalide`)
  check(Array.isArray(ex.goalTags) && ex.goalTags.length > 0, `${tag} goalTags vide`)
  for (const g of ex.goalTags || []) {
    check(VALID_GOAL.has(g), `${tag} goalTags contient "${g}" invalide`)
  }

  check(Array.isArray(ex.equipment) && ex.equipment.length > 0, `${tag} equipment vide`)
  check(Array.isArray(ex.commonMistakes), `${tag} commonMistakes doit être array`)
  check(Array.isArray(ex.contraindications), `${tag} contraindications doit être array`)
}

// Couverture muscles principaux
const covered = new Set(exercises.map(e => e.primaryMuscleGroup))
const expected = ['PECTORAUX','DOS','EPAULES','BICEPS','TRICEPS','JAMBES','FESSIERS','ABDOS','MOLLETS','AVANT_BRAS','CARDIO','FULL_BODY']
for (const m of expected) {
  check(covered.has(m), `Muscle ${m} non couvert dans le seed`)
}

if (errors.length === 0) {
  // eslint-disable-next-line no-console
  console.log(`[seed:test] OK — ${exercises.length} exercices, slugs uniques, vocabulaire respecté.`)
  process.exit(0)
} else {
  // eslint-disable-next-line no-console
  console.error(`[seed:test] ${errors.length} erreur(s) :`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}
