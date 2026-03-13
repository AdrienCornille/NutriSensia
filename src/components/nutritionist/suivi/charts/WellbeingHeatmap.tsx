'use client';

import { useMemo, useState } from 'react';
import { moodConfig } from '@/types/suivi';
import type { MoodType } from '@/types/suivi';

interface WellbeingHeatmapLog {
  date: string;
  energy_level: number | null;
  mood: string | null;
  sleep_quality: number | null;
}

interface WellbeingHeatmapProps {
  logs: WellbeingHeatmapLog[];
}

const DAY_HEADERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function getEnergyColor(energy: number | null): string {
  if (energy == null) return 'bg-gray-100';
  if (energy <= 3) return 'bg-red-300';
  if (energy <= 5) return 'bg-amber-300';
  if (energy <= 7) return 'bg-lime-300';
  return 'bg-emerald-400';
}

function getMoodEmoji(mood: string | null): string {
  if (!mood) return '';
  const config = moodConfig[mood as MoodType];
  return config ? config.emoji : '';
}

interface TooltipData {
  date: string;
  energy: number | null;
  moodEmoji: string;
  sleepQuality: number | null;
  x: number;
  y: number;
}

export function WellbeingHeatmap({ logs }: WellbeingHeatmapProps) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const { grid, weekLabels } = useMemo(() => {
    if (logs.length === 0) {
      return { grid: [], weekLabels: [] };
    }

    // Build a map from date string to log
    const logMap = new Map<string, WellbeingHeatmapLog>();
    for (const log of logs) {
      logMap.set(log.date, log);
    }

    // Find date range from logs
    const dates = logs.map((l) => l.date).sort();
    const minDate = new Date(dates[0]);
    const maxDate = new Date(dates[dates.length - 1]);

    // Align minDate to the Monday of its week
    const minDay = minDate.getDay(); // 0=Sun
    const mondayOffset = minDay === 0 ? -6 : 1 - minDay;
    const startMonday = new Date(minDate);
    startMonday.setDate(minDate.getDate() + mondayOffset);

    // Align maxDate to the Sunday of its week
    const maxDay = maxDate.getDay();
    const sundayOffset = maxDay === 0 ? 0 : 7 - maxDay;
    const endSunday = new Date(maxDate);
    endSunday.setDate(maxDate.getDate() + sundayOffset);

    // Build grid: each row is a week (Mon-Sun)
    const weeks: (WellbeingHeatmapLog | null)[][] = [];
    const labels: string[] = [];
    const current = new Date(startMonday);

    while (current <= endSunday) {
      const week: (WellbeingHeatmapLog | null)[] = [];
      const weekStart = new Date(current);
      labels.push(
        weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      );

      for (let d = 0; d < 7; d++) {
        const dateStr = current.toISOString().split('T')[0];
        week.push(logMap.get(dateStr) || null);
        current.setDate(current.getDate() + 1);
      }

      weeks.push(week);
    }

    return { grid: weeks, weekLabels: labels };
  }, [logs]);

  if (logs.length === 0) {
    return (
      <div className="text-center text-sm text-gray-400 py-6">
        Aucune donnee de bien-etre disponible
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Day headers */}
      <div className="flex items-center gap-[2px] mb-1 ml-16">
        {DAY_HEADERS.map((label, i) => (
          <div
            key={i}
            className="w-7 h-5 flex items-center justify-center text-[10px] font-medium text-gray-400"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Grid rows */}
      <div className="flex flex-col gap-[2px]">
        {grid.map((week, weekIdx) => (
          <div key={weekIdx} className="flex items-center gap-[2px]">
            {/* Week label */}
            <div className="w-14 text-[10px] text-gray-400 text-right pr-2 shrink-0">
              {weekLabels[weekIdx]}
            </div>

            {/* Day cells */}
            {week.map((log, dayIdx) => {
              const energy = log?.energy_level ?? null;
              const colorClass = getEnergyColor(energy);

              return (
                <div
                  key={dayIdx}
                  className={`w-7 h-7 rounded ${colorClass} cursor-default transition-transform hover:scale-110`}
                  onMouseEnter={(e) => {
                    if (!log) return;
                    const rect = (
                      e.target as HTMLElement
                    ).getBoundingClientRect();
                    setTooltip({
                      date: log.date,
                      energy: log.energy_level,
                      moodEmoji: getMoodEmoji(log.mood),
                      sleepQuality: log.sleep_quality,
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none -translate-x-1/2 -translate-y-full"
          style={{
            left: tooltip.x,
            top: tooltip.y - 8,
          }}
        >
          <div className="font-medium">
            {new Date(tooltip.date).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
            })}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span>
              Energie: {tooltip.energy != null ? `${tooltip.energy}/10` : '-'}
            </span>
            {tooltip.moodEmoji && <span>{tooltip.moodEmoji}</span>}
          </div>
          <div>
            Sommeil:{' '}
            {tooltip.sleepQuality != null ? `${tooltip.sleepQuality}/10` : '-'}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 ml-16 text-[10px] text-gray-400">
        <span>Faible</span>
        <div className="flex gap-[2px]">
          <div className="w-3 h-3 rounded-sm bg-red-300" />
          <div className="w-3 h-3 rounded-sm bg-amber-300" />
          <div className="w-3 h-3 rounded-sm bg-lime-300" />
          <div className="w-3 h-3 rounded-sm bg-emerald-400" />
        </div>
        <span>Elevee</span>
      </div>
    </div>
  );
}
