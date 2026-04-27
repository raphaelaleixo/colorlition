# Route restructure: align with `react-gameroom` URL convention

**Date:** 2026-04-27
**Status:** Proposed
**Reference projects:** `../react-unmatched`, `../krimi` (both already on this convention)

## Why

`react-gameroom` exposes URL builders (`buildRoomUrl`, `buildJoinUrl`, `buildPlayerUrl`, `buildRejoinUrl`) that assume one canonical scheme:

```
/room/:id                    room (lobby + game)
/room/:id/player             join (auto-slot)
/room/:id/player/:playerId   player controller
/room/:id/players            rejoin list  ← we will not use this; collapsed into /player
```

Colorlition is the only project in this user's portfolio not on the convention. It uses `/join` and `/join/:id` for QR-scan landing and splits `/room/:id` (lobby) from `/room/:id/play` (game). Side effect: the lobby's `<RoomQRCode roomId={id}/>` defaults its target to `buildRoomUrl(id)` — so a phone scanning the QR currently lands on the lobby itself, not on a join page. Bug.

The fix is to migrate routes to match the library's convention, the way `krimi/src/App.tsx` already does.

## Routes (after)

```
/                                      HomePage              (unchanged)
/how-to-play                           HowToPlayPage         (unchanged)
/room/:id                              RoomPage              ← unified lobby + big-screen
/room/:id/player                       PlayerJoinPage        ← unified join + rejoin
/room/:id/player/:playerId             PlayerPage            (unchanged)
```

