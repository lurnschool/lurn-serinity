import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireCoach } from '@/lib/api-auth'

const VALID_OBJECTIFS = new Set(['remise_forme','perte_poids','prise_masse','endurance','force','souplesse'])
const VALID_NIVEAUX   = new Set(['debutant','intermediaire','avance'])

/**
 * GET /api/programme-builder/[id]
 * Charge un programme avec sa structure complète : semaines → séances →
 * exercices prescrits → exercice de la bibliothèque (name + slug + level
 * uniquement, suffisant pour le builder).
 */
export async function GET(_req, { params }) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  const programme = await prisma.programme.findUnique({
    where: { id: params.id },
    include: {
      weeks: {
        orderBy: { weekNumber: 'asc' },
        include: {
          sessions: {
            orderBy: { sessionNumber: 'asc' },
            include: {
              sessionExercises: {
                orderBy: { order: 'asc' },
                include: {
                  exerciseLibrary: {
                    select: {
                      id: true, name: true, slug: true, level: true,
                      primaryMuscleGroup: true, equipment: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      _count: { select: { clients: true } },
    },
  })

  if (!programme) return NextResponse.json({ error: 'Programme introuvable' }, { status: 404 })
  return NextResponse.json(programme)
}

/**
 * PATCH /api/programme-builder/[id]
 * Met à jour les méta-infos du programme uniquement (nom, description,
 * objectif, niveau, durée). La structure (weeks/sessions/exercises) passe
 * par les opérations dédiées.
 */
export async function PATCH(req, { params }) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }

  const data = {}
  if (body.nom !== undefined) {
    const nom = (body.nom || '').trim()
    if (!nom || nom.length < 2) return NextResponse.json({ error: 'nom invalide' }, { status: 400 })
    data.nom = nom
  }
  if (body.description !== undefined) data.description = String(body.description || '')
  if (body.objectif !== undefined) {
    if (!VALID_OBJECTIFS.has(body.objectif)) return NextResponse.json({ error: 'objectif invalide' }, { status: 400 })
    data.objectif = body.objectif
  }
  if (body.niveau !== undefined) {
    if (!VALID_NIVEAUX.has(body.niveau)) return NextResponse.json({ error: 'niveau invalide' }, { status: 400 })
    data.niveau = body.niveau
  }
  if (body.duree !== undefined) {
    const duree = Number(body.duree)
    if (!Number.isFinite(duree) || duree < 1 || duree > 52) {
      return NextResponse.json({ error: 'duree invalide (1-52)' }, { status: 400 })
    }
    data.duree = Math.round(duree)
  }

  const updated = await prisma.programme.update({
    where: { id: params.id },
    data,
  }).catch(() => null)

  if (!updated) return NextResponse.json({ error: 'Programme introuvable' }, { status: 404 })
  return NextResponse.json(updated)
}

/**
 * DELETE /api/programme-builder/[id]
 * Suppression dure (cascade automatique sur weeks/sessions/exercises via
 * `onDelete: Cascade` dans le schema). Bloquée si des assignations
 * adhérent existent (sécurité de l'historique).
 */
export async function DELETE(_req, { params }) {
  const auth = await requireCoach()
  if (auth.error) return auth.error

  const count = await prisma.clientProgramme.count({ where: { programmeId: params.id } })
  if (count > 0) {
    return NextResponse.json({
      error: `Impossible de supprimer : ${count} adhérent(s) suit(vent) ce programme. Archivez-le plutôt côté assignations.`,
    }, { status: 409 })
  }

  await prisma.programme.delete({ where: { id: params.id } }).catch(() => null)
  return NextResponse.json({ deleted: true })
}
