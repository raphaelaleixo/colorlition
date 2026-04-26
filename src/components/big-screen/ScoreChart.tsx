import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ScoreSnapshot } from '../../game/types';

export type ScoreChartProps = {
  history: ScoreSnapshot[];
  playerOrder: string[];
  nameFor: (pid: string) => string;
  colorFor: (pid: string, idx: number) => string;
};

const PAD = { top: 16, right: 200, bottom: 28, left: 36 };
const LABEL_LINE_HEIGHT = 21;
const MIN_SHARE_CEILING = 25;

// Voter-share normalization: each player's share is their positive score
// divided by the sum of all positive scores in that round, expressed as %.
// Negative-scoring players (Policy Contradictions outweighing positives) get
// 0% — they have no "voter intention" to plot. Falls back to 0% across the
// board if no one has any positive points yet.
function shareOf(scores: Record<string, number>, pid: string): number {
  let sum = 0;
  for (const v of Object.values(scores)) sum += Math.max(0, v);
  if (sum === 0) return 0;
  return (Math.max(0, scores[pid] ?? 0) / sum) * 100;
}

type LabelPosition = { pid: string; y: number; color: string; name: string; score: number };

function dodgeLabels(
  positions: LabelPosition[],
  minY: number,
  maxY: number,
): LabelPosition[] {
  const sorted = [...positions].sort((a, b) => a.y - b.y);
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    if (sorted[i].y - prev.y < LABEL_LINE_HEIGHT) {
      sorted[i] = { ...sorted[i], y: prev.y + LABEL_LINE_HEIGHT };
    }
  }
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].y > maxY) sorted[i] = { ...sorted[i], y: maxY };
    if (i > 0 && sorted[i].y - sorted[i - 1].y < LABEL_LINE_HEIGHT) {
      sorted[i - 1] = { ...sorted[i - 1], y: sorted[i].y - LABEL_LINE_HEIGHT };
    }
  }
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].y < minY) sorted[i] = { ...sorted[i], y: minY };
  }
  return sorted;
}

export function ScoreChart({ history, playerOrder, nameFor, colorFor }: ScoreChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setSize({ width: el.clientWidth, height: el.clientHeight });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { width, height } = size;
  const innerW = Math.max(0, width - PAD.left - PAD.right);
  const innerH = Math.max(0, height - PAD.top - PAD.bottom);

  let maxShare = MIN_SHARE_CEILING;
  for (const snap of history) {
    for (const pid of playerOrder) {
      const s = shareOf(snap.scores, pid);
      if (s > maxShare) maxShare = s;
    }
  }
  const yMin = 0;
  const yMax = Math.min(100, maxShare * 1.1);

  const x = (i: number) =>
    history.length <= 1
      ? PAD.left
      : PAD.left + (i / (history.length - 1)) * innerW;
  const y = (share: number) =>
    PAD.top + (1 - (share - yMin) / (yMax - yMin)) * innerH;

  const lastIdx = history.length - 1;
  const labelInputs: LabelPosition[] =
    history.length > 0
      ? playerOrder.map((pid, idx) => {
          const score = history[lastIdx].scores[pid] ?? 0;
          const share = shareOf(history[lastIdx].scores, pid);
          return {
            pid,
            y: y(share),
            color: colorFor(pid, idx),
            name: nameFor(pid),
            score,
          };
        })
      : [];
  const labels = dodgeLabels(labelInputs, PAD.top, PAD.top + innerH);

  return (
    <Stack spacing={1} sx={{ height: '100%', minHeight: 0 }}>
      <Stack spacing={1}>
        <Typography variant="h4">Mandate Trajectory</Typography>
        <Box sx={{ borderBottom: '1px solid', borderColor: 'rule.hair' }} />
      </Stack>
      <Box ref={containerRef} sx={{ flex: '1 1 auto', minHeight: 0, position: 'relative' }}>
        {width > 0 && height > 0 && history.length > 0 && (
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            style={{ display: 'block' }}
          >
            <line
              x1={PAD.left}
              x2={PAD.left + innerW}
              y1={PAD.top + innerH}
              y2={PAD.top + innerH}
              stroke="#E6DFD2"
              strokeWidth={1}
            />
            {history.map((snap, i) => (
              <text
                key={`tick-${i}`}
                x={x(i)}
                y={PAD.top + innerH + 18}
                textAnchor="middle"
                fontSize={11}
                fontFamily='"Source Sans 3", sans-serif'
                fontWeight={600}
                fill="#5A5A5A"
                letterSpacing={1.2}
                style={{ textTransform: 'uppercase' }}
              >
                {snap.roundNumber === 0 ? 'Start' : `R${snap.roundNumber}`}
              </text>
            ))}
            {playerOrder.map((pid, idx) => ({ pid, idx })).reverse().map(({ pid, idx }) => {
              const color = colorFor(pid, idx);
              const points = history
                .map((snap, i) => `${x(i)},${y(shareOf(snap.scores, pid))}`)
                .join(' ');
              const startY = y(shareOf(history[0].scores, pid));
              return (
                <g key={pid}>
                  {history.length > 1 ? (
                    <polyline
                      points={points}
                      fill="none"
                      stroke={color}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : (
                    <line
                      x1={x(0)}
                      x2={PAD.left + innerW}
                      y1={startY}
                      y2={startY}
                      stroke={color}
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  )}
                  {history.map((snap, i) => (
                    <circle
                      key={`${pid}-${i}`}
                      cx={x(i)}
                      cy={y(shareOf(snap.scores, pid))}
                      r={3}
                      fill={color}
                    />
                  ))}
                  {history.length === 1 && (
                    <circle cx={PAD.left + innerW} cy={startY} r={3} fill={color} />
                  )}
                </g>
              );
            })}
            {labels.map((label) => (
              <g key={`label-${label.pid}`}>
                <line
                  x1={PAD.left + innerW}
                  x2={PAD.left + innerW + 6}
                  y1={label.y}
                  y2={label.y}
                  stroke={label.color}
                  strokeWidth={1}
                />
                <text
                  x={PAD.left + innerW + 10}
                  y={label.y + 6}
                  fontSize={17}
                  fontFamily='"Source Sans 3", sans-serif'
                  fill={label.color}
                  letterSpacing={1.2}
                  style={{ textTransform: 'uppercase' }}
                >
                  <tspan
                    fontWeight={700}
                    style={{ fontFeatureSettings: "'tnum' 1, 'lnum' 1" }}
                  >
                    {label.score}
                  </tspan>
                  <tspan fontWeight={700} dx={6}>
                    {label.name.length > 14 ? `${label.name.slice(0, 14)}…` : label.name}
                  </tspan>
                </text>
              </g>
            ))}
          </svg>
        )}
      </Box>
    </Stack>
  );
}