**Deleted:**
- `/join` and `/join/:id` (orphaned; nothing in the app links to them)
- `/room/:id/play` (only the lobby's own auto-redirect referenced it)
- `src/pages/JoinPage.tsx` (replaced by `PlayerJoinPage`)

No URL-redirect shims for the deleted paths — pre-launch, no public links to preserve.

## `RoomPage` — single route, status-driven

One page, one room subscription, two views. Today's `LobbyPage` and `BigScreenPage` are folded into subcomponents `LobbyView` and `BigScreenView` under the new `RoomPage`. JSX bodies are unchanged; only their wrappers move.

```tsx
export default function RoomPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { roomState, loading, loadRoom } = useGame();
  const [hasSubscribed, setHasSubscribed] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadRoom(id);
    setHasSubscribed(true);
  }, [id, loadRoom]);

  if (!hasSubscribed || loading) return <Loading />;
  if (!roomState) return <RoomNotFound roomId={id} />;
  if (roomState.status === 'lobby') return <LobbyView roomId={id} roomState={roomState} />;
  return <BigScreenView roomId={id} roomState={roomState} />;
}
```

Notes:
- `'finished'` (and any post-`'started'` status) renders `BigScreenView`. The big screen already handles end-of-game UI.
- The previous lobby → `/play` `useNavigate` redirect is removed. Status flips re-render in place.
- `LobbyView` passes `url={buildJoinUrl(id)}` to `RoomQRCode` so the QR points to `/room/:id/player`.

## `PlayerJoinPage` — context-aware (join + rejoin)

Mirrors `krimi/src/pages/PlayerJoin.tsx`: one route handles both first-time join and rejoin, branching on `roomState.status`.

```tsx
export default function PlayerJoinPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { roomState, loading, loadRoom } = useGame();
  const [hasSubscribed, setHasSubscribed] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadRoom(id);
    setHasSubscribed(true);
  }, [id, loadRoom]);

  if (!hasSubscribed || loading) return <Loading />;
  if (!roomState) return <RoomNotFound roomId={id} />;
  if (roomState.status !== 'lobby') return <RejoinView roomId={id} roomState={roomState} />;
  return <NicknameJoinView roomId={id} roomState={roomState} />;
}
```

### `NicknameJoinView` (status === 'lobby')

- Text input for nickname (auto-focused).
- "Enter" / submit button (disabled when empty).
- On submit: call `useGame().joinRoom(id, name.trim())` — the existing context method already finds the next empty slot internally and returns the `slotId`. Then `navigate('/room/:id/player/:slotId', { replace: true })`.
- If `joinRoom` throws (room full, etc.), show the error inline. No redirect.
- Visual treatment: matches the existing colorlition theme (`Playfair` / `Source Sans` / paper cream from v3). No new components required beyond the form itself.

### `RejoinView` (status !== 'lobby')

- Header text: e.g. "Tap your name to rejoin."
- `<PlayerSlotsGrid players={roomState.players} filterEmpty buildSlotHref={(slotId) => buildPlayerUrl(id, slotId)} />` — same pattern as `react-unmatched/src/pages/RejoinPage.tsx:44`.
- No nickname input. Existing players only.

## `RoomNotFound` — shared error component

Shared by `RoomPage` and `PlayerJoinPage`. Lives at `src/components/shared/RoomNotFound.tsx` (next to other cross-page shared bits).

```tsx
export function RoomNotFound({ roomId }: { roomId?: string }) {
  return (
    <Stack /* themed paper cream container */>
      <Typography variant="h2">Room not found</Typography>
      <Typography>
        No game with code {roomId ? <code>{roomId}</code> : 'that code'}. Check the code on the host's screen.
      </Typography>
      <Button component={RouterLink} to="/">Back to home</Button>
    </Stack>
  );
}
```

The "back to home" is a user-tappable button, not an automatic `<Navigate>`. The point is to surface the bad code, not to silently bounce.

### Why the `hasSubscribed` flag

`useGame().roomState` is `null` both during the initial subscribe (before the first snapshot lands) and when the room genuinely doesn't exist (snapshot returned null). They look identical. The flag — set in the same effect that calls `loadRoom` — gates the not-found branch so it can only fire after at least one snapshot has resolved. Direct copy of the pattern at `krimi/src/pages/PlayerJoin.tsx:40`.

## QR wiring

Today: `<RoomQRCode roomId={id} />` — defaults to `buildRoomUrl` → `/room/:id`. Phone lands on the lobby (wrong).

After: `<RoomQRCode roomId={id} url={buildJoinUrl(id)} />` — phone lands on `/room/:id/player`.

`buildJoinUrl` is already exported by `react-gameroom` (`node_modules/react-gameroom/dist/index.mjs:23`).

## What the user sees, end to end

1. **Host on big screen, `/`:** taps "Create Game" → `/room/HJK5T`.
2. **`/room/HJK5T` (lobby phase):** room code, QR code (now pointing at `/room/HJK5T/player`), player slot grid, Start button.
3. **Player phone scans QR → `/room/HJK5T/player`:** nickname form. Type name → submit → auto-routed to `/room/HJK5T/player/3`.
4. **Host taps Start:** `/room/HJK5T` re-renders in place to the big-screen game view. No navigation.
5. **Player's phone disconnects, scans QR again → `/room/HJK5T/player`:** rejoin list. Tap own name → back to `/room/HJK5T/player/3`.
6. **Wrong code typed manually (`/room/ZZZZZ`):** "Room not found" error. Tap "Back to home" to return.

## Adjacent fix: clear stale `roomState` in `GameContext.loadRoom`

`src/contexts/GameContext.tsx:122-125` — when the Firebase snapshot returns null (room doesn't exist), the code sets `loading = false` but never clears `roomState`. With the old multi-route layout this rarely surfaced; with the unified `RoomPage`, navigating from a valid room to an invalid one would render the stale room's data instead of the not-found error.

Fix: set `setRoomState(null)` and `setGameState(null)` in the `if (!data)` branch. One change, in-scope for this work.

```tsx
if (!data) {
  setRoomState(null);   // ← add
  setGameState(null);   // ← add
  setLoading(false);
  return;
}
```

## Out of scope

- `PlayerPage` and `BigScreenPage` internals — untouched. Only their wrapping route changes.
- `GameContext` API surface — no method signatures change. `joinRoom` already does `findFirstEmptySlot` + `joinPlayer` and returns the slot id (`src/contexts/GameContext.tsx:159-180`); it throws `'Room not found'`, `'Game has already started'`, or `'Room is full'`, which the nickname form will display inline. Only the stale-state fix above touches this file.
- `react-gameroom` library — no new exports needed; `buildJoinUrl` and `PlayerSlotsGrid` already provide what's needed. The library's `buildRejoinUrl` → `/room/:id/players` becomes unused for this app, but no code in colorlition calls it. Worth flagging upstream as a "rejoin URL is now optional" note, but no action required here.
- i18n — colorlition has no i18n today; new copy stays English-only, consistent with the rest of the app.
- Theming/visual polish on the new `NicknameJoinView` and `RoomNotFound` — match the existing v3 theme (Playfair / Source Sans / paper cream). No new design tokens.

## Implementation notes

- `roomState.status !== 'lobby'` (rather than `=== 'started'`) is intentional — covers `'finished'` and any other post-lobby state, keeping rejoiners on the player list instead of the nickname form.
- The lobby's existing `useEffect` that navigated to `/room/:id/play` (`src/pages/LobbyPage.tsx:23-27`) must be deleted, not left as a no-op — leaving it would redirect into the deleted route.
