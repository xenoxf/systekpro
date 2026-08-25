import React, { useEffect, useState } from 'react';
import { IconSun, IconMoon } from '@tabler/icons-react';

const THEME_EVENT = 'theme-change';

function readStoredTheme(): boolean {
  try {
    return localStorage.getItem('theme') !== 'dark';
  } catch {
    return true;
  }
}

function applyTheme(isLight: boolean) {
  document.documentElement.classList.toggle('dark', !isLight);
  try {
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  } catch {
    /* noop */
  }
}

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(true);

  useEffect(() => {
    const initial = readStoredTheme();
    setIsLight(initial);
    applyTheme(initial);

    const sync = (e: Event) => {
      setIsLight((e as CustomEvent<boolean>).detail);
    };
    window.addEventListener(THEME_EVENT, sync);
    return () => window.removeEventListener(THEME_EVENT, sync);
  }, []);

  const toggle = () => {
    const next = !isLight;
    setIsLight(next);
    applyTheme(next);
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: next }));
  };

  return (
    <button
      onClick={toggle}
      aria-label={isLight ? 'Activar modo oscuro' : 'Activar modo claro'}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem',
        background: 'none', border: '1px solid hsl(var(--border))',
        color: 'hsl(var(--muted-foreground))', cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'hsl(var(--muted))'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >
      {isLight ? <IconMoon size={18} /> : <IconSun size={18} />}
    </button>
  );
}