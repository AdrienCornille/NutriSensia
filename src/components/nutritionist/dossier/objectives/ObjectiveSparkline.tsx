'use client';

import React from 'react';
import type { ObjectiveProgressLog } from '@/types/nutritionist-dossier';

interface ObjectiveSparklineProps {
  /** Progress logs in chronological order (oldest → newest). May be undefined. */
  logs?: ObjectiveProgressLog[];
  /** Current progress percentage (0-100), used as a fallback when no logs */
  currentProgress: number;
  /** Maximum number of bars to display (default 12) */
  maxBars?: number;
  /** When true, the last bar uses the `is-target` accent */
  highlightLast?: boolean;
}

/**
 * Tiny bar-chart of the objective's evolution. Displays up to `maxBars` of
 * the most recent progress points (older logs are dropped), with a dashed
 * peps-deep horizontal line representing the 100% target.
 */
export function ObjectiveSparkline({
  logs,
  currentProgress,
  maxBars = 12,
  highlightLast = true,
}: ObjectiveSparklineProps) {
  const clamp = (n: number): number => Math.max(0, Math.min(100, n));
  const recent = (logs ?? []).slice(-maxBars);
  const padCount = Math.max(0, maxBars - recent.length);
  // Build the values array explicitly typed as number[] so TS does not narrow
  // it to a literal-0 tuple from a `.fill(0)` chain.
  const values: number[] = Array.from({ length: maxBars }, (_, i) => {
    if (i < padCount) return 0;
    return clamp(recent[i - padCount].progress);
  });
  // If still empty (no logs at all), seed the last bar with the current progress.
  const allZero = values.length > 0 && !values.some(v => v !== 0);
  if (allZero) {
    values[values.length - 1] = clamp(currentProgress);
  }

  const lastIndex = values.length - 1;

  return (
    <div className='fp-obj-spark has-target-line'>
      {values.map((v, i) => (
        <span
          key={i}
          className={i === lastIndex && highlightLast ? 'is-target' : ''}
          style={{ height: `${Math.max(4, v)}%` }}
        />
      ))}
    </div>
  );
}
