-- AlterTable
ALTER TABLE "ClientProgramme" ADD COLUMN     "coachNotes" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "currentSession" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "currentWeek" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "personalAdaptations" JSONB,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIF',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "ExerciseLibrary" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "primaryMuscleGroup" TEXT NOT NULL,
    "secondaryMuscleGroups" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "equipment" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "level" TEXT NOT NULL DEFAULT 'DEBUTANT',
    "goalTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "instructions" TEXT NOT NULL DEFAULT '',
    "commonMistakes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "contraindications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mediaUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseLibrary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgrammeWeek" (
    "id" TEXT NOT NULL,
    "programmeId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgrammeWeek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgrammeSession" (
    "id" TEXT NOT NULL,
    "programmeWeekId" TEXT NOT NULL,
    "sessionNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "focus" TEXT NOT NULL DEFAULT '',
    "estimatedDurationMinutes" INTEGER NOT NULL DEFAULT 45,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgrammeSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionExercise" (
    "id" TEXT NOT NULL,
    "programmeSessionId" TEXT NOT NULL,
    "exerciseLibraryId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL DEFAULT 3,
    "repsMin" INTEGER NOT NULL DEFAULT 8,
    "repsMax" INTEGER NOT NULL DEFAULT 12,
    "targetLoad" TEXT NOT NULL DEFAULT '',
    "restSeconds" INTEGER NOT NULL DEFAULT 60,
    "tempo" TEXT NOT NULL DEFAULT '',
    "targetRpe" INTEGER,
    "coachNotes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutLog" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientProgrammeId" TEXT,
    "programmeSessionId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "perceivedDifficulty" INTEGER,
    "clientNotes" TEXT NOT NULL DEFAULT '',
    "coachReviewNotes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutSetLog" (
    "id" TEXT NOT NULL,
    "workoutLogId" TEXT NOT NULL,
    "sessionExerciseId" TEXT,
    "setNumber" INTEGER NOT NULL,
    "targetReps" TEXT NOT NULL DEFAULT '',
    "actualReps" INTEGER,
    "targetLoad" TEXT NOT NULL DEFAULT '',
    "actualLoad" DOUBLE PRECISION,
    "rpe" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutSetLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseLibrary_slug_key" ON "ExerciseLibrary"("slug");

-- CreateIndex
CREATE INDEX "ExerciseLibrary_primaryMuscleGroup_idx" ON "ExerciseLibrary"("primaryMuscleGroup");

-- CreateIndex
CREATE INDEX "ExerciseLibrary_level_idx" ON "ExerciseLibrary"("level");

-- CreateIndex
CREATE INDEX "ExerciseLibrary_isActive_idx" ON "ExerciseLibrary"("isActive");

-- CreateIndex
CREATE INDEX "ExerciseLibrary_createdAt_idx" ON "ExerciseLibrary"("createdAt");

-- CreateIndex
CREATE INDEX "ProgrammeWeek_programmeId_idx" ON "ProgrammeWeek"("programmeId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgrammeWeek_programmeId_weekNumber_key" ON "ProgrammeWeek"("programmeId", "weekNumber");

-- CreateIndex
CREATE INDEX "ProgrammeSession_programmeWeekId_idx" ON "ProgrammeSession"("programmeWeekId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgrammeSession_programmeWeekId_sessionNumber_key" ON "ProgrammeSession"("programmeWeekId", "sessionNumber");

-- CreateIndex
CREATE INDEX "SessionExercise_programmeSessionId_idx" ON "SessionExercise"("programmeSessionId");

-- CreateIndex
CREATE INDEX "SessionExercise_exerciseLibraryId_idx" ON "SessionExercise"("exerciseLibraryId");

-- CreateIndex
CREATE INDEX "WorkoutLog_clientId_idx" ON "WorkoutLog"("clientId");

-- CreateIndex
CREATE INDEX "WorkoutLog_clientProgrammeId_idx" ON "WorkoutLog"("clientProgrammeId");

-- CreateIndex
CREATE INDEX "WorkoutLog_programmeSessionId_idx" ON "WorkoutLog"("programmeSessionId");

-- CreateIndex
CREATE INDEX "WorkoutLog_status_idx" ON "WorkoutLog"("status");

-- CreateIndex
CREATE INDEX "WorkoutLog_startedAt_idx" ON "WorkoutLog"("startedAt");

-- CreateIndex
CREATE INDEX "WorkoutSetLog_workoutLogId_idx" ON "WorkoutSetLog"("workoutLogId");

-- CreateIndex
CREATE INDEX "WorkoutSetLog_sessionExerciseId_idx" ON "WorkoutSetLog"("sessionExerciseId");

-- CreateIndex
CREATE INDEX "ClientProgramme_clientId_idx" ON "ClientProgramme"("clientId");

-- CreateIndex
CREATE INDEX "ClientProgramme_status_idx" ON "ClientProgramme"("status");

-- CreateIndex
CREATE INDEX "ClientProgramme_startDate_idx" ON "ClientProgramme"("startDate");

-- AddForeignKey
ALTER TABLE "ProgrammeWeek" ADD CONSTRAINT "ProgrammeWeek_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgrammeSession" ADD CONSTRAINT "ProgrammeSession_programmeWeekId_fkey" FOREIGN KEY ("programmeWeekId") REFERENCES "ProgrammeWeek"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionExercise" ADD CONSTRAINT "SessionExercise_programmeSessionId_fkey" FOREIGN KEY ("programmeSessionId") REFERENCES "ProgrammeSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionExercise" ADD CONSTRAINT "SessionExercise_exerciseLibraryId_fkey" FOREIGN KEY ("exerciseLibraryId") REFERENCES "ExerciseLibrary"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutLog" ADD CONSTRAINT "WorkoutLog_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutLog" ADD CONSTRAINT "WorkoutLog_clientProgrammeId_fkey" FOREIGN KEY ("clientProgrammeId") REFERENCES "ClientProgramme"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutLog" ADD CONSTRAINT "WorkoutLog_programmeSessionId_fkey" FOREIGN KEY ("programmeSessionId") REFERENCES "ProgrammeSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSetLog" ADD CONSTRAINT "WorkoutSetLog_workoutLogId_fkey" FOREIGN KEY ("workoutLogId") REFERENCES "WorkoutLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSetLog" ADD CONSTRAINT "WorkoutSetLog_sessionExerciseId_fkey" FOREIGN KEY ("sessionExerciseId") REFERENCES "SessionExercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

