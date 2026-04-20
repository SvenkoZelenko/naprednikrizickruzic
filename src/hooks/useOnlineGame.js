import { useState, useEffect, useRef, useCallback } from 'react';
import { db, auth } from '../firebase';
import {
  doc, setDoc, updateDoc, getDoc, getDocs,
  onSnapshot, serverTimestamp, collection, query, orderBy,
} from 'firebase/firestore';
import { applyMove, initialGameState } from '../game/logic';
import { expectedScore } from '../game/elo';

const K = 32;
const TURN_TIME = 30;
const MAX_TIMEOUTS = 3;

function genCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function serializeState(gs) {
  return {
    bigBoard:     JSON.stringify(gs.bigBoard),
    smallBoards:  JSON.stringify(gs.smallBoards),
    currentPlayer: gs.currentPlayer,
    nextBoard:    gs.nextBoard ? JSON.stringify(gs.nextBoard) : null,
    winner:       gs.winner,
    draw:         gs.draw,
  };
}

function deserializeState(d) {
  return {
    bigBoard:      JSON.parse(d.bigBoard),
    smallBoards:   JSON.parse(d.smallBoards),
    currentPlayer: d.currentPlayer,
    nextBoard:     d.nextBoard ? JSON.parse(d.nextBoard) : null,
    winner:        d.winner ?? null,
    draw:          d.draw ?? false,
  };
}

