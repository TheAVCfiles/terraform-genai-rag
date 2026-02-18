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

import {
  RegimeInput,
  RegimeOutput,
  RegimeTier,
  RegimeState,
  RegimeScores,
  RegimePayload,
  RegimeTransition,
  RegimeThresholds,
} from './types';

/**
 * Default thresholds for tier selection.
 * Calibrated for natural risk choreography.
 */
const DEFAULT_THRESHOLDS: Required<RegimeThresholds> = {
  elevated: 25,
  heightened: 50,
  critical: 75,
};

/**
 * Score weights for composite calculation.
 * Balanced to prioritize clarity while respecting momentum dynamics.
 * Note: Weights must sum to 1.0 (0.30 + 0.25 + 0.20 + 0.25 = 1.00)
 */
const SCORE_WEIGHTS = {
  clarity: 0.30,
  momentum: 0.25,
  phase: 0.20,
  burden: 0.25,
} as const;

/**
 * Tier metadata for visual representation and display.
 */
const TIER_METADATA: Record<RegimeTier, { label: string; color: string; icon: string; priority: number }> = {
  baseline: { label: 'Baseline', color: '#22c55e', icon: 'shield-check', priority: 4 },
  elevated: { label: 'Elevated', color: '#eab308', icon: 'shield-alert', priority: 3 },
  heightened: { label: 'Heightened', color: '#f97316', icon: 'shield-exclamation', priority: 2 },
  critical: { label: 'Critical', color: '#ef4444', icon: 'shield-x', priority: 1 },
};

/**
 * State descriptions for payload generation.
 */
const STATE_DESCRIPTIONS: Record<RegimeState, string> = {
  stable: 'System operating within normal parameters',
  transitional: 'Regime shift in progress, monitor closely',
  volatile: 'High variability detected, protective measures recommended',
  protective: 'Protective protocols active, defensive posture engaged',
};

/**
 * Clamps a value to the specified range.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Normalizes momentum score from [-100, 100] to [0, 100].
 * Higher absolute momentum contributes more to risk.
 */
function normalizeMomentum(momentum: number): number {
  return Math.abs(clamp(momentum, -100, 100));
}

/**
 * Calculates the weighted composite score from individual components.
 * Implements Engine-C scoring logic with context-aware balancing.
 */
function calculateCompositeScore(scores: Omit<RegimeScores, 'weighted'>): number {
  const normalizedMomentum = normalizeMomentum(scores.momentum);
  
  const weighted =
    scores.clarity * SCORE_WEIGHTS.clarity +
    normalizedMomentum * SCORE_WEIGHTS.momentum +
    scores.phase * SCORE_WEIGHTS.phase +
    scores.burden * SCORE_WEIGHTS.burden;
  
  return clamp(Math.round(weighted * 100) / 100, 0, 100);
}

/**
 * Determines the regime tier based on composite score and thresholds.
 * Implements precise tier selection matching Engine-C logic.
 */
function selectTier(compositeScore: number, thresholds: Required<RegimeThresholds>): RegimeTier {
  if (compositeScore >= thresholds.critical) {
    return 'critical';
  }
  if (compositeScore >= thresholds.heightened) {
    return 'heightened';
  }
  if (compositeScore >= thresholds.elevated) {
    return 'elevated';
  }
  return 'baseline';
}

/**
 * Determines the regime state based on scores and transition context.
 * Implements state determination logic with protective awareness.
 */
function determineState(
  input: RegimeInput,
  compositeScore: number,
  tier: RegimeTier,
): RegimeState {
  // Protective state takes precedence when burden is critical
  if (input.burdenScore >= 80 || (input.operatorMode === 'live' && compositeScore >= 75)) {
    return 'protective';
  }
  
  // Volatile state when high variability detected
  if (Math.abs(input.momentumScore) >= 70 || input.clarityScore <= 30) {
    return 'volatile';
  }
  
  // Transitional state when significant change from previous regime
  if (input.previousRegime) {
    const tierOrder: RegimeTier[] = ['baseline', 'elevated', 'heightened', 'critical'];
    const currentIndex = tierOrder.indexOf(tier);
    const previousIndex = tierOrder.indexOf(input.previousRegime.tier);
    
    if (Math.abs(currentIndex - previousIndex) >= 1) {
      return 'transitional';
    }
  }
  
  return 'stable';
}

/**
 * Determines transition direction when regime changes.
 */
function determineTransitionDirection(
  fromTier: RegimeTier,
  toTier: RegimeTier,
): 'escalating' | 'de-escalating' | 'lateral' {
  const tierOrder: RegimeTier[] = ['baseline', 'elevated', 'heightened', 'critical'];
  const fromIndex = tierOrder.indexOf(fromTier);
  const toIndex = tierOrder.indexOf(toTier);
  
  if (toIndex > fromIndex) {
    return 'escalating';
  }
  if (toIndex < fromIndex) {
    return 'de-escalating';
  }
  return 'lateral';
}

/**
 * Generates recommendations based on current regime.
 * Context-aware for both narrative and live operators.
 */
