import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { useGame } from '../contexts/GameContext';
import {
  canClaimSegment,
  canPlaceInSegment,
} from '../game/actions';
import { scorePlayer } from '../game/scoring';
import { CoalitionBase } from '../components/mobile/CoalitionBase';
import { WaitingView } from '../components/mobile/WaitingView';
import { DrawZone } from '../components/mobile/DrawZone';
import { CoalitionBreakdown } from '../components/mobile/CoalitionBreakdown';
import { CampaignRow } from '../components/big-screen/Leaderboard';
import { HeadlineTicker } from '../components/big-screen/HeadlineTicker';
import { VoterSegments } from '../components/big-screen/VoterSegments';
import { LobbyTicker } from '../components/lobby/LobbyTicker';
import { RoomHeader } from '../components/shared/RoomHeader';
import type { Segment } from '../game/types';

export default function PlayerPage() {
  const { id, playerId } = useParams();
  const {
    roomState,
    gameState,
    loadRoom,
    claimSlot,
    placePendingDraw,
    claim,
  } = useGame();
  const [nameInput, setNameInput] = useState('');
  const [claimError, setClaimError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);

  useEffect(() => {
    if (id) loadRoom(id);
  }, [id, loadRoom]);

  const isMyTurn = !!gameState
    && gameState.turnOrder[gameState.currentPlayerIndex] === playerId
    && (gameState.phase === 'turn' || gameState.phase === 'finalRound');

  useEffect(() => {
    if (isMyTurn) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [isMyTurn]);

  const handleClaim = useCallback(async () => {
    if (!id || !playerId) return;
    const slotId = Number(playerId);
    if (!Number.isFinite(slotId)) {
      setClaimError('Invalid slot id');
      return;
    }
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setClaimError('Enter your name');
      return;
    }
    setBusy(true);
    setClaimError(null);
    try {
      await claimSlot(id, slotId, trimmed);
    } catch (e) {
      setClaimError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }, [id, playerId, nameInput, claimSlot]);

  if (!id || !playerId) return <Typography>Missing room or player id.</Typography>;
  if (!roomState) return <Typography>Loading…</Typography>;

  const mySlot = roomState.players.find((p) => String(p.id) === playerId);
  if (!mySlot) return <Typography>Invalid player slot.</Typography>;

  // Slot not yet claimed → show name entry.
  if (mySlot.status === 'empty') {
    return (
      <Stack spacing={2} sx={{ p: 2, maxWidth: 480, mx: 'auto' }}>
        <RoomHeader
          slot={
            <Typography
              variant="overline"
              sx={{
                color: 'text.secondary',
                fontFeatureSettings: "'tnum' 1",
                '&.MuiTypography-overline': {
                  fontSize: 14,
                  letterSpacing: '0.12em',
                  lineHeight: 1.1,
                },
              }}
            >
              {id} · Seat {playerId}
            </Typography>
          }
        />
        <Typography>You're claiming Slot {playerId}. Enter your name:</Typography>
        <TextField
          label="Your Name"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          disabled={busy}
          autoFocus
        />
        {claimError && <Typography color="error">{claimError}</Typography>}
        <Button variant="contained" onClick={handleClaim} disabled={busy}>
          {busy ? 'Joining…' : 'Join'}
        </Button>
      </Stack>
    );
  }

  if (!gameState) {
    return (
      <>
        <Stack spacing={2} sx={{ p: 2, pb: '96px', maxWidth: 480, mx: 'auto' }}>
          <RoomHeader
            slot={
              <Typography
                variant="overline"
                sx={{
                  color: 'text.secondary',
                  fontFeatureSettings: "'tnum' 1",
                  '&.MuiTypography-overline': {
                    fontSize: 14,
                    letterSpacing: '0.12em',
                    lineHeight: 1.1,
                  },
                }}
              >
                {id} · Seat {playerId}
              </Typography>
            }
          />
          <WaitingView message="for the host" />
        </Stack>
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: (t) => t.zIndex.appBar,
          }}
        >
          <LobbyTicker players={roomState.players} />
        </Box>
      </>
    );
  }

  const myBase = gameState.playerState[playerId]?.base ?? [];
  const myRoundStatus = gameState.playerState[playerId]?.roundStatus ?? 'active';

  if (gameState.phase === 'ended') {
    const didWin = gameState.winnerIds?.includes(playerId) ?? false;
    return (
      <Stack spacing={2} sx={{ p: 2, maxWidth: 480, mx: 'auto' }}>
        <RoomHeader
          slot={
            <Typography
              variant="overline"
              sx={{
                color: 'text.secondary',
                fontFeatureSettings: "'tnum' 1",
                '&.MuiTypography-overline': {
                  fontSize: 14,
                  letterSpacing: '0.12em',
                  lineHeight: 1.1,
                },
              }}
            >
              {id} · Seat {playerId}
            </Typography>
          }
        />
        <Typography variant="h4" color={didWin ? 'success.main' : 'text.primary'}>
          {didWin ? 'You won!' : 'Game over'}
        </Typography>
        <CoalitionBase base={myBase} />
      </Stack>
    );
  }

  const currentPlayerId = gameState.turnOrder[gameState.currentPlayerIndex];
  const currentPlayer = roomState.players.find(
    (p) => String(p.id) === currentPlayerId,
  );
  const nameFor = (pid: string) =>
    roomState.players.find((p) => String(p.id) === pid)?.name ?? `Player ${pid}`;

  const pending = gameState.pendingDraw;
  const segmentButtonSx = {
    minWidth: 84,
    py: 0.75,
    fontWeight: 700,
    letterSpacing: '0.04em',
    '@keyframes buttonFadeIn': {
      from: { opacity: 0, transform: 'translateY(4px)' },
      to: { opacity: 1, transform: 'translateY(0)' },
    },
    animation: 'buttonFadeIn 220ms ease-out both',
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  };
  const renderSegmentAction = (segment: Segment) => {
    if (!isMyTurn) return null;
    if (pending) {
      if (!canPlaceInSegment(segment)) return null;
      return (
        <Button
          variant="contained"
          color="primary"
          size="small"
          disabled={actionBusy}
          onClick={async () => {
            setActionBusy(true);
            try {
              await placePendingDraw(segment.key);
            } finally {
              setActionBusy(false);
            }
          }}
          sx={segmentButtonSx}
        >
          Add here
        </Button>
      );
    }
    if (!canClaimSegment(segment)) return null;
    return (
      <Button
        variant="contained"
        color="claim"
        size="small"
        disabled={actionBusy}
        onClick={async () => {
          setActionBusy(true);
          try {
            await claim(segment.key);
          } finally {
            setActionBusy(false);
          }
        }}
        sx={segmentButtonSx}
      >
        Claim
      </Button>
    );
  };

  return (
    <>
      <Stack spacing={2.5} sx={{ p: 2, pb: '96px', maxWidth: 400, mx: 'auto' }}>
        <RoomHeader
          slot={
            <Typography
              variant="overline"
              sx={{
                color: 'text.secondary',
                fontFeatureSettings: "'tnum' 1",
                '&.MuiTypography-overline': {
                  fontSize: 14,
                  letterSpacing: '0.12em',
                  lineHeight: 1.1,
                },
              }}
            >
              {id} · Seat {playerId}
            </Typography>
          }
        />
        <DrawZone
          gameState={gameState}
          isMyTurn={isMyTurn}
          currentPlayerName={currentPlayer?.name ?? currentPlayerId}
        />
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Box sx={{ flex: 1, borderTop: '1px solid', borderColor: 'rule.hair' }} />
          <Typography
            variant="overline"
            sx={{
              color: 'text.secondary',
              '&.MuiTypography-overline': {
                fontSize: 12,
                letterSpacing: '0.14em',
                lineHeight: 1.1,
              },
            }}
          >
            {!isMyTurn
              ? 'voter segments'
              : pending
                ? 'add to a segment'
                : 'or claim from a segment'}
          </Typography>
          <Box sx={{ flex: 1, borderTop: '1px solid', borderColor: 'rule.hair' }} />
        </Stack>
        <VoterSegments
          segments={gameState.segments}
          nameFor={nameFor}
          singleColumn
          renderAction={renderSegmentAction}
        />
        {myRoundStatus === 'claimed' && (
          <Typography
            variant="body1"
            sx={{ color: 'text.secondary' }}
          >
            You claimed this round. Waiting…
          </Typography>
        )}
        {gameState.exitPollDrawn && (
          <Typography variant="h6" color="warning.main">FINAL ROUND</Typography>
        )}
        <Stack spacing={1.5} sx={{ mt: 1.5 }}>
          <Stack spacing={1}>
            <Stack
              direction="row"
              sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}
            >
              <Typography variant="h4" sx={{ fontWeight: 900 }}>Your Campaign</Typography>
              <Typography
                variant="overline"
                sx={{
                  color: 'text.secondary',
                  letterSpacing: '0.14em',
                  '&.MuiTypography-overline': {
                    fontSize: 18,
                    fontWeight: 700,
                    lineHeight: 1,
                    fontFeatureSettings: "'tnum' 1, 'lnum' 1",
                  },
                }}
              >
                {scorePlayer(playerId, myBase).total} pts
              </Typography>
            </Stack>
            <Box sx={{ borderBottom: '1px solid', borderColor: 'rule.hair' }} />
          </Stack>
          <Box
            sx={{
              p: 2,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'rule.hair',
            }}
          >
            <CampaignRow
              row={{
                playerId,
                name: '',
                base: myBase,
                roundStatus: myRoundStatus,
                isCurrent: isMyTurn,
              }}
              showName={false}
            />
          </Box>
          <CoalitionBreakdown base={myBase} gameState={gameState} />
        </Stack>
      </Stack>

      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: (t) => t.zIndex.appBar,
        }}
      >
        <HeadlineTicker
          lastHeadline={gameState.lastHeadline}
          currentPlayerName={currentPlayer?.name ?? currentPlayerId}
          currentPlayerIndex={gameState.currentPlayerIndex}
          isFinalRound={gameState.phase === 'finalRound'}
        />
      </Box>
    </>
  );
}
