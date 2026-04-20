import { useState, useCallback } from 'react';
import Background from './components/Background';
import Menu from './components/Menu';
import NameDialog from './components/NameDialog';
import GameBoard from './components/GameBoard';
import GameOverDialog from './components/GameOverDialog';
import Leaderboard from './components/Leaderboard';
import RulesDialog from './components/RulesDialog';
import AuthScreen from './components/AuthScreen';
import OnlineLobby from './components/OnlineLobby';
import WaitingRoom from './components/WaitingRoom';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { useOnlineGame } from './hooks/useOnlineGame';
import { useI18n } from './i18n';
import { initialGameState, applyMove } from './game/logic';
import { ensurePlayer, updateRatings } from './game/elo';

// ── Screen identifiers ────────────────────────────────────────────────────────
// menu | nameDialog | localGame | auth | lobby | waiting | onlineGame

export default function App() {
  const { t, lang, toggle: toggleLang } = useI18n();
  const { dark, toggle: toggleTheme }   = useTheme();
  const { user, loading: authLoading, error: authError, signIn, signOut } = useAuth();
  const online = useOnlineGame();

  // ── Screen state ──────────────────────────────────────────────────────────
  const [screen, setScreen]       = useState('menu');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // ── Local game state ──────────────────────────────────────────────────────
  const [gs, setGs]               = useState(null);
  const [p1name, setP1name]       = useState('');
  const [p2name, setP2name]       = useState('');
  const [localTimer, setLocalTimer] = useState(false);
  const [timerSecs, setTimerSecs] = useState(30);
  const [timerHandle, setTimerHandle] = useState(null);
  const [localResult, setLocalResult] = useState(null); // ELO deltas after game
  const [showGameOver, setShowGameOver] = useState(false);

  // ── Local timer logic ─────────────────────────────────────────────────────
  function clearLocalTimer() {
    setTimerHandle(h => { if (h) clearInterval(h); return null; });
    setTimerSecs(30);
  }

  function startLocalTimer(currentGs) {
    clearLocalTimer();
    if (!localTimer || (currentGs.winner || currentGs.draw)) return;
    let s = 30;
    setTimerSecs(30);
    const h = setInterval(() => {
      s--;
      setTimerSecs(s);
      if (s <= 0) {
        clearInterval(h);
        setTimerHandle(null);
        // Skip the current player's turn
        setGs(prev => {
          if (!prev || prev.winner || prev.draw) return prev;
          const skipped = { ...prev, currentPlayer: prev.currentPlayer === 1 ? 2 : 1 };
          startLocalTimer(skipped);
          return skipped;
        });
      }
    }, 1000);
    setTimerHandle(h);
  }

  // ── Local game handlers ───────────────────────────────────────────────────
  function handleStartLocal({ p1, p2, timer }) {
    ensurePlayer(p1); ensurePlayer(p2);
    setP1name(p1); setP2name(p2);
    setLocalTimer(timer);
    setLocalResult(null);
    setShowGameOver(false);
    const init = initialGameState();
    setGs(init);
    setScreen('localGame');
    if (timer) startLocalTimer(init);
  }

  function handleLocalMove(br, bc, r, c) {
    setGs(prev => {
      if (!prev) return prev;
      const next = applyMove(prev, br, bc, r, c);
      if (!next) return prev;
      clearLocalTimer();
      if (next.winner || next.draw) {
        const scoreP1 = next.winner === 1 ? 1 : next.winner === 2 ? 0 : 0.5;
        const ru = updateRatings(p1name, p2name, scoreP1);
        setLocalResult(ru);
        setTimeout(() => setShowGameOver(true), 700);
      } else {
        startLocalTimer(next);
      }
      return next;
    });
  }

  function handleLocalReset() {
    clearLocalTimer();
    setLocalResult(null);
    setShowGameOver(false);
    const init = initialGameState();
    setGs(init);
    if (localTimer) startLocalTimer(init);
  }

  function handleBackToMenu() {
    clearLocalTimer();
    setGs(null);
    setLocalResult(null);
    setShowGameOver(false);
    online.leaveGame().catch(() => {});
    setScreen('menu');
  }

  // ── Online flow ───────────────────────────────────────────────────────────
  function handleOnlineBtn() {
    if (user) setScreen('lobby');
    else      setScreen('auth');
  }

  async function handleSignIn() {
    await signIn();
    if (user) setScreen('lobby'); // onAuthStateChanged will update user
  }

  // Watch for user becoming available after sign-in
  // (useAuth sets user via onAuthStateChanged)
  const handleSignedIn = useCallback(() => {
    if (screen === 'auth' && user) setScreen('lobby');
  }, [screen, user]);

  // Simple effect substitute: derive lobby navigation from user+screen
  if (screen === 'auth' && user && !authLoading) {
    // User just signed in — go to lobby
    setTimeout(() => setScreen('lobby'), 0);
  }

  async function handleCreateCasual(timer) {
    await online.createGame('casual', timer);
    setScreen('waiting');
  }
  async function handleCreateRanked() {
    await online.createGame('ranked', true);
    setScreen('waiting');
  }
  async function handleJoin(code) {
    const result = await online.joinGame(code);
    if (result === 'ok') setScreen('onlineGame');
    return result;
  }

  // Sync screen from online phase
  const onlinePhase = online.phase;
  if (screen === 'waiting' && onlinePhase === 'playing') {
    setTimeout(() => setScreen('onlineGame'), 0);
  }
  if (screen === 'onlineGame' && onlinePhase === 'idle') {
    setTimeout(() => setScreen('lobby'), 0);
  }

  // ── Render helpers ────────────────────────────────────────────────────────
  const p1online = online.gameData?.player1name ?? '';
  const p2online = online.gameData?.player2name ?? '';
  const isP1 = online.myNumber === 1;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Background />

      {/* ── Menu ── */}
      {screen === 'menu' && (
        <Menu
          onNewGame={() => setScreen('nameDialog')}
          onOnline={handleOnlineBtn}
          onLeaderboard={() => setShowLeaderboard(true)}
        />
      )}

      {/* ── Name dialog ── */}
      {screen === 'nameDialog' && (
        <div className="screen screen-center">
          <div className="menu-content">
            <div className="game-logo">{t.app_title}</div>
          </div>
          <NameDialog
            show={true}
            defaultP1={p1name}
            defaultP2={p2name}
            onStart={handleStartLocal}
            onCancel={() => setScreen('menu')}
          />
        </div>
      )}

      {/* ── Local game ── */}
      {screen === 'localGame' && gs && (
        <div className="screen screen-game">
          <GameBoard
            gs={gs}
            p1name={p1name}
            p2name={p2name}
            onMove={handleLocalMove}
            timerEnabled={localTimer}
            timerSecs={timerSecs}
            onReset={handleLocalReset}
            onBack={handleBackToMenu}
            result={gs?.winner || gs?.draw ? localResult : null}
          />
          <GameOverDialog
            show={showGameOver}
            p1name={p1name} p2name={p2name}
            winner={gs?.winner} draw={gs?.draw}
            delta1={localResult?.delta1} delta2={localResult?.delta2}
            newRating1={localResult?.rating1} newRating2={localResult?.rating2}
            onNewGame={() => { setShowGameOver(false); handleLocalReset(); }}
            onMenu={handleBackToMenu}
          />
        </div>
      )}

      {/* ── Auth ── */}
      {screen === 'auth' && (
        <AuthScreen
          onSignIn={handleSignIn}
          onCancel={() => setScreen('menu')}
          loading={authLoading}
          error={authError}
        />
      )}

      {/* ── Online lobby ── */}
      {screen === 'lobby' && user && (
        <OnlineLobby
          user={user}
          onBack={() => setScreen('menu')}
          onSignOut={() => { signOut(); setScreen('menu'); }}
          onCreateCasual={handleCreateCasual}
          onCreateRanked={handleCreateRanked}
          onJoin={handleJoin}
          fetchLeaderboard={online.fetchLeaderboard}
        />
      )}

      {/* ── Waiting room ── */}
      {screen === 'waiting' && (
        <WaitingRoom
          roomCode={online.roomCode}
          onCancel={() => { online.leaveGame(); setScreen('lobby'); }}
        />
      )}

      {/* ── Online game ── */}
      {screen === 'onlineGame' && online.gameState && (
        <div className="screen screen-game">
          <GameBoard
            gs={online.gameState}
            p1name={p1online}
            p2name={p2online}
            myNumber={online.myNumber}
            onMove={(br, bc, r, c) => online.playMove(br, bc, r, c)}
            timerEnabled={online.timerEnabled}
            timerSecs={online.timerSecs}
            onBack={handleBackToMenu}
            result={online.gameOverResult}
          />
          {online.gameOverResult && (
            <GameOverDialog
              show={true}
              p1name={p1online} p2name={p2online}
              winner={online.gameOverResult.winner}
              draw={online.gameOverResult.draw}
              abandoned={online.gameOverResult.abandoned}
              delta1={online.gameOverResult.delta1}
              delta2={online.gameOverResult.delta2}
              newRating1={online.gameOverResult.newRating1}
              newRating2={online.gameOverResult.newRating2}
              onNewGame={() => { online.leaveGame(); setScreen('lobby'); }}
              onMenu={handleBackToMenu}
            />
          )}
        </div>
      )}

      {/* ── Global overlays ── */}
      <Leaderboard show={showLeaderboard} onClose={() => setShowLeaderboard(false)} />
      <RulesDialog show={showRules} onClose={() => setShowRules(false)} />

      {/* ── Corner controls ── */}
      <div className="corner-controls">
        <button className="corner-btn" onClick={() => setShowRules(true)} title="Pravila">?</button>
        <button className="corner-btn" onClick={toggleTheme} title="Tema">
          {dark ? '☀️' : '🌙'}
        </button>
        <button className="corner-btn corner-btn-lang" onClick={toggleLang}>
          {lang === 'hr' ? 'EN' : 'HR'}
        </button>
      </div>
    </>
  );
}
