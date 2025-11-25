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
  generateRegimeFromState,
  validateRegimeInput,
} from './generateRegimeFromState';
import { RegimeInput, RegimeOutput } from './types';

describe('generateRegimeFromState', () => {
  const baseInput: RegimeInput = {
    day: 1,
    clarityScore: 50,
    momentumScore: 0,
    phaseScore: 50,
    burdenScore: 30,
  };

  describe('tier selection', () => {
    it('returns baseline tier for low composite score', () => {
      const input: RegimeInput = {
        ...baseInput,
        clarityScore: 10,
        momentumScore: 0,
        phaseScore: 10,
        burdenScore: 10,
      };
      const result = generateRegimeFromState(input);
      expect(result.tier).toBe('baseline');
    });

    it('returns elevated tier for moderate composite score', () => {
      const input: RegimeInput = {
        ...baseInput,
        clarityScore: 30,
        momentumScore: 30,
        phaseScore: 30,
        burdenScore: 30,
      };
      const result = generateRegimeFromState(input);
      expect(result.tier).toBe('elevated');
    });

    it('returns heightened tier for high composite score', () => {
      const input: RegimeInput = {
        ...baseInput,
        clarityScore: 60,
        momentumScore: 50,
        phaseScore: 60,
        burdenScore: 60,
      };
      const result = generateRegimeFromState(input);
      expect(result.tier).toBe('heightened');
    });

    it('returns critical tier for very high composite score', () => {
      const input: RegimeInput = {
        ...baseInput,
        clarityScore: 90,
        momentumScore: 80,
        phaseScore: 80,
        burdenScore: 80,
      };
      const result = generateRegimeFromState(input);
      expect(result.tier).toBe('critical');
    });

    it('respects custom thresholds', () => {
      const input: RegimeInput = {
        ...baseInput,
        clarityScore: 30,
        momentumScore: 30,
        phaseScore: 30,
        burdenScore: 30,
        thresholds: {
          elevated: 40,
          heightened: 60,
          critical: 80,
        },
      };
      const result = generateRegimeFromState(input);
      expect(result.tier).toBe('baseline');
    });
  });

  describe('state determination', () => {
    it('returns stable state under normal conditions', () => {
      const result = generateRegimeFromState(baseInput);
      expect(result.state).toBe('stable');
    });

    it('returns volatile state when momentum is extreme', () => {
      const input: RegimeInput = {
        ...baseInput,
        momentumScore: 80,
      };
      const result = generateRegimeFromState(input);
      expect(result.state).toBe('volatile');
    });

    it('returns volatile state when clarity is low', () => {
      const input: RegimeInput = {
        ...baseInput,
        clarityScore: 20,
      };
      const result = generateRegimeFromState(input);
      expect(result.state).toBe('volatile');
    });

    it('returns protective state when burden is critical', () => {
      const input: RegimeInput = {
        ...baseInput,
        burdenScore: 85,
      };
      const result = generateRegimeFromState(input);
      expect(result.state).toBe('protective');
    });

    it('returns protective state for live operator with high composite score', () => {
      const input: RegimeInput = {
        ...baseInput,
        clarityScore: 85,
        momentumScore: 70,
        phaseScore: 85,
        burdenScore: 75,
        operatorMode: 'live',
      };
      const result = generateRegimeFromState(input);
      expect(result.state).toBe('protective');
    });

    it('returns transitional state when tier changes from previous', () => {
      const previousRegime: RegimeOutput = {
        tier: 'baseline',
        state: 'stable',
        compositeScore: 20,
        scores: { clarity: 20, momentum: 0, phase: 20, burden: 20, weighted: 20 },
        timestamp: Date.now() - 1000,
        day: 0,
        label: 'Baseline',
        color: '#22c55e',
        payload: {
          title: 'Baseline Regime',
          description: 'System operating within normal parameters',
          icon: 'shield-check',
          priority: 4,
          protectiveActive: false,
          recommendations: [],
        },
      };

      const input: RegimeInput = {
        ...baseInput,
        clarityScore: 60,
        momentumScore: 50,
        phaseScore: 55,
        burdenScore: 50,
        previousRegime,
      };
      const result = generateRegimeFromState(input);
      expect(result.state).toBe('transitional');
    });
  });

  describe('scoring', () => {
    it('calculates composite score correctly', () => {
      const input: RegimeInput = {
        day: 1,
        clarityScore: 100,
        momentumScore: 100,
        phaseScore: 100,
        burdenScore: 100,
      };
      const result = generateRegimeFromState(input);
      expect(result.compositeScore).toBe(100);
    });

    it('normalizes momentum from negative values', () => {
      const positiveInput: RegimeInput = { ...baseInput, momentumScore: 50 };
      const negativeInput: RegimeInput = { ...baseInput, momentumScore: -50 };
      
      const positiveResult = generateRegimeFromState(positiveInput);
      const negativeResult = generateRegimeFromState(negativeInput);
      
      // Absolute momentum contributes equally
      expect(positiveResult.compositeScore).toBe(negativeResult.compositeScore);
    });

    it('clamps out-of-range scores', () => {
      const input: RegimeInput = {
        day: 1,
        clarityScore: 150,
        momentumScore: 200,
        phaseScore: -50,
        burdenScore: 1000,
      };
      const result = generateRegimeFromState(input);
      
      expect(result.scores.clarity).toBe(100);
      expect(result.scores.momentum).toBe(100);
      expect(result.scores.phase).toBe(0);
      expect(result.scores.burden).toBe(100);
    });
  });

  describe('output structure', () => {
    it('includes all required output fields', () => {
      const result = generateRegimeFromState(baseInput);
      
      expect(result).toHaveProperty('tier');
      expect(result).toHaveProperty('state');
      expect(result).toHaveProperty('compositeScore');
      expect(result).toHaveProperty('scores');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('day');
      expect(result).toHaveProperty('label');
      expect(result).toHaveProperty('color');
      expect(result).toHaveProperty('payload');
    });

    it('includes correct payload structure for RegimeCard integration', () => {
      const result = generateRegimeFromState(baseInput);
      
      expect(result.payload).toHaveProperty('title');
      expect(result.payload).toHaveProperty('description');
      expect(result.payload).toHaveProperty('icon');
      expect(result.payload).toHaveProperty('priority');
      expect(result.payload).toHaveProperty('protectiveActive');
      expect(result.payload).toHaveProperty('recommendations');
      expect(Array.isArray(result.payload.recommendations)).toBe(true);
    });

    it('includes transition metadata when regime changes', () => {
      const previousRegime: RegimeOutput = {
        tier: 'baseline',
        state: 'stable',
        compositeScore: 20,
        scores: { clarity: 20, momentum: 0, phase: 20, burden: 20, weighted: 20 },
        timestamp: Date.now() - 1000,
        day: 0,
        label: 'Baseline',
        color: '#22c55e',
        payload: {
          title: 'Baseline Regime',
          description: 'System operating within normal parameters',
          icon: 'shield-check',
          priority: 4,
          protectiveActive: false,
          recommendations: [],
        },
      };

      const input: RegimeInput = {
        ...baseInput,
        clarityScore: 80,
        momentumScore: 60,
        phaseScore: 70,
        burdenScore: 70,
        previousRegime,
      };
      const result = generateRegimeFromState(input);
      
      expect(result.transition).toBeDefined();
      expect(result.transition?.fromTier).toBe('baseline');
      expect(result.transition?.direction).toBe('escalating');
    });

    it('sets correct color for each tier', () => {
      const testCases: Array<{ input: RegimeInput; expectedColor: string }> = [
        { input: { ...baseInput, clarityScore: 10, momentumScore: 0, phaseScore: 10, burdenScore: 10 }, expectedColor: '#22c55e' },
        { input: { ...baseInput, clarityScore: 30, momentumScore: 30, phaseScore: 30, burdenScore: 30 }, expectedColor: '#eab308' },
        { input: { ...baseInput, clarityScore: 60, momentumScore: 50, phaseScore: 60, burdenScore: 60 }, expectedColor: '#f97316' },
        { input: { ...baseInput, clarityScore: 90, momentumScore: 80, phaseScore: 80, burdenScore: 80 }, expectedColor: '#ef4444' },
      ];

      testCases.forEach(({ input, expectedColor }) => {
        const result = generateRegimeFromState(input);
        expect(result.color).toBe(expectedColor);
      });
    });
  });

  describe('recommendations', () => {
    it('includes tier-specific recommendations', () => {
      const criticalInput: RegimeInput = {
        ...baseInput,
        clarityScore: 90,
        momentumScore: 80,
        phaseScore: 80,
        burdenScore: 80,
      };
      const result = generateRegimeFromState(criticalInput);
      
      expect(result.payload.recommendations).toContain('Activate maximum protective protocols');
    });

    it('includes operator-mode specific recommendations', () => {
      const liveInput: RegimeInput = {
        ...baseInput,
        operatorMode: 'live',
      };
      const narrativeInput: RegimeInput = {
        ...baseInput,
        operatorMode: 'narrative',
      };

      const liveResult = generateRegimeFromState(liveInput);
      const narrativeResult = generateRegimeFromState(narrativeInput);

      expect(liveResult.payload.recommendations).toContain('Ensure real-time monitoring is active');
      expect(narrativeResult.payload.recommendations).toContain('Document regime conditions for analysis');
    });
  });
});

describe('validateRegimeInput', () => {
  it('returns empty array for valid input', () => {
    const input: RegimeInput = {
      day: 1,
      clarityScore: 50,
      momentumScore: 0,
      phaseScore: 50,
      burdenScore: 30,
    };
    const errors = validateRegimeInput(input);
    expect(errors).toEqual([]);
  });

  it('returns errors for missing required fields', () => {
    const errors = validateRegimeInput({});
    expect(errors.length).toBeGreaterThan(0);
    expect(errors).toContain('day must be a finite number');
  });

  it('returns error for non-object input', () => {
    const errors = validateRegimeInput('not an object');
    expect(errors).toContain('Input must be an object');
  });

  it('returns error for invalid operatorMode', () => {
    const input = {
      day: 1,
      clarityScore: 50,
      momentumScore: 0,
      phaseScore: 50,
      burdenScore: 30,
      operatorMode: 'invalid',
    };
    const errors = validateRegimeInput(input);
    expect(errors).toContain('operatorMode must be "narrative" or "live"');
  });
});