function generateRecommendations(
  tier: RegimeTier,
  state: RegimeState,
  operatorMode?: 'narrative' | 'live',
): string[] {
  const recommendations: string[] = [];
  
  // Base recommendations by tier
  switch (tier) {
    case 'critical':
      recommendations.push('Activate maximum protective protocols');
      recommendations.push('Reduce exposure immediately');
      recommendations.push('Review all active positions');
      break;
    case 'heightened':
      recommendations.push('Increase monitoring frequency');
      recommendations.push('Prepare contingency measures');
      recommendations.push('Evaluate risk thresholds');
      break;
    case 'elevated':
      recommendations.push('Monitor key indicators closely');
      recommendations.push('Review protective positions');
      break;
    case 'baseline':
      recommendations.push('Maintain standard operations');
      break;
  }
  
  // State-specific recommendations
  if (state === 'volatile') {
    recommendations.push('Exercise caution with new commitments');
  }
  if (state === 'transitional') {
    recommendations.push('Await regime stabilization before major decisions');
  }
  if (state === 'protective') {
    recommendations.push('Prioritize capital preservation');
  }
  
  // Operator-mode specific recommendations
  if (operatorMode === 'live') {
    recommendations.push('Ensure real-time monitoring is active');
  }
  if (operatorMode === 'narrative') {
    recommendations.push('Document regime conditions for analysis');
  }
  
  return recommendations;
}

/**
 * Generates the default payload for RegimeCard integration.
 */
function generatePayload(
  tier: RegimeTier,
  state: RegimeState,
  operatorMode?: 'narrative' | 'live',
): RegimePayload {
  const metadata = TIER_METADATA[tier];
  
  return {
    title: `${metadata.label} Regime`,
    description: STATE_DESCRIPTIONS[state],
    icon: metadata.icon,
    priority: metadata.priority,
    protectiveActive: state === 'protective',
    recommendations: generateRecommendations(tier, state, operatorMode),
  };
}

/**
 * Generates regime output from the current state.
 * 
 * This is the main entry point implementing Engine-C logic for:
 * - Precise scoring with weighted composite calculation
 * - Tier selection with configurable thresholds
 * - State determination with protective awareness
 * - Default payloads for seamless RegimeCard integration
 * 
 * Designed to integrate with MemNode core architecture and ensure
 * natural risk choreography for both narrative and live operators.
 * 
 * @param input - The regime input containing all scoring components
 * @returns Complete regime output with tier, state, and payload
 * 
 * @example
 * ```typescript
 * const regime = generateRegimeFromState({
 *   day: 1,
 *   clarityScore: 75,
 *   momentumScore: 20,
 *   phaseScore: 50,
 *   burdenScore: 30,
 *   operatorMode: 'live',
 * });
 * 
 * console.log(regime.tier); // 'elevated'
 * console.log(regime.payload.recommendations);
 * ```
 */
export function generateRegimeFromState(input: RegimeInput): RegimeOutput {
  // Validate and clamp input scores
  const scores: Omit<RegimeScores, 'weighted'> = {
    clarity: clamp(input.clarityScore, 0, 100),
    momentum: clamp(input.momentumScore, -100, 100),
    phase: clamp(input.phaseScore, 0, 100),
    burden: clamp(input.burdenScore, 0, 100),
  };
  
  // Apply thresholds with defaults
  const thresholds: Required<RegimeThresholds> = {
    ...DEFAULT_THRESHOLDS,
    ...input.thresholds,
  };
  
  // Calculate composite score
  const compositeScore = calculateCompositeScore(scores);
  
  // Determine tier and state
  const tier = selectTier(compositeScore, thresholds);
  const state = determineState(input, compositeScore, tier);
  
  // Get tier metadata
  const metadata = TIER_METADATA[tier];
  
  // Build scores with weighted composite
  const fullScores: RegimeScores = {
    ...scores,
    weighted: compositeScore,
  };
  
  // Determine transition if previous regime exists
  let transition: RegimeTransition | undefined;
  if (input.previousRegime && input.previousRegime.tier !== tier) {
    transition = {
      fromTier: input.previousRegime.tier,
      fromState: input.previousRegime.state,
      direction: determineTransitionDirection(input.previousRegime.tier, tier),
      transitionedAt: Date.now(),
    };
  }
  
  // Generate output
  const output: RegimeOutput = {
    tier,
    state,
    compositeScore,
    scores: fullScores,
    timestamp: Date.now(),
    day: input.day,
    label: metadata.label,
    color: metadata.color,
    payload: generatePayload(tier, state, input.operatorMode),
    transition,
  };
  
  return output;
}

/**
 * Validates regime input and returns validation errors if any.
 * Useful for pre-validation before calling generateRegimeFromState.
 */
export function validateRegimeInput(input: unknown): string[] {
  const errors: string[] = [];
  
  if (!input || typeof input !== 'object') {
    errors.push('Input must be an object');
    return errors;
  }
  
  const obj = input as Record<string, unknown>;
  
  if (typeof obj.day !== 'number' || !Number.isFinite(obj.day)) {
    errors.push('day must be a finite number');
  }
  
  if (typeof obj.clarityScore !== 'number' || !Number.isFinite(obj.clarityScore)) {
    errors.push('clarityScore must be a finite number');
  }
  
  if (typeof obj.momentumScore !== 'number' || !Number.isFinite(obj.momentumScore)) {
    errors.push('momentumScore must be a finite number');
  }
  
  if (typeof obj.phaseScore !== 'number' || !Number.isFinite(obj.phaseScore)) {
    errors.push('phaseScore must be a finite number');
  }
  
  if (typeof obj.burdenScore !== 'number' || !Number.isFinite(obj.burdenScore)) {
    errors.push('burdenScore must be a finite number');
  }
  
  if (obj.operatorMode !== undefined && obj.operatorMode !== 'narrative' && obj.operatorMode !== 'live') {
    errors.push('operatorMode must be "narrative" or "live"');
  }
  
  return errors;
}
