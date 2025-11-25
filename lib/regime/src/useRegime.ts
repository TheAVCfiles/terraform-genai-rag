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

import { generateRegimeFromState } from './generateRegimeFromState';
import {
  RegimeInput,
  RegimeOutput,
  RegimeThresholds,
  OperatorMode,
} from './types';

/**
 * Configuration options for useRegime hook.
 */
export interface UseRegimeOptions {
  /** Optional operator mode for context-aware logic */
  operatorMode?: OperatorMode;
  
  /** Optional custom thresholds for tier selection */
  thresholds?: RegimeThresholds;
  
  /** Optional callback when regime changes */
  onRegimeChange?: (current: RegimeOutput, previous: RegimeOutput | undefined) => void;
}

/**
 * State cache for storing computed regimes and enabling transition detection.
 */
interface RegimeCache {
  [day: number]: RegimeOutput;
}

/**
 * Simulated state provider for score computation.
 * In production, this would integrate with the actual MemNode state store.
 */
interface StateProvider {
  getClarityScore(day: number): number;
  getMomentumScore(day: number): number;
  getPhaseScore(day: number): number;
  getBurdenScore(day: number): number;
}

/**
 * Default state provider implementing baseline scoring logic.
 * Uses deterministic calculations based on day for consistent results.
 */
const defaultStateProvider: StateProvider = {
  getClarityScore(day: number): number {
    // Baseline clarity with day-based variation
    return 50 + Math.sin(day * 0.1) * 25;
  },
  
  getMomentumScore(day: number): number {
    // Momentum oscillates around zero
    return Math.cos(day * 0.15) * 50;
  },
  
  getPhaseScore(day: number): number {
    // Phase cycles through quarters
    return ((day % 100) / 100) * 100;
  },
  
  getBurdenScore(day: number): number {
    // Burden with gradual accumulation
    return Math.min(100, 20 + Math.sin(day * 0.05) * 30);
  },
};

// Module-level cache for regime outputs
const regimeCache: RegimeCache = {};

// Track the last computed regime for transition detection
let lastRegime: RegimeOutput | undefined;

/**
 * Hook for computing and retrieving regime for a given day.
 * 
 * This hook integrates with the MemNode core architecture to:
 * - Compute regime based on current day's state
 * - Cache results for performance
 * - Detect and report regime transitions
 * - Support both narrative and live operator modes
 * 
 * Compatible with HUD rendering pipelines and RegimeCard component.
 * 
 * @param day - The day number to compute regime for
 * @param options - Optional configuration for regime computation
 * @returns The computed regime output
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const regime = useRegime(1);
 * console.log(regime.tier); // 'baseline' | 'elevated' | 'heightened' | 'critical'
 * 
 * // With options
 * const regime = useRegime(1, {
 *   operatorMode: 'live',
 *   onRegimeChange: (current, previous) => {
 *     console.log(`Regime changed from ${previous?.tier} to ${current.tier}`);
 *   },
 * });
 * 
 * // For HUD rendering
 * <RegimeCard {...regime.payload} color={regime.color} />
 * ```
 */
export function useRegime(day: number, options: UseRegimeOptions = {}): RegimeOutput {
  const { operatorMode, thresholds, onRegimeChange } = options;
  
  // Check cache first
  const cacheKey = day;
  if (regimeCache[cacheKey]) {
    return regimeCache[cacheKey];
  }
  
  // Get scores from state provider
  const input: RegimeInput = {
    day,
    clarityScore: defaultStateProvider.getClarityScore(day),
    momentumScore: defaultStateProvider.getMomentumScore(day),
    phaseScore: defaultStateProvider.getPhaseScore(day),
    burdenScore: defaultStateProvider.getBurdenScore(day),
    operatorMode,
    previousRegime: lastRegime,
    thresholds,
  };
  
  // Generate regime from state
  const regime = generateRegimeFromState(input);
  
  // Cache the result
  regimeCache[cacheKey] = regime;
  
  // Detect and report regime changes
  if (onRegimeChange && lastRegime && regime.tier !== lastRegime.tier) {
    onRegimeChange(regime, lastRegime);
  }
  
  // Update last regime reference
  lastRegime = regime;
  
  return regime;
}

/**
 * Clears the regime cache.
 * Useful for testing or when state needs to be reset.
 */
export function clearRegimeCache(): void {
  Object.keys(regimeCache).forEach(key => {
    delete regimeCache[Number(key)];
  });
  lastRegime = undefined;
}

/**
 * Gets a regime from cache without computing.
 * Returns undefined if not cached.
 */
export function getCachedRegime(day: number): RegimeOutput | undefined {
  return regimeCache[day];
}

/**
 * Computes regime with custom state provider.
 * Allows for testing and custom integrations.
 */
export function useRegimeWithProvider(
  day: number,
  provider: StateProvider,
  options: UseRegimeOptions = {},
): RegimeOutput {
  const { operatorMode, thresholds, onRegimeChange } = options;
  
  const input: RegimeInput = {
    day,
    clarityScore: provider.getClarityScore(day),
    momentumScore: provider.getMomentumScore(day),
    phaseScore: provider.getPhaseScore(day),
    burdenScore: provider.getBurdenScore(day),
    operatorMode,
    previousRegime: lastRegime,
    thresholds,
  };
  
  const regime = generateRegimeFromState(input);
  
  if (onRegimeChange && lastRegime && regime.tier !== lastRegime.tier) {
    onRegimeChange(regime, lastRegime);
  }
  
  lastRegime = regime;
  
  return regime;
}
