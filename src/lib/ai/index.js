/**
 * Barrel d'exports IA. Permet d'écrire :
 *   import { generateProgramme, draftReviewForLog } from '@/lib/ai'
 */

export { isAiConfigured, runTool, DEFAULT_MODEL } from './client'
export { generateProgramme } from './program-generation'
export { suggestReplacement, applyReplacement } from './exercise-replacement'
export { draftReviewForLog } from './coach-review'
export { safetyCheckForProgramGeneration, VALID_REPLACEMENT_REASONS } from './safety'
export { recordUsage, getRecentUsageSummary } from './cost-tracking'
