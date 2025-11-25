/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Regime module for MemNode core architecture.
 * 
 * Provides production-ready regime generation with:
 * - Precise scoring and tier selection matching Engine-C logic
 * - Context-aware state determination
 * - Protective logic for narrative and live operators
 * - Default payloads for RegimeCard integration
 * 
 * @packageDocumentation
 */

// Type exports
export type {
  RegimeInput,
  RegimeOutput,
  RegimeTier,
  RegimeState,
  RegimeScores,
  RegimePayload,
  RegimeTransition,
  RegimeThresholds,
  OperatorMode,
} from './types';

// Main function exports
export {
  generateRegimeFromState,
  validateRegimeInput,
} from './generateRegimeFromState';

// Hook exports
export {
  useRegime,
  clearRegimeCache,
  getCachedRegime,
  useRegimeWithProvider,
} from './useRegime';

export type { UseRegimeOptions } from './useRegime';
