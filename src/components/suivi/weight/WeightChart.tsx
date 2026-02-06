'use client';

import React, { useMemo, useState } from 'react';
import type { WeightData, TimeRange } from '@/types/suivi';
import { TimeRangeSelector } from '../TimeRangeSelector';

interface WeightChartProps {
  data: WeightData;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

interface ChartPoint {
  x: number;
  y: number;
  entry: { id: string; date: Date; value: number };
}

// Couleurs NutriSensia - Palette Méditerranée
const COLORS = {
  turquoise: '#1B998B',
  turquoiseDark: '#147569',
  turquoisePale: 'rgba(27, 153, 139, 0.08)',
  turquoiseLight: 'rgba(27, 153, 139, 0.15)',
  trend: '#E76F51', // Terracotta pour la tendance
  trendLight: 'rgba(231, 111, 81, 0.3)',
};

/**
 * Calcule la moyenne mobile sur une fenêtre de n points
 */
function calculateMovingAverage(
  points: ChartPoint[],
  windowSize: number = 3
): ChartPoint[] {
  if (points.length < windowSize) return points;

  return points.map((point, index) => {
    const start = Math.max(0, index - Math.floor(windowSize / 2));
    const end = Math.min(points.length, index + Math.ceil(windowSize / 2));
    const windowPoints = points.slice(start, end);
    const avgValue =
      windowPoints.reduce((sum, p) => sum + p.entry.value, 0) /
      windowPoints.length;

    // Recalculer la position Y pour la moyenne
    const values = points.map(p => p.entry.value);
    const minValue = Math.min(...values) - 1;
    const maxValue = Math.max(...values) + 1;
    const range = maxValue - minValue;
    const height = 180;
    const padding = 10;
    const avgY =
      height -
      padding -
      ((avgValue - minValue) / range) * (height - 2 * padding);

    return {
      ...point,
      y: avgY,
      entry: { ...point.entry, value: avgValue },
    };
  });
}

/**
 * Génère un chemin SVG avec courbes de Bézier pour un rendu plus lisse
 */
function generateSmoothPath(points: ChartPoint[]): string {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    // Calcul des points de contrôle pour une courbe lisse
    const tension = 0.3;
    let cp1x: number, cp1y: number, cp2x: number, cp2y: number;

    if (i === 1) {
      cp1x = prev.x + (curr.x - prev.x) * tension;
      cp1y = prev.y + (curr.y - prev.y) * tension;
    } else {
      const prevPrev = points[i - 2];
      cp1x = prev.x + (curr.x - prevPrev.x) * tension;
      cp1y = prev.y + (curr.y - prevPrev.y) * tension;
    }

    if (!next) {
      cp2x = curr.x - (curr.x - prev.x) * tension;
      cp2y = curr.y - (curr.y - prev.y) * tension;
    } else {
      cp2x = curr.x - (next.x - prev.x) * tension;
      cp2y = curr.y - (next.y - prev.y) * tension;
    }

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }

  return path;
}

