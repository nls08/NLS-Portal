import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const themes = [
    { id: 'light', name: 'Light', primary: '#3b82f6' },
    { id: 'dark', name: 'Dark', primary: '#60a5fa' },
    { id: 'blue', name: 'Blue', primary: '#3b82f6' },
    { id: 'green', name: 'Green', primary: '#22c55e' },
    { id: 'purple', name: 'Purple', primary: '#a855f7' }
  ];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};