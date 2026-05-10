-- Migration: TrackCoach Premium Autonomous OS
-- Sprint 4 — additif uniquement, aucun drop ni rename, safe à déployer.
--
-- 1. Enrichit ExerciseLibrary avec une couche média complète (type, source,
--    licence, attribution, statut de validation, démonstrations).
-- 2. Crée AiUsageLog pour le tracking coût/latence/modèle/tokens des appels IA.
-- 3. Crée AiProgramRequest pour conserver la trace des générations IA et leur
--    statut (pending validation coach / approved / rejected).
-- 4. Étend Client avec champs onboarding premium spécifiques (matériel,
--    durée séance préférée, consentement IA).
-- 5. Étend WorkoutLog avec un champ aiReviewDraft pour la pré-rédaction IA.

-- AlterTable: ExerciseLibrary — couche média
ALTER TABLE "ExerciseLibrary"
  ADD COLUMN "mediaType"          TEXT    NOT NULL DEFAULT 'none',
  ADD COLUMN "thumbnailUrl"       TEXT,
  ADD COLUMN "videoProvider"      TEXT,
  ADD COLUMN "mediaSource"        TEXT,
  ADD COLUMN "mediaLicense"       TEXT,
  ADD COLUMN "mediaAttribution"   TEXT,
  ADD COLUMN "mediaStatus"        TEXT    NOT NULL DEFAULT 'pending',
  ADD COLUMN "muscleMapUrl"       TEXT,
  ADD COLUMN "animationUrl"       TEXT,
  ADD COLUMN "demonstrationType"  TEXT    NOT NULL DEFAULT 'static',
  ADD COLUMN "lastMediaReviewAt"  TIMESTAMP(3);

-- AlterTable: Client — préférences onboarding premium
ALTER TABLE "Client"
  ADD COLUMN "preferredEquipment"      TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "preferredSessionMinutes" INTEGER,
  ADD COLUMN "preferredFrequency"      INTEGER,
  ADD COLUMN "physicalRestrictions"    TEXT NOT NULL DEFAULT '',
  ADD COLUMN "aiConsent"               BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "aiConsentAt"             TIMESTAMP(3);

-- AlterTable: WorkoutLog — pré-rédaction IA retour coach
ALTER TABLE "WorkoutLog"
  ADD COLUMN "aiReviewDraft"           TEXT,
  ADD COLUMN "aiReviewGeneratedAt"     TIMESTAMP(3);

-- CreateTable: AiUsageLog
CREATE TABLE "AiUsageLog" (
  "id"             TEXT          NOT NULL,
  "createdAt"      TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "kind"           TEXT          NOT NULL,
  "model"          TEXT          NOT NULL,
  "userId"         TEXT,
  "clientId"       TEXT,
  "inputTokens"    INTEGER,
  "outputTokens"   INTEGER,
  "latencyMs"      INTEGER,
  "estimatedCost"  DOUBLE PRECISION,
  "status"         TEXT          NOT NULL DEFAULT 'success',
  "errorMessage"   TEXT,
  "metadata"       JSONB,

  CONSTRAINT "AiUsageLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AiUsageLog_createdAt_idx" ON "AiUsageLog"("createdAt");
CREATE INDEX "AiUsageLog_kind_idx"      ON "AiUsageLog"("kind");
CREATE INDEX "AiUsageLog_userId_idx"    ON "AiUsageLog"("userId");
CREATE INDEX "AiUsageLog_clientId_idx"  ON "AiUsageLog"("clientId");

-- CreateTable: AiProgramRequest
CREATE TABLE "AiProgramRequest" (
  "id"                  TEXT          NOT NULL,
  "createdAt"           TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"           TIMESTAMP(3)  NOT NULL,
  "clientId"            TEXT          NOT NULL,
  "requestedByUserId"   TEXT,
  "objectif"            TEXT          NOT NULL,
  "niveau"              TEXT          NOT NULL,
  "weeks"               INTEGER       NOT NULL,
  "sessionsPerWeek"     INTEGER       NOT NULL,
  "equipment"           TEXT[]        DEFAULT ARRAY[]::TEXT[],
  "restrictions"        TEXT          NOT NULL DEFAULT '',
  "extraInstructions"   TEXT          NOT NULL DEFAULT '',
  "status"              TEXT          NOT NULL DEFAULT 'pending_validation',
  "programmeId"         TEXT,
  "draftSummary"        JSONB,
  "rejectionReason"     TEXT,
  "approvedAt"          TIMESTAMP(3),
  "approvedByUserId"    TEXT,

  CONSTRAINT "AiProgramRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AiProgramRequest_clientId_idx" ON "AiProgramRequest"("clientId");
CREATE INDEX "AiProgramRequest_status_idx"   ON "AiProgramRequest"("status");
CREATE INDEX "AiProgramRequest_createdAt_idx" ON "AiProgramRequest"("createdAt");

-- AddForeignKey
ALTER TABLE "AiProgramRequest"
  ADD CONSTRAINT "AiProgramRequest_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "Client"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AiProgramRequest"
  ADD CONSTRAINT "AiProgramRequest_programmeId_fkey"
  FOREIGN KEY ("programmeId") REFERENCES "Programme"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
