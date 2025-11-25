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
 * Regime tier levels representing risk and operational states.
 * Ordered from lowest to highest operational intensity.
 */
export type RegimeTier = 'baseline' | 'elevated' | 'heightened' | 'critical';

/**
 * Regime state representing the overall system operational mode.
 */
export type RegimeState = 'stable' | 'transitional' | 'volatile' | 'protective';

/**
 * Operator mode for differentiating narrative vs live operational contexts.
 */
export type OperatorMode = 'narrative' | 'live';

/**
 * Input interface for generating regime from current state.
 * Contains all scoring components used in regime calculation.
 */
export interface RegimeInput {
  /** Day identifier for temporal context (e.g., epoch day or sequential day number) */
  day: number;
  
  /** Clarity score (0-100): Measures how clear/unambiguous the current signals are */
  clarityScore: number;
  
  /** Momentum score (-100 to 100): Measures directional pressure (negative = bearish, positive = bullish) */
  momentumScore: number;
  
  /** Phase score (0-100): Measures where in the cycle the system currently sits */
  phaseScore: number;
  
  /** Burden score (0-100): Measures system load/stress factors */
  burdenScore: number;
  
  /** Optional operator mode for context-aware protective logic */
  operatorMode?: OperatorMode;
  
  /** Optional previous regime state for transition smoothing */
  previousRegime?: RegimeOutput;
  
  /** Optional custom thresholds for tier selection */
  thresholds?: RegimeThresholds;
}

/**
 * Custom threshold configuration for tier selection.
 */
export interface RegimeThresholds {
  /** Threshold for elevated tier (default: 25) */
  elevated?: number;
  
  /** Threshold for heightened tier (default: 50) */
  heightened?: number;
  
  /** Threshold for critical tier (default: 75) */
  critical?: number;
}

/**
 * Output interface containing complete regime determination.
 * Designed for integration with RegimeCard and HUD rendering pipelines.
 */
export interface RegimeOutput {
  /** The determined regime tier */
  tier: RegimeTier;
  
  /** The determined regime state */
  state: RegimeState;
  
  /** Composite risk score (0-100) */
  compositeScore: number;
  
  /** Individual scoring components for transparency */
  scores: RegimeScores;
  
  /** Timestamp of regime generation */
  timestamp: number;
  
  /** Day this regime was generated for */
  day: number;
  
  /** Human-readable label for display */
  label: string;
  
  /** CSS-compatible color code for visual representation */
  color: string;
  
  /** Default payload for seamless RegimeCard integration */
  payload: RegimePayload;
  
  /** Transition metadata if regime changed */
  transition?: RegimeTransition;
}

/**
 * Individual scoring components included in output for transparency.
 */
export interface RegimeScores {
  clarity: number;
  momentum: number;
  phase: number;
  burden: number;
  /** Computed weighted composite */
  weighted: number;
}

/**
 * Default payload structure for RegimeCard integration.
 */
export interface RegimePayload {
  /** Display title */
  title: string;
  
  /** Short description of current regime */
  description: string;
  
  /** Icon identifier for visual representation */
  icon: string;
  
  /** Priority level for rendering order (1=highest) */
  priority: number;
  
  /** Whether protective measures are active */
  protectiveActive: boolean;
  
  /** Recommended actions based on current regime */
  recommendations: string[];
}

/**
 * Transition metadata when regime changes.
 */
export interface RegimeTransition {
  /** Previous tier before transition */
  fromTier: RegimeTier;
  
  /** Previous state before transition */
  fromState: RegimeState;
  
  /** Direction of transition */
  direction: 'escalating' | 'de-escalating' | 'lateral';
  
  /** Transition timestamp */
  transitionedAt: number;
}
