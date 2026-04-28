import { useEffect, useRef, useState } from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { keyframes } from '@emotion/react';
import type { PlayerSlot } from 'react-gameroom';

const AMBIENT_HEADLINES = [
  'Newsroom on watch as candidates take the floor',
  'The seven blocs assemble — coalition season is upon us',
  "Polling booths primed; tonight's contest awaits its candidates",
  'Press corps pours in; a long evening of speculation begins',
  'First gavel falls — opening bell rings on the coalition race',
  'Voter segments hold their breath; alliances yet unmade',
  'Pollsters check their models one final time',
  'Capital stirs as the campaign trail opens',
];

const JOIN_TEMPLATES: Array<(name: string) => string> = [
  (n) => `${n} files candidacy`,
  (n) => `${n} joins the race`,
  (n) => `${n} steps to the rostrum`,
  (n) => `${n} enters the chamber`,
  (n) => `${n} declares — the field grows by one`,
  (n) => `Cameras pivot as ${n} arrives`,
  (n) => `${n} files paperwork; coalition watch begins`,
];

function pickJoinHeadline(name: string, seed: number): string {
  let hash = seed;
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % 997;
  return JOIN_TEMPLATES[hash % JOIN_TEMPLATES.length](name);
}

const AMBIENT_INTERVAL_MS = 9000;
const JOIN_HEADLINE_DURATION_MS = 9000;
const FADE_MS = 300;
const SECONDS_PER_CHAR = 0.18;
const MIN_DURATION_S = 15;
const SEP = '  •  ';
const REPEATS_PER_CYCLE = 3;

const scroll = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`;

function joinedIds(players: readonly PlayerSlot[]): Set<string> {
  return new Set(
    players.filter((p) => p.status !== 'empty').map((p) => String(p.id)),
  );
}

interface LobbyTickerProps {
  players: readonly PlayerSlot[];
}

export function LobbyTicker({ players }: LobbyTickerProps) {
  const [ambientIndex, setAmbientIndex] = useState(0);
  const [transient, setTransient] = useState<string | null>(null);
  const transientTimerRef = useRef<number | null>(null);
  const prevIdsRef = useRef<Set<string>>(joinedIds(players));
  const initializedRef = useRef(false);

  useEffect(() => {
    const currentIds = joinedIds(players);
    if (!initializedRef.current) {
      initializedRef.current = true;
      prevIdsRef.current = currentIds;
      return;
    }
    const newIds: string[] = [];
    currentIds.forEach((id) => {
      if (!prevIdsRef.current.has(id)) newIds.push(id);
    });
    prevIdsRef.current = currentIds;
    if (newIds.length === 0) return;

    const justJoined = players.find((p) => String(p.id) === newIds[0]);
    const name = justJoined?.name ?? 'A candidate';
    setTransient(pickJoinHeadline(name, Date.now() & 0x7fff));

    if (transientTimerRef.current !== null) {
      window.clearTimeout(transientTimerRef.current);
    }
    transientTimerRef.current = window.setTimeout(() => {
      setTransient(null);
      transientTimerRef.current = null;
    }, JOIN_HEADLINE_DURATION_MS);
  }, [players]);

  useEffect(() => {
    return () => {
      if (transientTimerRef.current !== null) {
        window.clearTimeout(transientTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setAmbientIndex((i) => i + 1);
    }, AMBIENT_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  const text = transient ?? AMBIENT_HEADLINES[ambientIndex % AMBIENT_HEADLINES.length];
  const desired = (text + SEP).repeat(REPEATS_PER_CYCLE);

  const [displayed, setDisplayed] = useState(desired);
  const [opacity, setOpacity] = useState(1);
  const swapTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (desired === displayed) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpacity(0);
    swapTimerRef.current = window.setTimeout(() => {
      setDisplayed(desired);
      setOpacity(1);
      swapTimerRef.current = null;
    }, FADE_MS);
    return () => {
      if (swapTimerRef.current !== null) {
        window.clearTimeout(swapTimerRef.current);
        swapTimerRef.current = null;
      }
    };
  }, [desired, displayed]);

  const duration = Math.max(MIN_DURATION_S, displayed.length * SECONDS_PER_CHAR);

  return (
    <Stack
      direction="row"
      sx={{
        flex: 'none',
        bgcolor: 'text.primary',
        alignItems: 'stretch',
        height: 80,
      }}
    >
      <Box
        sx={{
          px: 3,
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'error.main',
        }}
      >
        <Typography
          sx={{
            color: 'common.white',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          Headlines
        </Typography>
      </Box>
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            width: 'max-content',
            opacity,
            transition: `opacity ${FADE_MS}ms ease`,
            animation: `${scroll} ${duration}s linear infinite`,
            willChange: 'transform',
          }}
        >
          {[0, 1].map((copy) => (
            <Typography
              key={copy}
              component="span"
              aria-hidden={copy === 1}
              sx={{
                flexShrink: 0,
                fontSize: 18,
                fontWeight: 700,
                fontFamily: '"Source Sans 3", system-ui, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.22em',
                color: 'common.white',
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              {displayed}
            </Typography>
          ))}
        </Box>
      </Box>
    </Stack>
  );
}
