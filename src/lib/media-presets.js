/**
 * Préréglages média curated — TrackCoach.
 *
 * Photos Unsplash sélectionnées manuellement pour leur qualité et leur
 * pertinence sport/fitness. Hotlinkées via le CDN Unsplash
 * (`images.unsplash.com`) — usage commercial autorisé par la
 * licence Unsplash (https://unsplash.com/license), aucune attribution
 * obligatoire mais on en affiche une dans le composant lecteur.
 *
 * Chaque entrée pointe vers une `photo-id` Unsplash curated. On sert
 * en `w=1200&q=80&auto=format&fit=crop` pour rester léger sur mobile.
 *
 * Pas de hotlink anarchique : on ne référence QUE des photos Unsplash
 * dont la licence permet le commercial. Les photos avec personnes
 * reconnaissables sont assumées (Unsplash demande aux contributeurs
 * d'obtenir le model release pour ces cas).
 */

const UNSPLASH = (id, opts = {}) => {
  const w = opts.w || 1200
  const q = opts.q || 80
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=${q}&auto=format&fit=crop`
}

// === HEROS PAR OBJECTIF ====================================================
// Photos plein cadre pour les cards "programme" du catalogue.
export const OBJECTIF_HEROS = {
  remise_forme: {
    url: UNSPLASH('1517836357463-d25dfeac3438'), // gym setup
    credit: 'Photo via Unsplash',
  },
  perte_poids: {
    url: UNSPLASH('1538805060514-97d9cc17730c'), // running outdoor
    credit: 'Photo via Unsplash',
  },
  prise_masse: {
    url: UNSPLASH('1581009146145-b5ef050c2e1e'), // bench press
    credit: 'Photo via Unsplash',
  },
  endurance: {
    url: UNSPLASH('1518611012118-696072aa579a'), // cycling
    credit: 'Photo via Unsplash',
  },
  force: {
    url: UNSPLASH('1574680096145-d05b474e2155'), // barbell deadlift
    credit: 'Photo via Unsplash',
  },
  souplesse: {
    url: UNSPLASH('1544367567-0f2fcb009e0b'), // yoga stretch
    credit: 'Photo via Unsplash',
  },
}

// === HEROS PAR GROUPE MUSCULAIRE ===========================================
// Photos d'exercices ou de muscles ciblés. Utilisées en fallback dans
// `ExerciseMediaPlayer` quand aucun média propre n'est disponible.
export const MUSCLE_HEROS = {
  PECTORAUX:  { url: UNSPLASH('1581009146145-b5ef050c2e1e'),  credit: 'Photo via Unsplash' }, // bench
  DOS:        { url: UNSPLASH('1599058917212-d750089bc07e'),  credit: 'Photo via Unsplash' }, // back / pull
  EPAULES:    { url: UNSPLASH('1534438327276-14e5300c3a48'),  credit: 'Photo via Unsplash' }, // shoulders
  BICEPS:     { url: UNSPLASH('1583454110551-21f2fa2afe61'),  credit: 'Photo via Unsplash' }, // arms
  TRICEPS:    { url: UNSPLASH('1581009146145-b5ef050c2e1e'),  credit: 'Photo via Unsplash' }, // press / triceps
  JAMBES:     { url: UNSPLASH('1574680096145-d05b474e2155'),  credit: 'Photo via Unsplash' }, // legs / barbell
  FESSIERS:   { url: UNSPLASH('1571019613454-1cb2f99b2d8b'),  credit: 'Photo via Unsplash' }, // glutes
  ABDOS:      { url: UNSPLASH('1571019613454-1cb2f99b2d8b'),  credit: 'Photo via Unsplash' }, // core / abs
  MOLLETS:    { url: UNSPLASH('1538805060514-97d9cc17730c'),  credit: 'Photo via Unsplash' }, // running calves
  AVANT_BRAS: { url: UNSPLASH('1583454110551-21f2fa2afe61'),  credit: 'Photo via Unsplash' }, // forearms
  FULL_BODY:  { url: UNSPLASH('1517836357463-d25dfeac3438'),  credit: 'Photo via Unsplash' }, // full gym
  CARDIO:     { url: UNSPLASH('1518611012118-696072aa579a'),  credit: 'Photo via Unsplash' }, // cycling cardio
}

// === HEROS PAR ÉQUIPEMENT (wizard onboarding) ==============================
export const EQUIPMENT_HEROS = {
  bodyweight:     UNSPLASH('1571019613454-1cb2f99b2d8b', { w: 600 }),  // bodyweight
  dumbbell:       UNSPLASH('1583454110551-21f2fa2afe61', { w: 600 }),  // dumbbells
  barbell:        UNSPLASH('1574680096145-d05b474e2155', { w: 600 }),  // barbell
  kettlebell:     UNSPLASH('1517836357463-d25dfeac3438', { w: 600 }),  // gym setup
  cable:          UNSPLASH('1534438327276-14e5300c3a48', { w: 600 }),  // cable machine
  machine:        UNSPLASH('1517836357463-d25dfeac3438', { w: 600 }),  // gym
  bench:          UNSPLASH('1581009146145-b5ef050c2e1e', { w: 600 }),  // bench
  pullup_bar:     UNSPLASH('1599058917212-d750089bc07e', { w: 600 }),  // pull up
  bands:          UNSPLASH('1544367567-0f2fcb009e0b',   { w: 600 }),  // resistance bands / yoga
  cardio_machine: UNSPLASH('1538805060514-97d9cc17730c', { w: 600 }),  // running cardio
}

// === Helpers ==============================================================
export function heroForObjectif(v) {
  return OBJECTIF_HEROS[v] || OBJECTIF_HEROS.remise_forme
}
export function heroForMuscle(v) {
  return MUSCLE_HEROS[v] || MUSCLE_HEROS.FULL_BODY
}
export function heroForEquipment(v) {
  return EQUIPMENT_HEROS[v] || EQUIPMENT_HEROS.bodyweight
}
