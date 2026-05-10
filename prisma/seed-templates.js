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
  ,

  // === 4. FORCE PURE AVANCÉ — 8 semaines, 4 séances ===
  {
    nom: 'Force Pure Avancé — 8 semaines',
    description: 'Bloc force orienté powerlifting. 4 séances/semaine, focus 1RM squat/bench/deadlift avec accessoires ciblés. Réservé aux pratiquants confirmés.',
    objectif: 'force',
    niveau: 'avance',
    duree: 8,
    weeks: Array.from({ length: 8 }, (_, i) => i + 1).map(weekNum => ({
      title: `Semaine ${weekNum}`,
      sessions: [
        {
          title: 'Squat day', focus: 'Force jambes / dos', minutes: 75,
          exercises: [
            { slug: 'squat-barre',           sets: 5, repsMin: 3, repsMax: 5,  rest: 180, load: '80-90% 1RM', rpe: 8, notes: 'Tempo contrôlé descente' },
            { slug: 'souleve-de-terre-roumain', sets: 4, repsMin: 5, repsMax: 6, rest: 150, load: '70-80% 1RM' },
            { slug: 'fentes-avant',          sets: 3, repsMin: 8, repsMax: 10, rest: 120, load: '12-20kg' },
            { slug: 'mollets-debout',        sets: 4, repsMin: 8, repsMax: 12, rest: 75,  load: 'progressif' },
            { slug: 'gainage-planche',       sets: 3, repsMin: 45, repsMax: 60, rest: 45, load: 'secondes' },
          ],
        },
        {
          title: 'Bench day', focus: 'Force pectoraux / triceps', minutes: 75,
          exercises: [
            { slug: 'developpe-couche',         sets: 5, repsMin: 3, repsMax: 5,  rest: 180, load: '80-90% 1RM', rpe: 8 },
            { slug: 'developpe-incline-haltere', sets: 4, repsMin: 6, repsMax: 8,  rest: 120, load: '70% 1RM' },
            { slug: 'dips',                     sets: 3, repsMin: 6, repsMax: 8,  rest: 120, load: 'lest +10kg' },
            { slug: 'extension-triceps-haltere',sets: 3, repsMin: 8, repsMax: 10, rest: 75,  load: 'progressif' },
            { slug: 'oiseau-haltere',           sets: 3, repsMin: 12, repsMax: 15,rest: 60,  load: '6-10kg' },
          ],
        },
        {
          title: 'Deadlift day', focus: 'Force dos / posterior chain', minutes: 80,
          exercises: [
            { slug: 'souleve-de-terre',     sets: 5, repsMin: 3, repsMax: 5,  rest: 240, load: '85-95% 1RM', rpe: 9, notes: 'Set-up rigide, dos neutre' },
            { slug: 'rowing-barre',         sets: 4, repsMin: 6, repsMax: 8,  rest: 120, load: '70% 1RM' },
            { slug: 'traction',             sets: 4, repsMin: 5, repsMax: 8,  rest: 120, load: 'lest si possible' },
            { slug: 'curl-biceps-barre',    sets: 3, repsMin: 6, repsMax: 8,  rest: 90,  load: 'progressif' },
            { slug: 'farmer-walk',          sets: 3, repsMin: 30, repsMax: 45, rest: 90, load: 'lourd', notes: 'Distance ou temps' },
          ],
        },
        {
          title: 'Overhead day', focus: 'Force épaules / accessoires', minutes: 70,
          exercises: [
            { slug: 'developpe-militaire',     sets: 5, repsMin: 4, repsMax: 6,  rest: 180, load: '75-85% 1RM' },
            { slug: 'tirage-vertical',         sets: 4, repsMin: 8, repsMax: 10, rest: 90,  load: 'progressif' },
            { slug: 'elevation-laterale',      sets: 4, repsMin: 12, repsMax: 15,rest: 60,  load: '6-10kg' },
            { slug: 'extension-triceps-poulie',sets: 3, repsMin: 10, repsMax: 12,rest: 60,  load: 'progressif' },
            { slug: 'gainage-lateral',         sets: 3, repsMin: 30, repsMax: 45, rest: 45, load: 'secondes' },
          ],
        },
      ],
    })),
  },

  // === 5. ENDURANCE CARDIO — 6 semaines, 4 séances ===
  {
    nom: 'Endurance & Cardio — 6 semaines',
    description: 'Programme cardio progressif : LISS, HIIT, intervalles. Améliore le VO2max, le souffle et la capacité de récupération.',
    objectif: 'endurance',
    niveau: 'intermediaire',
    duree: 6,
    weeks: Array.from({ length: 6 }, (_, i) => i + 1).map(weekNum => ({
      title: `Semaine ${weekNum}`,
      sessions: [
        {
          title: 'LISS long', focus: 'Cardio Zone 2', minutes: 50,
          exercises: [
            { slug: 'tapis-course',      sets: 1, repsMin: 35, repsMax: 45, rest: 0, load: 'minutes', rpe: 5, notes: 'Rythme conversation' },
            { slug: 'mobilite-hanches-90-90', sets: 2, repsMin: 8, repsMax: 10, rest: 30, load: 'côtés' },
            { slug: 'mobilite-thoracique-cat-cow', sets: 2, repsMin: 10, repsMax: 12, rest: 30, load: 'lent' },
          ],
        },
        {
          title: 'HIIT bike', focus: 'Intervalles courts', minutes: 35,
          exercises: [
            { slug: 'velo-elliptique', sets: 1, repsMin: 8, repsMax: 10, rest: 0, load: 'minutes', rpe: 5, notes: 'Échauffement' },
            { slug: 'rameur',          sets: 8, repsMin: 30, repsMax: 30, rest: 60, load: 'sprint 30s', rpe: 9, notes: '8× sprint 30s / récup 60s' },
            { slug: 'velo-elliptique', sets: 1, repsMin: 5, repsMax: 5,  rest: 0, load: 'minutes', rpe: 4, notes: 'Récup active' },
          ],
        },
        {
          title: 'Force endurance', focus: 'Circuit', minutes: 45,
          exercises: [
            { slug: 'goblet-squat',     sets: 4, repsMin: 15, repsMax: 20, rest: 45, load: '8-12kg' },
            { slug: 'pompes',           sets: 4, repsMin: 12, repsMax: 15, rest: 45, load: 'poids du corps' },
            { slug: 'rowing-haltere',   sets: 4, repsMin: 12, repsMax: 15, rest: 45, load: '8-10kg' },
            { slug: 'kettlebell-swing', sets: 4, repsMin: 15, repsMax: 20, rest: 60, load: '12kg' },
            { slug: 'gainage-planche',  sets: 3, repsMin: 45, repsMax: 60, rest: 30, load: 'secondes' },
          ],
        },
        {
          title: 'Tempo run', focus: 'Seuil', minutes: 40,
          exercises: [
            { slug: 'tapis-course',     sets: 1, repsMin: 5, repsMax: 5,  rest: 0, load: 'minutes', rpe: 5, notes: 'Échauffement' },
            { slug: 'tapis-course',     sets: 4, repsMin: 4, repsMax: 4,  rest: 60, load: 'minutes', rpe: 8, notes: '4× 4 min seuil' },
            { slug: 'tapis-course',     sets: 1, repsMin: 5, repsMax: 5,  rest: 0, load: 'minutes', rpe: 4, notes: 'Récup' },
          ],
        },
      ],
    })),
  },

  // === 6. MOBILITÉ & SOUPLESSE — 4 semaines, 3 séances ===
  {
    nom: 'Mobilité & Souplesse — 4 semaines',
    description: 'Programme dédié à la mobilité articulaire et à la souplesse. Idéal en complément d\'un programme musculaire ou en récupération active.',
    objectif: 'souplesse',
    niveau: 'debutant',
    duree: 4,
    weeks: Array.from({ length: 4 }, (_, i) => i + 1).map(weekNum => ({
      title: `Semaine ${weekNum}`,
      sessions: [
        {
          title: 'Mobilité haut du corps', focus: 'Épaules / dos', minutes: 35,
          exercises: [
            { slug: 'mobilite-thoracique-cat-cow', sets: 3, repsMin: 10, repsMax: 12, rest: 30, load: 'lent' },
            { slug: 'mobilite-epaules-bandes',    sets: 3, repsMin: 10, repsMax: 12, rest: 30, load: 'élastique' },
            { slug: 'oiseau-haltere',             sets: 3, repsMin: 12, repsMax: 15, rest: 45, load: '3-5kg' },
            { slug: 'gainage-planche',            sets: 3, repsMin: 30, repsMax: 45, rest: 30, load: 'secondes' },
          ],
        },
        {
          title: 'Mobilité bas du corps', focus: 'Hanches / chaîne post.', minutes: 35,
          exercises: [
            { slug: 'mobilite-hanches-90-90', sets: 3, repsMin: 8, repsMax: 10, rest: 30, load: 'côtés' },
            { slug: 'etirement-ischios',      sets: 3, repsMin: 30, repsMax: 45, rest: 30, load: 'secondes' },
            { slug: 'fentes-avant',           sets: 3, repsMin: 10, repsMax: 12, rest: 45, load: 'poids du corps' },
            { slug: 'hip-thrust',             sets: 3, repsMin: 12, repsMax: 15, rest: 60, load: 'poids du corps' },
          ],
        },
        {
          title: 'Flow complet', focus: 'Full body mobilité', minutes: 40,
          exercises: [
            { slug: 'mobilite-thoracique-cat-cow', sets: 2, repsMin: 8, repsMax: 10, rest: 20, load: 'lent' },
            { slug: 'mobilite-hanches-90-90',     sets: 2, repsMin: 8, repsMax: 10, rest: 20, load: 'côtés' },
            { slug: 'mobilite-epaules-bandes',    sets: 2, repsMin: 10, repsMax: 12, rest: 20, load: 'élastique' },
            { slug: 'etirement-ischios',          sets: 2, repsMin: 30, repsMax: 45, rest: 20, load: 'secondes' },
            { slug: 'gainage-planche',            sets: 2, repsMin: 30, repsMax: 45, rest: 30, load: 'secondes' },
            { slug: 'gainage-lateral',            sets: 2, repsMin: 25, repsMax: 35, rest: 30, load: 'secondes' },
          ],
        },
      ],
    })),
  },

  // === 7. GLUTES PREMIUM — 6 semaines, 3 séances ===
  {
    nom: 'Glutes Premium — 6 semaines',
    description: 'Programme dédié aux fessiers : volume, hypertrophie, sculpting. 3 séances par semaine avec progression contrôlée.',
    objectif: 'prise_masse',
    niveau: 'intermediaire',
    duree: 6,
    weeks: Array.from({ length: 6 }, (_, i) => i + 1).map(weekNum => ({
      title: `Semaine ${weekNum}`,
      sessions: [
        {
          title: 'Glutes power', focus: 'Fessiers / quadriceps', minutes: 60,
          exercises: [
            { slug: 'hip-thrust',           sets: 5, repsMin: 8, repsMax: 10,  rest: 90, load: '60-80kg', rpe: 8, notes: 'Pause 1s en haut' },
            { slug: 'squat-barre',          sets: 4, repsMin: 8, repsMax: 10,  rest: 120, load: '60-70% 1RM' },
            { slug: 'fentes-avant',         sets: 3, repsMin: 10, repsMax: 12, rest: 75, load: '10-16kg' },
            { slug: 'mollets-debout',       sets: 3, repsMin: 12, repsMax: 15, rest: 60, load: 'progressif' },
          ],
        },
        {
          title: 'Glutes volume', focus: 'Fessiers / ischios', minutes: 60,
          exercises: [
            { slug: 'souleve-de-terre-roumain', sets: 4, repsMin: 8, repsMax: 10, rest: 90, load: '50-70% 1RM' },
            { slug: 'hip-thrust',               sets: 3, repsMin: 12, repsMax: 15,rest: 75, load: 'progressif' },
            { slug: 'leg-curl',                 sets: 4, repsMin: 12, repsMax: 15,rest: 60, load: 'progressif' },
            { slug: 'gainage-lateral',          sets: 3, repsMin: 30, repsMax: 45,rest: 45, load: 'secondes' },
          ],
        },
        {
          title: 'Lower bodyweight + Core', focus: 'Bas du corps + abdos', minutes: 50,
          exercises: [
            { slug: 'goblet-squat',     sets: 4, repsMin: 15, repsMax: 20, rest: 60, load: '12-16kg' },
            { slug: 'fentes-avant',     sets: 4, repsMin: 12, repsMax: 15, rest: 60, load: '8-12kg' },
            { slug: 'hip-thrust',       sets: 3, repsMin: 15, repsMax: 20, rest: 60, load: 'poids du corps' },
            { slug: 'releve-jambes',    sets: 3, repsMin: 12, repsMax: 15, rest: 45, load: 'poids du corps' },
            { slug: 'crunch',           sets: 3, repsMin: 15, repsMax: 20, rest: 30, load: 'poids du corps' },
          ],
        },
      ],
    })),
  },

  // === 8. REPRISE POST-PAUSE — 3 semaines, 3 séances ===
  {
    nom: 'Reprise post-pause — 3 semaines',
    description: 'Programme court de reprise après vacances ou interruption. Volume modéré, intensité progressive, focus technique et remise en route.',
    objectif: 'remise_forme',
    niveau: 'intermediaire',
    duree: 3,
    weeks: Array.from({ length: 3 }, (_, i) => i + 1).map(weekNum => ({
      title: `Semaine ${weekNum}`,
      sessions: [
        {
          title: 'Full body A', focus: 'Reprise musculaire', minutes: 45,
          exercises: [
            { slug: 'goblet-squat',         sets: 3, repsMin: 10, repsMax: 12, rest: 75, load: '10-14kg' },
            { slug: 'pompes',               sets: 3, repsMin: 8, repsMax: 12,  rest: 60, load: 'poids du corps' },
            { slug: 'rowing-haltere',       sets: 3, repsMin: 10, repsMax: 12, rest: 60, load: '8-10kg' },
            { slug: 'gainage-planche',      sets: 3, repsMin: 30, repsMax: 45, rest: 45, load: 'secondes' },
          ],
        },
        {
          title: 'Full body B', focus: 'Reprise + cardio léger', minutes: 50,
          exercises: [
            { slug: 'fentes-avant',     sets: 3, repsMin: 10, repsMax: 12, rest: 75, load: '6-10kg' },
            { slug: 'developpe-haltere-assis', sets: 3, repsMin: 10, repsMax: 12, rest: 75, load: '6-10kg' },
            { slug: 'tirage-vertical',  sets: 3, repsMin: 10, repsMax: 12, rest: 60, load: 'progressif' },
            { slug: 'velo-elliptique',  sets: 1, repsMin: 15, repsMax: 20, rest: 0,  load: 'minutes', rpe: 6 },
          ],
        },
        {
          title: 'Mobilité + Core', focus: 'Récupération active', minutes: 35,
          exercises: [
            { slug: 'mobilite-thoracique-cat-cow', sets: 2, repsMin: 8, repsMax: 10, rest: 20, load: 'lent' },
            { slug: 'mobilite-hanches-90-90',     sets: 2, repsMin: 8, repsMax: 10, rest: 20, load: 'côtés' },
            { slug: 'gainage-planche',            sets: 3, repsMin: 30, repsMax: 45, rest: 45, load: 'secondes' },
            { slug: 'gainage-lateral',            sets: 3, repsMin: 25, repsMax: 35, rest: 45, load: 'secondes' },
            { slug: 'crunch',                     sets: 3, repsMin: 12, repsMax: 15, rest: 30, load: 'poids du corps' },
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

// Exécuté seulement si lancé en CLI (npm run seed:templates).
// Permet à d'autres modules (route API admin) de require ce fichier
// pour réutiliser TEMPLATES sans re-déclencher main().
if (require.main === module) {
  main()
    .then(async () => { await prisma.$disconnect() })
    .catch(async (e) => {
      console.error('[seed:templates] erreur :', e?.message || e)
      await prisma.$disconnect()
      process.exit(1)
    })
}

module.exports = { TEMPLATES, main }
