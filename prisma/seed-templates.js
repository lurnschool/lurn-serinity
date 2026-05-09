/**
 * seed-templates — script CLI idempotent pour créer 3 templates de
 * programmes prêts à l'emploi côté coach.
 *
 * Usage : npm run seed:templates
 *
 * Programmes créés (idempotent par `nom`) :
 *   - "Full Body Débutant — 4 semaines" (3 séances/sem)
 *   - "Push / Pull / Legs Intermédiaire — 6 semaines" (3 séances/sem)
 *   - "Perte de poids HIIT + Force — 8 semaines" (4 séances/sem)
 *
 * Tous les exercices référencés DOIVENT exister dans ExerciseLibrary
 * (seed:exercise-library doit être lancé en premier).
 *
 * Aucune donnée client touchée. Si un template existe déjà (par nom),
 * il n'est pas dupliqué (skip).
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// === Templates =============================================================

const TEMPLATES = [
  {
    nom: 'Full Body Débutant — 4 semaines',
    description: 'Programme d\'introduction à la musculation. 3 séances par semaine, full body, focus technique et progression douce.',
    objectif: 'remise_forme',
    niveau: 'debutant',
    duree: 4,
    weeks: [1, 2, 3, 4].map(weekNum => ({
      title: `Semaine ${weekNum}`,
      sessions: [
        {
          title: `Séance A — Full Body`, focus: 'Full Body', minutes: 50,
          exercises: [
            { slug: 'goblet-squat',          sets: 3, repsMin: 10, repsMax: 12, rest: 90, load: '8-12kg', notes: 'Garde le buste droit' },
            { slug: 'pompes',                sets: 3, repsMin: 8,  repsMax: 12, rest: 75, load: 'au poids du corps' },
            { slug: 'rowing-haltere',        sets: 3, repsMin: 10, repsMax: 12, rest: 75, load: '8-12kg' },
            { slug: 'gainage-planche',       sets: 3, repsMin: 30, repsMax: 45, rest: 45, load: 'tenir en secondes', tempo: 'iso' },
            { slug: 'mobilite-thoracique-cat-cow', sets: 2, repsMin: 8, repsMax: 10, rest: 30, load: '' },
          ],
        },
        {
          title: `Séance B — Bas du corps`, focus: 'Jambes', minutes: 50,
          exercises: [
            { slug: 'fentes-avant',          sets: 3, repsMin: 10, repsMax: 12, rest: 75, load: 'poids du corps', notes: 'Genou aligné cheville' },
            { slug: 'leg-curl',              sets: 3, repsMin: 12, repsMax: 15, rest: 60, load: 'progressif' },
            { slug: 'mollets-debout',        sets: 3, repsMin: 12, repsMax: 15, rest: 60, load: 'progressif' },
            { slug: 'crunch',                sets: 3, repsMin: 12, repsMax: 15, rest: 45, load: 'poids du corps' },
          ],
        },
        {
          title: `Séance C — Haut du corps`, focus: 'Pectoraux + Dos', minutes: 50,
          exercises: [
            { slug: 'developpe-haltere-assis', sets: 3, repsMin: 10, repsMax: 12, rest: 90, load: '8-12kg' },
            { slug: 'tirage-vertical',         sets: 3, repsMin: 10, repsMax: 12, rest: 75, load: 'progressif' },
            { slug: 'curl-biceps-barre',       sets: 3, repsMin: 10, repsMax: 12, rest: 60, load: '15-20kg' },
            { slug: 'extension-triceps-poulie',sets: 3, repsMin: 10, repsMax: 12, rest: 60, load: 'progressif' },
            { slug: 'gainage-lateral',         sets: 2, repsMin: 20, repsMax: 30, rest: 45, load: 'tenir en secondes' },
          ],
        },
      ],
    })),
  },
  {
    nom: 'Push / Pull / Legs Intermédiaire — 6 semaines',
    description: 'Split classique pour adhérents intermédiaires. 3 séances par semaine, focus hypertrophie. Progression linéaire.',
    objectif: 'prise_masse',
    niveau: 'intermediaire',
    duree: 6,
    weeks: [1, 2, 3, 4, 5, 6].map(weekNum => ({
      title: `Semaine ${weekNum}`,
      sessions: [
        {
          title: `Push — Pectoraux / Épaules / Triceps`, focus: 'Push', minutes: 70,
          exercises: [
            { slug: 'developpe-couche',         sets: 4, repsMin: 6, repsMax: 8,  rest: 120, load: '70-80% 1RM', rpe: 8 },
            { slug: 'developpe-incline-haltere',sets: 3, repsMin: 8, repsMax: 10, rest: 90,  load: '60-70% 1RM' },
            { slug: 'developpe-militaire',      sets: 3, repsMin: 6, repsMax: 8,  rest: 120, load: '60-70% 1RM' },
            { slug: 'elevation-laterale',       sets: 3, repsMin: 12, repsMax: 15,rest: 60,  load: '6-10kg' },
            { slug: 'extension-triceps-haltere',sets: 3, repsMin: 10, repsMax: 12,rest: 75,  load: 'progressif' },
            { slug: 'dips',                     sets: 3, repsMin: 6, repsMax: 10, rest: 90,  load: 'poids du corps + lest' },
          ],
        },
        {
          title: `Pull — Dos / Biceps`, focus: 'Pull', minutes: 70,
          exercises: [
            { slug: 'souleve-de-terre',     sets: 4, repsMin: 5, repsMax: 6,  rest: 180, load: '75-85% 1RM', rpe: 8, notes: 'Dos neutre, hip-hinge propre' },
            { slug: 'traction',             sets: 4, repsMin: 6, repsMax: 10, rest: 120, load: 'poids du corps' },
            { slug: 'rowing-barre',         sets: 4, repsMin: 8, repsMax: 10, rest: 90,  load: '60-70% 1RM' },
            { slug: 'tirage-horizontal',    sets: 3, repsMin: 10, repsMax: 12,rest: 75,  load: 'progressif' },
            { slug: 'curl-biceps-barre',    sets: 3, repsMin: 8, repsMax: 10, rest: 75,  load: '20-30kg' },
            { slug: 'curl-haltere-incline', sets: 3, repsMin: 10, repsMax: 12,rest: 60,  load: '8-12kg' },
          ],
        },
        {
          title: `Legs — Quadriceps / Ischios / Fessiers`, focus: 'Legs', minutes: 75,
          exercises: [
            { slug: 'squat-barre',          sets: 4, repsMin: 6, repsMax: 8,  rest: 180, load: '75-85% 1RM', rpe: 8 },
            { slug: 'souleve-de-terre-roumain', sets: 3, repsMin: 8, repsMax: 10, rest: 120, load: '60-70% 1RM' },
            { slug: 'presse-jambes',        sets: 3, repsMin: 10, repsMax: 12, rest: 90, load: 'progressif' },
            { slug: 'leg-extension',        sets: 3, repsMin: 12, repsMax: 15, rest: 60, load: 'progressif' },
            { slug: 'hip-thrust',           sets: 4, repsMin: 8, repsMax: 12,  rest: 90, load: 'progressif' },
            { slug: 'mollets-debout',       sets: 4, repsMin: 12, repsMax: 15, rest: 60, load: 'progressif' },
          ],
        },
      ],
    })),
  },
  {
    nom: 'Perte de poids HIIT + Force — 8 semaines',
    description: 'Programme orienté composition corporelle. Mix force et HIIT cardio pour brûler tout en préservant la masse.',
    objectif: 'perte_poids',
    niveau: 'intermediaire',
    duree: 8,
    weeks: Array.from({ length: 8 }, (_, i) => i + 1).map(weekNum => ({
      title: `Semaine ${weekNum}`,
      sessions: [
        {
          title: `Force Full Body`, focus: 'Full Body', minutes: 55,
          exercises: [
            { slug: 'goblet-squat',         sets: 4, repsMin: 10, repsMax: 12, rest: 75, load: '12-20kg' },
            { slug: 'rowing-haltere',       sets: 4, repsMin: 10, repsMax: 12, rest: 75, load: '10-16kg' },
            { slug: 'developpe-haltere-assis', sets: 3, repsMin: 10, repsMax: 12, rest: 75, load: '10-14kg' },
            { slug: 'gainage-planche',      sets: 3, repsMin: 45, repsMax: 60, rest: 45, load: 'secondes' },
          ],
        },
        {
          title: `HIIT Cardio`, focus: 'HIIT', minutes: 35,
          exercises: [
            { slug: 'burpees',          sets: 5, repsMin: 10, repsMax: 12, rest: 60, load: 'poids du corps', rpe: 9 },
            { slug: 'kettlebell-swing', sets: 5, repsMin: 15, repsMax: 20, rest: 60, load: '12-16kg', rpe: 8 },
            { slug: 'corde-a-sauter',   sets: 4, repsMin: 60, repsMax: 90, rest: 60, load: 'secondes', notes: 'Sauts bas, atterrissage avant-pied' },
            { slug: 'rameur',           sets: 3, repsMin: 90, repsMax: 120, rest: 60, load: 'tirage rapide' },
          ],
        },
        {
          title: `Force Bas du corps + Core`, focus: 'Jambes + Core', minutes: 55,
          exercises: [
            { slug: 'fentes-avant',     sets: 4, repsMin: 10, repsMax: 12, rest: 75, load: '8-12kg' },
            { slug: 'hip-thrust',       sets: 4, repsMin: 12, repsMax: 15, rest: 75, load: '40-60kg' },
            { slug: 'mollets-debout',   sets: 3, repsMin: 15, repsMax: 20, rest: 60, load: 'progressif' },
            { slug: 'releve-jambes',    sets: 3, repsMin: 10, repsMax: 12, rest: 60, load: 'poids du corps' },
            { slug: 'gainage-lateral',  sets: 3, repsMin: 30, repsMax: 45, rest: 45, load: 'secondes' },
          ],
        },
        {
          title: `Cardio long + Mobilité`, focus: 'LISS + Mobilité', minutes: 45,
          exercises: [
            { slug: 'velo-elliptique',   sets: 1, repsMin: 25, repsMax: 30, rest: 0, load: 'minutes', rpe: 6, notes: 'Zone 2, conversation possible' },
            { slug: 'mobilite-hanches-90-90', sets: 2, repsMin: 8, repsMax: 10, rest: 30, load: 'côtés' },
            { slug: 'mobilite-thoracique-cat-cow', sets: 2, repsMin: 10, repsMax: 12, rest: 30, load: 'lent' },
            { slug: 'etirement-ischios', sets: 2, repsMin: 30, repsMax: 45, rest: 30, load: 'secondes' },
          ],
        },
      ],
    })),
  },
]

async function main() {
  let created = 0, skipped = 0, droppedExercises = 0

  // Charger tous les slugs valides en bibliothèque
  const lib = await prisma.exerciseLibrary.findMany({
    where: { isActive: true },
    select: { id: true, slug: true },
  })
  const slugToId = Object.fromEntries(lib.map(e => [e.slug, e.id]))
  if (lib.length === 0) {
    console.error('[seed:templates] Bibliothèque vide. Lance d\'abord npm run seed:exercise-library')
    process.exit(1)
  }

  for (const tpl of TEMPLATES) {
    const existing = await prisma.programme.findFirst({ where: { nom: tpl.nom }, select: { id: true } })
    if (existing) { skipped++; continue }

    // Sans transaction (Supabase pooler timeout sur transactions longues).
    // Le seed est idempotent par nom : si on plante en cours, le re-run
    // skip ce template au prochain coup.
    const p = await prisma.programme.create({
      data: {
        nom: tpl.nom,
        description: tpl.description,
        objectif: tpl.objectif,
        niveau: tpl.niveau,
        duree: tpl.duree,
      },
    })
    for (let wi = 0; wi < tpl.weeks.length; wi++) {
      const w = tpl.weeks[wi]
      const wRow = await prisma.programmeWeek.create({
        data: { programmeId: p.id, weekNumber: wi + 1, title: w.title },
      })
      for (let si = 0; si < w.sessions.length; si++) {
        const s = w.sessions[si]
        const sRow = await prisma.programmeSession.create({
          data: {
            programmeWeekId: wRow.id,
            sessionNumber: si + 1,
            title: s.title,
            focus: s.focus,
            estimatedDurationMinutes: s.minutes,
          },
        })
        // Batch les exercices via createMany (1 round-trip au lieu de N)
        const sessionExercisesData = []
        let order = 1
        for (const x of s.exercises) {
          const libId = slugToId[x.slug]
          if (!libId) { droppedExercises++; continue }
          sessionExercisesData.push({
            programmeSessionId: sRow.id,
            exerciseLibraryId: libId,
            order: order++,
            sets: x.sets,
            repsMin: x.repsMin,
            repsMax: x.repsMax,
            restSeconds: x.rest,
            targetLoad: x.load || '',
            tempo: x.tempo || '',
            targetRpe: x.rpe || null,
            coachNotes: x.notes || '',
          })
        }
        if (sessionExercisesData.length > 0) {
          await prisma.sessionExercise.createMany({ data: sessionExercisesData })
        }
      }
    }
    created++
  }

  console.log(`[seed:templates] créés=${created} skip=${skipped} exercises_droppés=${droppedExercises}`)
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error('[seed:templates] erreur :', e?.message || e)
    await prisma.$disconnect()
    process.exit(1)
  })
