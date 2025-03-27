import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeColor, setThemeColor] = useState(() => 
    localStorage.getItem('themeColor') || '#ef4444'
  );
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

  useEffect(() => {
    const root = document.documentElement;
    const { r, g, b } = getRGBValues(themeColor);
    
    // Cores principais
    root.style.setProperty('--color-primary', themeColor);
    root.style.setProperty('--color-hover', adjustBrightness(themeColor, -15));
    root.style.setProperty('--color-active', adjustBrightness(themeColor, -25));
    root.style.setProperty('--color-primary-rgb', `${r}, ${g}, ${b}`);
    
    // Variações de cor
    root.style.setProperty('--color-primary-light', adjustBrightness(themeColor, 10));
    root.style.setProperty('--color-primary-dark', adjustBrightness(themeColor, -30));
    root.style.setProperty('--color-primary-ghost', `rgba(${r}, ${g}, ${b}, 0.1)`);
    
    // Cores de interação
    root.style.setProperty('--color-focus-ring', `rgba(${r}, ${g}, ${b}, 0.4)`);
    root.style.setProperty('--color-hover-overlay', `rgba(${r}, ${g}, ${b}, 0.05)`);
    
    // Cores de texto
    root.style.setProperty('--color-text', getContrastColor(themeColor));
    root.style.setProperty('--color-text-hover', adjustBrightness(getContrastColor(themeColor), -15));
    
    localStorage.setItem('themeColor', themeColor);
    localStorage.setItem('darkMode', isDarkMode);

    // Cores do modo claro/escuro
    if (isDarkMode) {
      root.style.setProperty('--color-bg', '#141414');
      root.style.setProperty('--color-bg-darker', '#0a0a0a');
      root.style.setProperty('--color-text-base', '#ffffff');
    } else {
      root.style.setProperty('--color-bg', '#ffffff');
      root.style.setProperty('--color-bg-darker', '#f3f4f6');
      root.style.setProperty('--color-text-base', '#1f2937');
    }
  }, [themeColor, isDarkMode]);

  return (
    <ThemeContext.Provider value={{ 
      themeColor, 
      setThemeColor, 
      isDarkMode, 
      setIsDarkMode,
      getContrastColor 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
