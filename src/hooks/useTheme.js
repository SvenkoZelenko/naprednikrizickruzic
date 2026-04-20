import { useEffect, useState } from 'react';

export function useTheme() {
  const [dark, setDark] = useState(() => localStorage.getItem('krizic_theme') === 'dark');

  useEffect(() => {
    document.body.classList.toggle('dark-mode', dark);
    localStorage.setItem('krizic_theme', dark ? 'dark' : 'light');
  }, [dark]);

  return { dark, toggle: () => setDark(d => !d) };
}
