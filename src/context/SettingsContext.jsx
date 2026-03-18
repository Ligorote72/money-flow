import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

export const useSettings = () => useContext(SettingsContext);

const THEMES = [
  { id: 'obsidian', label: 'Obsidian', primary: '#c4fb6d', bg: '#0c0c0e', surface: '#1a1a1e', rgb: '196, 251, 109' },
  { id: 'gold',     label: 'Oro Lujo', primary: '#d4af37', bg: '#0a0a0a', surface: '#1c1c16', rgb: '212, 175, 55' },
  { id: 'ocean',    label: 'Océano',   primary: '#007aff', bg: '#050a14', surface: '#0e1a2d', rgb: '0, 122, 255' },
  { id: 'emerald',  label: 'Esmeralda', primary: '#10b981', bg: '#061108', surface: '#0e2012', rgb: '16, 185, 129' },
  { id: 'midnight', label: 'Medianoche', primary: '#bf5af2', bg: '#0d0214', surface: '#1a0526', rgb: '191, 90, 242' },
  { id: 'neon',     label: 'Neon Pink',  primary: '#ff2d55', bg: '#0d0d0d', surface: '#1a1a1a', rgb: '255, 45, 85' },
  { id: 'sunset',   label: 'Atardecer',  primary: '#ff9500', bg: '#120d0a', surface: '#1e140f', rgb: '255, 149, 0' },
];

export { THEMES };

export const SettingsProvider = ({ children }) => {
  const [username,    setUsername]    = useState(() => localStorage.getItem('mf-username')    || '');
  const [darkMode,    setDarkMode]    = useState(() => localStorage.getItem('mf-dark') !== 'false');
  const [themeId,     setThemeId]     = useState(() => localStorage.getItem('mf-theme-id')    || 'obsidian');
  const [hideBalance, setHideBalance] = useState(false);

  useEffect(() => { localStorage.setItem('mf-username', username);    }, [username]);
  useEffect(() => { localStorage.setItem('mf-dark',     darkMode);    }, [darkMode]);
  useEffect(() => { localStorage.setItem('mf-theme-id', themeId);     }, [themeId]);

  // Aplicar variables CSS globales
  useEffect(() => {
    const root = document.documentElement;
    const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
    
    root.style.setProperty('--primary',     theme.primary);
    root.style.setProperty('--primary-rgb', theme.rgb);
    root.style.setProperty('--bg-color',    theme.bg);
    root.style.setProperty('--surface-color', theme.surface);
    
    if (darkMode) {
      root.style.setProperty('--text-main', '#ffffff');
      root.style.setProperty('--text-dim',  '#a1a1a6');
    } else {
      // Ajuste ligero para modo claro basado en el tema
      root.style.setProperty('--bg-color', '#f2f2f7');
      root.style.setProperty('--surface-color', '#ffffff');
      root.style.setProperty('--text-main', '#000000');
      root.style.setProperty('--text-dim',  '#6c6c70');
    }
  }, [darkMode, themeId]);

  return (
    <SettingsContext.Provider value={{
      username, setUsername,
      darkMode, setDarkMode,
      themeId, setThemeId,
      hideBalance, setHideBalance,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