export function useOnlineGame() {
  const [phase, setPhase]           = useState('idle'); // idle|creating|waiting|joining|playing|gameover
  const [roomCode, setRoomCode]     = useState('');
  const [gameData, setGameData]     = useState(null);  // Firestore doc data
  const [gameState, setGameState]   = useState(null);  // local UTT state
  const [myNumber, setMyNumber]     = useState(null);  // 1 or 2
  const [gameMode, setGameMode]     = useState(null);  // casual|ranked
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerSecs, setTimerSecs]   = useState(TURN_TIME);
  const [isWriting, setIsWriting]   = useState(false);
  const [gameOverResult, setGameOverResult] = useState(null);

  const gameIdRef     = useRef(null);
  const unsubRef      = useRef(null);
  const timerRef      = useRef(null);
  const timeoutsRef   = useRef({ 1: 0, 2: 0 });
  const gameDataRef   = useRef(null);

  // ── Timer ──────────────────────────────────────────────────────────────────
  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setTimerSecs(TURN_TIME);
  }, []);

  const startTimer = useCallback((onTimeout) => {
    clearTimer();
    setTimerSecs(TURN_TIME);
    let s = TURN_TIME;
    timerRef.current = setInterval(() => {
      s--;
      setTimerSecs(s);
      if (s <= 0) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        onTimeout();
      }
    }, 1000);
  }, [clearTimer]);

  // ── Create game ────────────────────────────────────────────────────────────
  const createGame = useCallback(async (mode, timer) => {
    const user = auth.currentUser;
    if (!user) return;
    const code   = genCode();
    const gameId = 'game_' + code;
    const init   = initialGameState();

    setPhase('creating');
    setGameMode(mode);
    setTimerEnabled(timer);
    setRoomCode(code);

    const playerSnap = await getDoc(doc(db, 'players', user.uid));
    const rating     = playerSnap.exists() ? (playerSnap.data().rating ?? 1200) : 1200;

    await setDoc(doc(db, 'games', gameId), {
      gameCode: code, mode, status: 'waiting',
      player1uid: user.uid,
      player1name: user.displayName || user.email,
      player1rating: rating,
      timerEnabled: timer,
      createdAt: serverTimestamp(),
      ...serializeState(init),
    });

    gameIdRef.current = gameId;
    setMyNumber(1);
    setPhase('waiting');
    subscribeToGame(gameId, 1, timer);
  }, []);

  // ── Join game ──────────────────────────────────────────────────────────────
  const joinGame = useCallback(async (code) => {
    const user   = auth.currentUser;
    if (!user) return null;
    const gameId = 'game_' + code.toUpperCase();
    const snap   = await getDoc(doc(db, 'games', gameId));
    if (!snap.exists() || snap.data().status !== 'waiting') return 'not_found';
    if (snap.data().player1uid === user.uid) return 'self';

    const playerSnap = await getDoc(doc(db, 'players', user.uid));
    const rating     = playerSnap.exists() ? (playerSnap.data().rating ?? 1200) : 1200;

    await updateDoc(doc(db, 'games', gameId), {
      player2uid:  user.uid,
      player2name: user.displayName || user.email,
      player2rating: rating,
      status: 'active',
    });

    gameIdRef.current = gameId;
    setMyNumber(2);
    setGameMode(snap.data().mode);
    setTimerEnabled(snap.data().timerEnabled);
    setRoomCode(code.toUpperCase());
    setPhase('playing');
    subscribeToGame(gameId, 2, snap.data().timerEnabled);
    return 'ok';
  }, []);

  // ── Subscribe to Firestore game doc ────────────────────────────────────────
  function subscribeToGame(gameId, myNum, timer) {
    if (unsubRef.current) unsubRef.current();
    unsubRef.current = onSnapshot(doc(db, 'games', gameId), (snap) => {
      if (!snap.exists()) return;
      const data = snap.data();
      gameDataRef.current = data;
      setGameData(data);

      if (data.status === 'waiting') {
        setPhase('waiting');
        return;
      }

      if (data.status === 'active') {
        const gs = deserializeState(data);
        setGameState(gs);
        setPhase('playing');

        if (timer && !gs.winner && !gs.draw) {
          startTimer(() => handleOnlineTimeout(gameId, myNum, gs));
        }
        return;
      }

      if (data.status === 'finished' || data.status === 'left') {
        clearTimer();
        const gs = deserializeState(data);
        setGameState(gs);

        const isAbandoned = data.status === 'left';
        const leaverUid   = data.leftBy;
        const myUid       = auth.currentUser?.uid;

        if (isAbandoned && leaverUid && leaverUid !== myUid) {
          // Stayer wins by forfeit
          setGameOverResult({
            winner: myNum,
            abandoned: true,
            player1name: data.player1name,
            player2name: data.player2name,
            delta1: null, delta2: null,
          });
        } else {
          setGameOverResult({
            winner: data.winner ?? null,
            draw:   data.draw ?? false,
            abandoned: false,
            player1name: data.player1name,
            player2name: data.player2name,
            delta1: data.eloDelta1 ?? null,
            delta2: data.eloDelta2 ?? null,
            newRating1: data.newRating1 ?? null,
            newRating2: data.newRating2 ?? null,
          });
        }
        setPhase('gameover');
      }
    });
  }

  // ── Play a move ────────────────────────────────────────────────────────────
  const playMove = useCallback(async (br, bc, r, c) => {
    const gs = gameState;
    if (!gs || isWriting) return;
    if (gs.currentPlayer !== myNumber) return;

    const next = applyMove(gs, br, bc, r, c);
    if (!next) return;

    setIsWriting(true);
    clearTimer();

    const update = { ...serializeState(next) };

    if (next.winner || next.draw) {
      update.status = 'finished';
      update.winner = next.winner;
      update.draw   = next.draw;
      // Write ELO deltas (Player 1 always computes)
      if (myNumber === 1) {
        const data = gameDataRef.current;
        const r1   = data.player1rating ?? 1200;
        const r2   = data.player2rating ?? 1200;
        const scoreP1 = next.winner === 1 ? 1 : next.winner === 2 ? 0 : 0.5;
        const exp  = expectedScore(r1, r2);
        const d1   = Math.round(K * (scoreP1 - exp));
        update.eloDelta1  = d1;
        update.eloDelta2  = -d1;
        update.newRating1 = Math.max(100, r1 + d1);
        update.newRating2 = Math.max(100, r2 - d1);
        // Persist to Firestore player docs
        persistRatings(data, scoreP1, r1, r2, d1);
      }
    }

    try {
      await updateDoc(doc(db, 'games', gameIdRef.current), update);
      timeoutsRef.current[myNumber] = 0;
    } catch (err) {
      console.error('Move write error:', err);
    } finally {
      setIsWriting(false);
    }
  }, [gameState, myNumber, isWriting, clearTimer]);

  async function persistRatings(data, scoreP1, r1, r2, d1) {
    try {
      const [s1, s2] = await Promise.all([
        getDoc(doc(db, 'players', data.player1uid)),
        getDoc(doc(db, 'players', data.player2uid)),
      ]);
      const p1data = s1.data() ?? {};
      const p2data = s2.data() ?? {};
      await Promise.all([
        updateDoc(doc(db, 'players', data.player1uid), {
          rating: Math.max(100, r1 + d1),
          games: (p1data.games ?? 0) + 1,
          wins:   (p1data.wins ?? 0)   + (scoreP1 === 1 ? 1 : 0),
          losses: (p1data.losses ?? 0) + (scoreP1 === 0 ? 1 : 0),
          draws:  (p1data.draws ?? 0)  + (scoreP1 === 0.5 ? 1 : 0),
          updatedAt: serverTimestamp(),
        }),
        updateDoc(doc(db, 'players', data.player2uid), {
          rating: Math.max(100, r2 - d1),
          games: (p2data.games ?? 0) + 1,
          wins:   (p2data.wins ?? 0)   + (scoreP1 === 0 ? 1 : 0),
          losses: (p2data.losses ?? 0) + (scoreP1 === 1 ? 1 : 0),
          draws:  (p2data.draws ?? 0)  + (scoreP1 === 0.5 ? 1 : 0),
          updatedAt: serverTimestamp(),
        }),
      ]);
    } catch (e) { console.error('persistRatings error:', e); }
  }

  // ── Timeout ────────────────────────────────────────────────────────────────
  async function handleOnlineTimeout(gameId, myNum, gs) {
    // Only the active player handles their own timeout
    if (gs.currentPlayer !== myNum) return;
    timeoutsRef.current[myNum] = (timeoutsRef.current[myNum] ?? 0) + 1;

    if (timeoutsRef.current[myNum] >= MAX_TIMEOUTS) {
      // Forfeit
      const data = gameDataRef.current;
      const loserRating  = myNum === 1 ? (data.player1rating ?? 1200) : (data.player2rating ?? 1200);
      const winnerRating = myNum === 1 ? (data.player2rating ?? 1200) : (data.player1rating ?? 1200);
      const scoreP1 = myNum === 1 ? 0 : 1;
      const exp  = expectedScore(data.player1rating ?? 1200, data.player2rating ?? 1200);
      const d1   = Math.round(K * (scoreP1 - exp));

      await updateDoc(doc(db, 'games', gameId), {
        status: 'finished',
        winner: myNum === 1 ? 2 : 1,
        leftBy: auth.currentUser?.uid,
        eloDelta1: d1, eloDelta2: -d1,
        newRating1: Math.max(100, (data.player1rating ?? 1200) + d1),
        newRating2: Math.max(100, (data.player2rating ?? 1200) - d1),
      }).catch(() => {});
      persistRatings(data, scoreP1, data.player1rating ?? 1200, data.player2rating ?? 1200, d1);
      return;
    }

    // Skip turn
    const skipped = {
      ...gs,
      currentPlayer: gs.currentPlayer === 1 ? 2 : 1,
    };
    await updateDoc(doc(db, 'games', gameId), serializeState(skipped)).catch(() => {});
  }

  // ── Leave game ─────────────────────────────────────────────────────────────
  const leaveGame = useCallback(async () => {
    clearTimer();
    const gameId = gameIdRef.current;
    const data   = gameDataRef.current;

    if (gameId && data && data.status === 'active') {
      const myUid = auth.currentUser?.uid;
      // Self-penalize leaver ELO
      if (data.mode === 'ranked') {
        const loserNum = myNumber;
        const scoreP1  = loserNum === 1 ? 0 : 1;
        const r1 = data.player1rating ?? 1200;
        const r2 = data.player2rating ?? 1200;
        const exp = expectedScore(r1, r2);
        const d1  = Math.round(K * (scoreP1 - exp));
        await updateDoc(doc(db, 'games', gameId), {
          status: 'left', leftBy: myUid,
          eloDelta1: d1, eloDelta2: -d1,
          newRating1: Math.max(100, r1 + d1),
          newRating2: Math.max(100, r2 - d1),
        }).catch(() => {});
        persistRatings(data, scoreP1, r1, r2, d1);
      } else {
        await updateDoc(doc(db, 'games', gameId), { status: 'left', leftBy: myUid }).catch(() => {});
      }
    } else if (gameId && data && data.status === 'waiting') {
      await updateDoc(doc(db, 'games', gameId), { status: 'cancelled' }).catch(() => {});
    }

    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
    gameIdRef.current = null;
    gameDataRef.current = null;
    setGameData(null);
    setGameState(null);
    setMyNumber(null);
    setPhase('idle');
    setGameOverResult(null);
    setRoomCode('');
    timeoutsRef.current = { 1: 0, 2: 0 };
  }, [clearTimer, myNumber]);

  // ── Leaderboard ────────────────────────────────────────────────────────────
  const fetchLeaderboard = useCallback(async () => {
    const snap = await getDocs(query(collection(db, 'players'), orderBy('rating', 'desc')));
    return snap.docs.map(d => d.data());
  }, []);

  // Cleanup on unmount
  useEffect(() => () => {
    if (unsubRef.current) unsubRef.current();
    clearTimer();
  }, [clearTimer]);

  return {
    phase, roomCode, gameData, gameState, myNumber, gameMode,
    timerEnabled, timerSecs, gameOverResult, isWriting,
    createGame, joinGame, playMove, leaveGame, fetchLeaderboard,
    setPhase,
  };
}
