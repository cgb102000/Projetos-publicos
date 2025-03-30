import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeColor, setThemeColor] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.tema_cor || localStorage.getItem('userThemeColor') || '#ef4444';
  });
  const [isDarkMode, setIsDarkMode] = useState(() =>
    localStorage.getItem('darkMode') !== 'false'
  );

  const getRGBValues = (hex) => {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return { r, g, b };
  };

  const adjustBrightness = (hex, percent) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(Math.min((num >> 16) + amt, 255), 0);
    const G = Math.max(Math.min((num >> 8 & 0x00FF) + amt, 255), 0);
    const B = Math.max(Math.min((num & 0x0000FF) + amt, 255), 0);
    
    const newHex = '#' + (
      0x1000000 +
      (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 0 ? 0 : B) : 255)
    ).toString(16).slice(1);
    
    return newHex;
  };

  const getContrastColor = (hexcolor) => {
    const r = parseInt(hexcolor.slice(1,3), 16);
    const g = parseInt(hexcolor.slice(3,5), 16);
    const b = parseInt(hexcolor.slice(5,7), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
  };

  const resetToDefaultTheme = () => {
    const defaultColor = '#ef4444';
    // Limpar todas as cores salvas
    localStorage.removeItem('userThemeColor');
    localStorage.removeItem('tema_cor');
    
    // Aplicar cor padrão
    setThemeColor(defaultColor);
    const root = document.documentElement;
    root.style.setProperty('--color-primary', defaultColor);
    root.style.setProperty('--color-hover', adjustBrightness(defaultColor, -15));
    root.style.setProperty('--color-active', adjustBrightness(defaultColor, -30));
    
    const { r, g, b } = getRGBValues(defaultColor);
    root.style.setProperty('--color-primary-rgb', `${r}, ${g}, ${b}`);
    root.style.setProperty('--color-primary-ghost', `rgba(${r}, ${g}, ${b}, 0.15)`);
    root.style.setProperty('--color-primary-glow', `rgba(${r}, ${g}, ${b}, 0.5)`);
  };

  const applyUserTheme = (userThemeColor) => {
    if (userThemeColor) {
      setThemeColor(userThemeColor);
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    const savedColor = localStorage.getItem('userThemeColor') || themeColor;
    const { r, g, b } = getRGBValues(savedColor);
    
    // Cores principais - usar a cor salva ou atual
    root.style.setProperty('--color-primary', savedColor);
    root.style.setProperty('--color-hover', adjustBrightness(savedColor, -15));
    
    // Cores principais e variações
    root.style.setProperty('--color-active', adjustBrightness(savedColor, -30));
    
    // Variações de opacidade e efeitos
    root.style.setProperty('--color-primary-rgb', `${r}, ${g}, ${b}`);
    root.style.setProperty('--color-primary-ghost', `rgba(${r}, ${g}, ${b}, 0.15)`);
    root.style.setProperty('--color-primary-glow', `rgba(${r}, ${g}, ${b}, 0.5)`);
    root.style.setProperty('--color-hover-overlay', `rgba(${r}, ${g}, ${b}, 0.1)`);
    
    // Variações para diferentes estados
    root.style.setProperty('--color-primary-light', adjustBrightness(savedColor, 15));
    root.style.setProperty('--color-primary-dark', adjustBrightness(savedColor, -25));

    // Cores do modo claro/escuro (mantém a cor do tema)
    if (isDarkMode) {
      root.style.setProperty('--color-bg', '#141414');
      root.style.setProperty('--color-bg-darker', '#0a0a0a');
      root.style.setProperty('--color-text-base', '#ffffff');
      root.style.setProperty('--color-text-secondary', '#9ca3af');
      root.style.setProperty('--color-border', '#374151');
      root.style.setProperty('--color-input-bg', '#1f2937');
    } else {
      root.style.setProperty('--color-bg', '#ffffff');
      root.style.setProperty('--color-bg-darker', '#f3f4f6');
      root.style.setProperty('--color-text-base', '#111827');
      root.style.setProperty('--color-text-secondary', '#4b5563');
      root.style.setProperty('--color-border', '#e5e7eb');
      root.style.setProperty('--color-input-bg', '#f9fafb');
    }

    // Ajuste automático do contraste do texto
    const textColor = isDarkMode ? '#ffffff' : '#111827';
    root.style.setProperty('--color-text', textColor);

    // Salvar a cor atual
    localStorage.setItem('userThemeColor', savedColor);
    localStorage.setItem('darkMode', isDarkMode);
  }, [themeColor, isDarkMode]);

  return (
    <ThemeContext.Provider value={{ 
      themeColor, 
      setThemeColor, 
      isDarkMode, 
      setIsDarkMode,
      getContrastColor,
      resetToDefaultTheme,
      applyUserTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
