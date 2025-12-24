
import { useState, useEffect, useCallback } from 'react';
import type { ThemeSettings } from '../types';

const getInitialState = <T,>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved !== null ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const useTheme = () => {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    glassmorphism: getInitialState('glassmorphism', true),
    theme: getInitialState('theme', 'dark'),
    animatedGradient: getInitialState('animatedGradient', true),
    showTypingIndicator: getInitialState('showTypingIndicator', true),
    glassOpacity: getInitialState('glassOpacity', 0.1),
    glassBlur: getInitialState('glassBlur', 16),
    glassSaturate: getInitialState('glassSaturate', 180),
  });

  useEffect(() => {
    Object.entries(themeSettings).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });

    document.body.setAttribute('data-glassmorphism', String(themeSettings.glassmorphism));
    document.body.setAttribute('data-theme', themeSettings.theme);
    document.body.setAttribute('data-animated-gradient', String(themeSettings.animatedGradient));
    
    document.documentElement.style.setProperty('--glass-opacity', String(themeSettings.glassOpacity));
    document.documentElement.style.setProperty('--glass-blur', `${themeSettings.glassBlur}px`);
    document.documentElement.style.setProperty('--glass-saturate', `${themeSettings.glassSaturate}%`);

  }, [themeSettings]);

  const setThemeSetting = useCallback(<K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => {
    setThemeSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  return { themeSettings, setThemeSetting };
};