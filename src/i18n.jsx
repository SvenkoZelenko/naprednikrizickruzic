import { createContext, useContext, useState, useCallback } from 'react';

const translations = {
  hr: {
    app_title: 'Križić-Kružić',
    menu: { new_game: '🎮 Nova Igra', online: '🌐 Online Igra', leaderboard: '🏆 Leaderboard' },
    game: {
      player1: 'Igrač 1', player2: 'Igrač 2',
      start: 'Započni igru', cancel: 'Odustani',
      timer: 'Timer (30s po potezu)',
      reset: 'Resetiraj', back: 'Glavni izbornik',
      new_game_title: 'Nova Igra',
      anywhere: 'bilo gdje',
      board: 'ploča',
      turn: (name, sym, loc) => `${name} (${sym}) → ${loc}`,
      wins: (name) => `${name} pobjeđuje!`,
      draw: 'Neriješeno!',
      game_over: 'Kraj igre!',
      new_game_btn: 'Nova igra',
      menu_btn: 'Glavni izbornik',
      reset_confirm: 'Resetirati igru?',
      rating_line: (n1, d1, r1, n2, d2, r2) => `Rejting: ${n1} ${d1} (${r1}), ${n2} ${d2} (${r2})`,
    },
    auth: {
      title: 'Online igra',
      message: 'Prijavite se za online igru.',
      sign_in: '🔑 Prijavi se s Google računom',
      cancel: 'Odustani',
      loading: 'Prijava u tijeku...',
    },
    lobby: {
      sign_out: 'Odjavi se',
      back: '← Natrag',
      casual: '🎮 Casual igra',
      ranked: '🏅 Ranked igra',
      join: '🔗 Pridruži se',
      leaderboard: '🏆 Leaderboard',
      create: 'Stvori sobu',
      cancel: 'Odustani',
      waiting: 'Čekanje protivnika...',
      room_code: 'Kod sobe',
      join_btn: 'Pridruži se',
      room_input: 'Unesite kod',
      timer_label: 'Timer (30s po potezu)',
    },
    rules: {
      title: 'Pravila igre',
      close: 'Zatvori',
      p1: 'Ploča se sastoji od 9 malih polja (3×3 svako). Igrač 1 je ✕ (crvena), Igrač 2 je ○ (plava).',
      p2: '🎯 Istaknuta ploča je jedina gdje smijete igrati. Vaš potez šalje protivnika na odgovarajuće malo polje.',
      p3: '✅ Pobijedite na malom polju postavljanjem tri u nizu — osvajate to polje na velikoj ploči.',
      p4: '🏆 Pobijedite u igri osvajanjem tri mala polja u nizu. Ako je ciljana ploča zauzeta, igrate gdje god želite.',
    },
    leaderboard: { title: 'Leaderboard', close: 'Zatvori', empty: 'Nema igrača.', rank: '#', name: 'Ime', rating: 'Rating', wdl: 'W / D / L' },
  },
  en: {
    app_title: 'Ultimate TTT',
    menu: { new_game: '🎮 New Game', online: '🌐 Online Game', leaderboard: '🏆 Leaderboard' },
    game: {
      player1: 'Player 1', player2: 'Player 2',
      start: 'Start game', cancel: 'Cancel',
      timer: 'Timer (30s per turn)',
      reset: 'Reset', back: 'Main menu',
      new_game_title: 'New Game',
      anywhere: 'anywhere',
      board: 'board',
      turn: (name, sym, loc) => `${name} (${sym}) → ${loc}`,
      wins: (name) => `${name} wins!`,
      draw: 'Draw!',
      game_over: 'Game over!',
      new_game_btn: 'New game',
      menu_btn: 'Main menu',
      reset_confirm: 'Reset the game?',
      rating_line: (n1, d1, r1, n2, d2, r2) => `Rating: ${n1} ${d1} (${r1}), ${n2} ${d2} (${r2})`,
    },
    auth: {
      title: 'Online Game',
      message: 'Sign in to play online.',
      sign_in: '🔑 Sign in with Google',
      cancel: 'Cancel',
      loading: 'Signing in...',
    },
    lobby: {
      sign_out: 'Sign out',
      back: '← Back',
      casual: '🎮 Casual game',
      ranked: '🏅 Ranked game',
      join: '🔗 Join game',
      leaderboard: '🏆 Leaderboard',
      create: 'Create room',
      cancel: 'Cancel',
      waiting: 'Waiting for opponent...',
      room_code: 'Room code',
      join_btn: 'Join',
      room_input: 'Enter code',
      timer_label: 'Timer (30s per turn)',
    },
    rules: {
      title: 'Rules',
      close: 'Close',
      p1: 'The board consists of 9 small fields (3×3 each). Player 1 is ✕ (red), Player 2 is ○ (blue).',
      p2: '🎯 The highlighted board is the only one you can play on. Your move sends the opponent to the corresponding small board.',
      p3: '✅ Win a small board by getting three in a row — you claim that field on the big board.',
      p4: '🏆 Win the game by claiming three small boards in a row. If the target board is taken, play anywhere.',
    },
    leaderboard: { title: 'Leaderboard', close: 'Close', empty: 'No players yet.', rank: '#', name: 'Name', rating: 'Rating', wdl: 'W / D / L' },
  },
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('krizic_lang') || 'hr');
  const t = translations[lang];

  const toggle = useCallback(() => {
    setLang(l => {
      const next = l === 'hr' ? 'en' : 'hr';
      localStorage.setItem('krizic_lang', next);
      return next;
    });
  }, []);

  return (
    <I18nContext.Provider value={{ t, lang, toggle }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() { return useContext(I18nContext); }