export function WeightChart({
  data,
  timeRange,
  onTimeRangeChange,
}: WeightChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [showTrendLine, setShowTrendLine] = useState(true);

  // Dimensions du graphique
  const chartDimensions = { width: 400, height: 180, padding: 10 };

  // Generate chart data points
  const chartPoints = useMemo((): ChartPoint[] => {
    if (data.history.length === 0) return [];

    const sortedHistory = [...data.history].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    // Find min and max for scaling
    const values = sortedHistory.map(e => e.value);
    const minValue = Math.min(...values, data.goal) - 1;
    const maxValue = Math.max(...values) + 1;
    const range = maxValue - minValue;

    const { width, height, padding } = chartDimensions;

    return sortedHistory.map((entry, index) => {
      const x =
        sortedHistory.length === 1
          ? width / 2
          : padding +
            (index / (sortedHistory.length - 1)) * (width - 2 * padding);
      const y =
        height -
        padding -
        ((entry.value - minValue) / range) * (height - 2 * padding);
      return { x, y, entry };
    });
  }, [data.history, data.goal, chartDimensions]);

  // Generate smooth path string
  const pathD = useMemo(() => {
    return generateSmoothPath(chartPoints);
  }, [chartPoints]);

  // Calculate moving average trend line
  const trendPoints = useMemo(() => {
    if (chartPoints.length < 3) return [];
    return calculateMovingAverage(chartPoints, 3);
  }, [chartPoints]);

  const trendPathD = useMemo(() => {
    return generateSmoothPath(trendPoints);
  }, [trendPoints]);

  // Calculate goal line position
  const goalLineY = useMemo(() => {
    if (data.history.length === 0) return 0;
    const values = data.history.map(e => e.value);
    const minValue = Math.min(...values, data.goal) - 1;
    const maxValue = Math.max(...values) + 1;
    const range = maxValue - minValue;
    const { height, padding } = chartDimensions;
    return (
      height -
      padding -
      ((data.goal - minValue) / range) * (height - 2 * padding)
    );
  }, [data.history, data.goal, chartDimensions]);

  // Generate Y-axis labels
  const yAxisLabels = useMemo(() => {
    if (data.history.length === 0) return [];
    const values = data.history.map(e => e.value);
    const minValue = Math.min(...values, data.goal) - 1;
    const maxValue = Math.max(...values) + 1;
    const step = (maxValue - minValue) / 4;
    return Array.from({ length: 5 }, (_, i) => Math.round(maxValue - i * step));
  }, [data.history, data.goal]);

  // Generate X-axis labels
  const xAxisLabels = useMemo(() => {
    if (data.history.length === 0) return [];
    const sortedHistory = [...data.history].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
    const step = Math.max(1, Math.floor(sortedHistory.length / 4));
    return sortedHistory
      .filter((_, i) => i % step === 0 || i === sortedHistory.length - 1)
      .map(entry =>
        entry.date.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'short',
        })
      );
  }, [data.history]);

  // Format date for tooltip
  const formatTooltipDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className='bg-white rounded-xl p-6 border border-gray-200'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='font-semibold text-gray-800'>Évolution du poids</h2>
        <div className='flex items-center gap-4'>
          {/* Toggle tendance */}
          <button
            onClick={() => setShowTrendLine(!showTrendLine)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              showTrendLine
                ? 'bg-[#E76F51]/10 text-[#E76F51]'
                : 'bg-gray-100 text-gray-500'
            }`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <span
              className={`w-3 h-0.5 rounded ${showTrendLine ? 'bg-[#E76F51]' : 'bg-gray-400'}`}
            />
            Tendance
          </button>
          <TimeRangeSelector
            activeRange={timeRange}
            onRangeChange={onTimeRangeChange}
          />
        </div>
      </div>

      {/* Chart */}
      <div className='relative h-64 bg-[rgba(27,153,139,0.03)] rounded-2xl overflow-hidden'>
        {/* Y-axis labels */}
        <div
          className='absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between py-4 text-xs text-[#41556b]'
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {yAxisLabels.map((label, i) => (
            <span key={i}>{label} kg</span>
          ))}
        </div>

        {/* Chart area */}
        <div className='ml-12 h-full relative'>
          {/* Goal line */}
          {goalLineY > 0 && goalLineY < 180 && (
            <div
              className='absolute w-full z-10'
              style={{ top: `${(goalLineY / 180) * 100}%` }}
            >
              <div
                className='w-full border-t-2 border-dashed'
                style={{ borderColor: COLORS.turquoise }}
              />
              <span
                className='absolute right-2 -top-5 text-xs px-2 py-0.5 rounded-full'
                style={{
                  backgroundColor: COLORS.turquoisePale,
                  color: COLORS.turquoise,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 600,
                }}
              >
                Objectif: {data.goal} kg
              </span>
            </div>
          )}

          {/* SVG Chart */}
          <svg
            className='w-full h-full'
            viewBox='0 0 400 200'
            preserveAspectRatio='xMidYMid meet'
          >
            {/* Gradient definitions */}
            <defs>
              <linearGradient
                id='weightGradient'
                x1='0%'
                y1='0%'
                x2='0%'
                y2='100%'
              >
                <stop
                  offset='0%'
                  stopColor={COLORS.turquoise}
                  stopOpacity='0.3'
                />
                <stop
                  offset='100%'
                  stopColor={COLORS.turquoise}
                  stopOpacity='0'
                />
              </linearGradient>
              <filter id='glow'>
                <feGaussianBlur stdDeviation='2' result='coloredBlur' />
                <feMerge>
                  <feMergeNode in='coloredBlur' />
                  <feMergeNode in='SourceGraphic' />
                </feMerge>
              </filter>
            </defs>

            {/* Horizontal grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={i}
                x1='10'
                y1={10 + i * 40}
                x2='390'
                y2={10 + i * 40}
                stroke='#e5e5e5'
                strokeWidth='1'
                strokeDasharray='4,4'
              />
            ))}

            {/* Area under curve */}
            {pathD && chartPoints.length > 0 && (
              <path
                d={`${pathD} L ${chartPoints[chartPoints.length - 1]?.x || 0} 190 L ${chartPoints[0]?.x || 0} 190 Z`}
                fill='url(#weightGradient)'
              />
            )}

            {/* Trend line (moving average) */}
            {showTrendLine && trendPathD && (
              <path
                d={trendPathD}
                fill='none'
                stroke={COLORS.trend}
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeDasharray='6,4'
                opacity='0.8'
              />
            )}

            {/* Main line */}
            {pathD && (
              <path
                d={pathD}
                fill='none'
                stroke={COLORS.turquoise}
                strokeWidth='3'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            )}

            {/* All data points */}
            {chartPoints.map((point, index) => {
              const isHovered = hoveredPoint === index;
              const isLast = index === chartPoints.length - 1;

              return (
                <g key={point.entry.id}>
                  {/* Outer glow for last point */}
                  {isLast && (
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r='12'
                      fill={COLORS.turquoise}
                      opacity='0.2'
                      style={{ pointerEvents: 'none' }}
                    />
                  )}

                  {/* Point circle */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isHovered ? 7 : isLast ? 6 : 4}
                    fill={isLast ? COLORS.turquoise : '#fff'}
                    stroke={COLORS.turquoise}
                    strokeWidth={isHovered || isLast ? 3 : 2}
                    style={{
                      transition: 'r 0.2s ease, stroke-width 0.2s ease',
                      filter: isHovered ? 'url(#glow)' : undefined,
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Hover area (invisible, larger for easier interaction) - rendered last to be on top */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r='15'
                    fill='transparent'
                    onMouseEnter={() => setHoveredPoint(index)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    style={{ cursor: 'pointer' }}
                  />

                  {/* Tooltip on hover */}
                  {isHovered && (
                    <g>
                      {/* Tooltip background */}
                      <rect
                        x={point.x - 45}
                        y={point.y - 45}
                        width='90'
                        height='36'
                        rx='8'
                        fill='#1a1a1a'
                        opacity='0.9'
                      />
                      {/* Tooltip arrow */}
                      <polygon
                        points={`${point.x - 6},${point.y - 9} ${point.x + 6},${point.y - 9} ${point.x},${point.y - 3}`}
                        fill='#1a1a1a'
                        opacity='0.9'
                      />
                      {/* Tooltip text - weight */}
                      <text
                        x={point.x}
                        y={point.y - 30}
                        textAnchor='middle'
                        fill='#fff'
                        fontSize='12'
                        fontWeight='600'
                        fontFamily="'Plus Jakarta Sans', sans-serif"
                      >
                        {point.entry.value.toFixed(1)} kg
                      </text>
                      {/* Tooltip text - date */}
                      <text
                        x={point.x}
                        y={point.y - 17}
                        textAnchor='middle'
                        fill='#a0a0a0'
                        fontSize='9'
                        fontFamily="'Plus Jakarta Sans', sans-serif"
                      >
                        {formatTooltipDate(point.entry.date)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* X-axis labels */}
        <div
          className='absolute bottom-0 left-12 right-0 flex justify-between px-4 py-2 text-xs text-[#41556b]'
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {xAxisLabels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div
        className='flex items-center justify-center gap-6 mt-4 text-xs'
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <div className='flex items-center gap-2'>
          <div
            className='w-4 h-1 rounded'
            style={{ backgroundColor: COLORS.turquoise }}
          />
          <span className='text-[#41556b]'>Poids mesuré</span>
        </div>
        {showTrendLine && (
          <div className='flex items-center gap-2'>
            <div
              className='w-4 h-0.5 rounded'
              style={{
                backgroundColor: COLORS.trend,
                backgroundImage: `repeating-linear-gradient(90deg, ${COLORS.trend} 0, ${COLORS.trend} 3px, transparent 3px, transparent 5px)`,
              }}
            />
            <span className='text-[#41556b]'>Tendance (moy. mobile)</span>
          </div>
        )}
        <div className='flex items-center gap-2'>
          <div
            className='w-4 h-0.5 rounded border-t-2 border-dashed'
            style={{ borderColor: COLORS.turquoise }}
          />
          <span className='text-[#41556b]'>Objectif</span>
        </div>
      </div>
    </div>
  );
}

export default WeightChart;
