import { createContext, useContext, useState, useCallback } from 'react';

const translations = {
  hr: {
    app_title: 'Ultimativni Križić-Kružić',
    modes: {
      mode_classic:      'Klasično',
      mode_classic_desc: 'Osvojeno polje se zaključava.',
      mode_zrules:       'Z Rules',
      mode_zrules_desc:  'Osvojeno polje ostaje aktivno dok se ne popuni.',
      mode_steal:        'Z Rules + Preotimanje',
      mode_steal_desc:   'Možeš preoteti protivnikovo zauzeto mjesto.',
    },
    menu: {
      new_game:  'Nova Igra',
      online:    'Online Igra',
      leaderboard: 'Leaderboard',
      game_mode: 'Odaberi mod igre',
    },
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
      rating_line: (n1, d1, r1, n2, d2, r2) =>
        `Rejting: ${n1} ${d1} (${r1}), ${n2} ${d2} (${r2})`,
    },
    auth: {
      message: 'Prijavite se za online igru.',
      sign_in: 'Prijavi se s Google računom',
      cancel: 'Odustani',
      loading: 'Prijava u tijeku...',
    },
    lobby: {
      sign_out: 'Odjavi se', back: '← Natrag',
      casual: 'Casual igra', ranked: 'Ranked igra',
      join: 'Pridruži se', leaderboard: 'Leaderboard',
      create: 'Stvori sobu', cancel: 'Odustani',
      waiting: 'Čekanje protivnika...',
      room_code: 'Kod sobe', join_btn: 'Pridruži se',
      room_input: 'Unesite kod', timer_label: 'Timer (30s po potezu)',
    },
    rules: {
      title: 'Pravila igre',
      close: 'Zatvori',
      common: 'Potez unutar malog polja (pozicija r,c) određuje u koje malo polje protivnik igra sljedeće. Ako je ciljna ploča zauzeta (zaključana), možeš igrati bilo gdje.',
      classic: 'Standardni Ultimate TTT. Kada igrač pobijedi na malom polju, to se polje zaključava i više se ne može igrati u njemu. Tri osvajanja u nizu na velikoj ploči = pobjeda.',
      zrules:  'Osvojeno polje prikazuje pobjednika, ali ostaje aktivno i u njemu se nastavlja igra sve dok se sve ćelije ne popune. Rezultat malog polja se može promijeniti!',
      steal:   'Sve isto kao Z Rules, uz jednu razliku — možeš kliknuti na protivnikovu ćeliju i preoteti je. Vlastite ćelije ne možeš preoteti. Šteti strategiju protivnika.',
    },
    leaderboard: {
      title: 'Leaderboard', close: 'Zatvori',
      empty: 'Nema igrača.', rank: '#',
      name: 'Ime', rating: 'Rating', wdl: 'W / D / L',
    },
  },

  en: {
    app_title: 'Ultimative TTT',
    modes: {
      mode_classic:      'Classic',
      mode_classic_desc: 'Won boards are locked.',
      mode_zrules:       'Z Rules',
      mode_zrules_desc:  'Won boards stay active until fully filled.',
      mode_steal:        'Z Rules + Steal',
      mode_steal_desc:   "You can steal the opponent's cells.",
    },
    menu: {
      new_game:  'New Game',
      online:    'Online Game',
      leaderboard: 'Leaderboard',
      game_mode: 'Choose game mode',
    },
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
      rating_line: (n1, d1, r1, n2, d2, r2) =>
        `Rating: ${n1} ${d1} (${r1}), ${n2} ${d2} (${r2})`,
    },
    auth: {
      message: 'Sign in to play online.',
      sign_in: 'Sign in with Google',
      cancel: 'Cancel',
      loading: 'Signing in...',
    },
    lobby: {
      sign_out: 'Sign out', back: '← Back',
      casual: 'Casual game', ranked: 'Ranked game',
      join: 'Join game', leaderboard: 'Leaderboard',
      create: 'Create room', cancel: 'Cancel',
      waiting: 'Waiting for opponent...',
      room_code: 'Room code', join_btn: 'Join',
      room_input: 'Enter code', timer_label: 'Timer (30s per turn)',
    },
    rules: {
      title: 'Rules',
      close: 'Close',
      common: 'Your move position (r,c) inside a small board sends the opponent to the corresponding small board next. If that board is locked, they may play anywhere.',
      classic: 'Standard Ultimate TTT. When a player wins a small board it locks — no more moves there. Three wins in a row on the big board = victory.',
      zrules:  'Won boards display the winner but stay open for play until all 9 cells are physically filled. The small board outcome can change!',
      steal:   "Same as Z Rules, but you can click an opponent's cell to overwrite it. You cannot overwrite your own cells. Disrupts the opponent's strategy.",
    },
    leaderboard: {
      title: 'Leaderboard', close: 'Close',
      empty: 'No players yet.', rank: '#',
      name: 'Name', rating: 'Rating', wdl: 'W / D / L',
    },
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
