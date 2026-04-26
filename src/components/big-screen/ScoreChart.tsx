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
const TRANSITION_MS = 700;

function shareOf(scores: Record<string, number>, pid: string): number {
  let sum = 0;
  for (const v of Object.values(scores)) sum += Math.max(0, v);
  if (sum === 0) return 0;
  return (Math.max(0, scores[pid] ?? 0) / sum) * 100;
}

function computeYMax(history: ScoreSnapshot[], playerOrder: string[]): number {
  let max = MIN_SHARE_CEILING;
  for (const snap of history) {
    for (const pid of playerOrder) {
      const s = shareOf(snap.scores, pid);
      if (s > max) max = s;
    }
  }
  return Math.min(100, max * 1.1);
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

type AnimState = {
  from: ScoreSnapshot[];
  to: ScoreSnapshot[];
  fromYMax: number;
  toYMax: number;
  t: number; // eased 0..1
};

export function ScoreChart({ history, playerOrder, nameFor, colorFor }: ScoreChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const prevHistoryRef = useRef(history);
  const rafRef = useRef<number | null>(null);
  const [animState, setAnimState] = useState<AnimState | null>(null);

  useEffect(() => {
    const prev = prevHistoryRef.current;
    if (prev === history) return;

    // Only animate when a snapshot is actually appended. Skip first non-empty
    // load (prev.length === 0), resets (shrinks), and same-length re-renders
    // (e.g. Firebase rebuilds the array on every card placement).
    if (prev.length === 0 || history.length <= prev.length) {
      prevHistoryRef.current = history;
      if (history.length < prev.length) setAnimState(null);
      return;
    }

    const from = prev;
    prevHistoryRef.current = history;

    const fromYMax = computeYMax(from, playerOrder);
    const toYMax = computeYMax(history, playerOrder);
    const start = performance.now();

    const tick = () => {
      const elapsed = performance.now() - start;
      const p = Math.min(1, elapsed / TRANSITION_MS);
      const eased = 1 - Math.pow(1 - p, 3);
      if (p < 1) {
        setAnimState({ from, to: history, fromYMax, toYMax, t: eased });
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setAnimState(null);
      }
    };

    setAnimState({ from, to: history, fromYMax, toYMax, t: 0 });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [history, playerOrder]);

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

  const toYMax = animState ? animState.toYMax : computeYMax(history, playerOrder);

  // Coordinate helpers — `xAt` maps an index to its x given a particular
  // history length; `yAt` maps a share to its y given a particular yMax.
  const xAt = (i: number, len: number): number =>
    len <= 1 ? PAD.left : PAD.left + (i / (len - 1)) * innerW;
  const yAt = (share: number, yMax: number): number =>
    PAD.top + (1 - share / yMax) * innerH;

  // For an index in the rendered (target) history, return the on-screen point
  // for `pid` at the current animation frame. Indices that didn't exist in
  // `from` start at the position of from's last point (they slide out from
  // there) and lerp toward their final coords.
  function pointAt(pid: string, i: number): { x: number; y: number } {
    if (!animState) {
      return {
        x: xAt(i, history.length),
        y: yAt(shareOf(history[i].scores, pid), toYMax),
      };
    }
    const { from, to, fromYMax, t } = animState;
    const toX = xAt(i, to.length);
    const toY = yAt(shareOf(to[i].scores, pid), toYMax);
    const fromIdx = i < from.length ? i : from.length - 1;
    const fromX = xAt(fromIdx, from.length);
    const fromY = yAt(shareOf(from[fromIdx].scores, pid), fromYMax);
    return {
      x: fromX + (toX - fromX) * t,
      y: fromY + (toY - fromY) * t,
    };
  }

  // Tick x positions interpolate the same way (carrying old ticks toward
  // their compressed slots; new ticks emerge from the previous last-x).
  function tickXAt(i: number): number {
    if (!animState) return xAt(i, history.length);
    const { from, to, t } = animState;
    const toX = xAt(i, to.length);
    const fromIdx = i < from.length ? i : from.length - 1;
    const fromX = xAt(fromIdx, from.length);
    return fromX + (toX - fromX) * t;
  }

  const lastIdx = history.length - 1;
  const labelInputs: LabelPosition[] =
    history.length > 0
      ? playerOrder.map((pid, idx) => {
          const score = history[lastIdx].scores[pid] ?? 0;
          const { y } = pointAt(pid, lastIdx);
          return {
            pid,
            y,
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
        <Typography variant="h4" sx={{ fontWeight: 900 }}>Poll Results</Typography>
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
                key={`tick-${snap.roundNumber}`}
                x={tickXAt(i)}
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
              const points = history.map((_, i) => pointAt(pid, i));
              const startY = points[0]?.y ?? 0;
              return (
                <g key={pid}>
                  {history.length > 1 ? (
                    <polyline
                      points={points.map((p) => `${p.x},${p.y}`).join(' ')}
                      fill="none"
                      stroke={color}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : (
                    <line
                      x1={xAt(0, 1)}
                      x2={PAD.left + innerW}
                      y1={startY}
                      y2={startY}
                      stroke={color}
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  )}
                  {points.map((p, i) => (
                    <circle
                      key={`${pid}-${history[i].roundNumber}`}
                      cx={p.x}
                      cy={p.y}
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
