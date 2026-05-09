import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireCoach } from '@/lib/api-auth'
import {
  VALID_MUSCLE, VALID_LEVEL, VALID_GOAL,
  validateExercisePayload, slugify,
} from '@/lib/exercise-library'

/**
 * GET /api/exercise-library
 *
 * Query params (tous optionnels) :
 *   - q              : recherche full-text simple (name + description)
 *   - muscle         : groupe musculaire principal (ex: PECTORAUX)
 *   - level          : DEBUTANT | INTERMEDIAIRE | AVANCE
 *   - goal           : PRISE_MASSE | … (filtre sur goalTags array contains)
 *   - equipment      : item d'équipement (filtre sur equipment array contains)
 *   - includeArchived: '1' pour inclure les archivés (défaut : actifs uniquement)
 *
 * Garde requireCoach.
 */
export async function GET(req) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  const { searchParams } = new URL(req.url)
  const q          = searchParams.get('q')?.trim() || ''
  const muscle     = searchParams.get('muscle') || ''
  const level      = searchParams.get('level') || ''
  const goal       = searchParams.get('goal') || ''
  const equipment  = searchParams.get('equipment') || ''
  const archived   = searchParams.get('includeArchived') === '1'

  const where = {}
  if (!archived) where.isActive = true
  if (muscle && VALID_MUSCLE.has(muscle)) where.primaryMuscleGroup = muscle
  if (level && VALID_LEVEL.has(level))    where.level = level
  if (goal && VALID_GOAL.has(goal))       where.goalTags = { has: goal }
  if (equipment)                          where.equipment = { has: equipment }
  if (q) {
    where.OR = [
      { name:        { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ]
  }

  const items = await prisma.exerciseLibrary.findMany({
    where,
    orderBy: [
      { isActive: 'desc' },
      { primaryMuscleGroup: 'asc' },
      { name: 'asc' },
    ],
    take: 500, // garde-fou
  })

  // Compteurs utiles pour la barre de filtres.
  const total    = await prisma.exerciseLibrary.count({ where: { isActive: true } })
  const archivedCount = await prisma.exerciseLibrary.count({ where: { isActive: false } })

  return NextResponse.json({ items, total, archivedCount })
}

/**
 * POST /api/exercise-library
 * Crée un exercice. Slug généré depuis `name` si non fourni.
 */
export async function POST(req) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }

  const v = validateExercisePayload(body, { requireName: true })
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })

  const slug = body.slug ? slugify(body.slug) : slugify(v.data.name)
  if (!slug) return NextResponse.json({ error: 'Slug calculé vide — renomme l\'exercice.' }, { status: 400 })

  const existing = await prisma.exerciseLibrary.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json({ error: `Slug "${slug}" déjà utilisé` }, { status: 409 })
  }

  const created = await prisma.exerciseLibrary.create({
    data: {
      slug,
      name: v.data.name,
      description:           v.data.description ?? '',
      primaryMuscleGroup:    v.data.primaryMuscleGroup,
      secondaryMuscleGroups: v.data.secondaryMuscleGroups ?? [],
      equipment:             v.data.equipment ?? [],
      level:                 v.data.level ?? 'DEBUTANT',
      goalTags:              v.data.goalTags ?? [],
      instructions:          v.data.instructions ?? '',
      commonMistakes:        v.data.commonMistakes ?? [],
      contraindications:     v.data.contraindications ?? [],
      mediaUrl:              v.data.mediaUrl ?? null,
      isActive:              true,
    },
  })

  return NextResponse.json(created, { status: 201 })
}
