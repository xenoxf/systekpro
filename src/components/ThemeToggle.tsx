import React, { useEffect, useState } from 'react';
import { IconSun, IconMoon } from '@tabler/icons-react';

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    setIsLight(stored === 'light' || (!stored && prefersLight));
  }, []);

  const toggle = () => {
    const next = !isLight;
    document.documentElement.classList.toggle('light', next);
    localStorage.setItem('theme', next ? 'light' : 'dark');
    setIsLight(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label={isLight ? 'Modo oscuro' : 'Modo claro'}
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
