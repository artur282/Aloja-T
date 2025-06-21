import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from './constants';

// Crear el contexto del tema
const ThemeContext = createContext();

// Proveedor del tema
export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const [themePreference, setThemePreference] = useState('system'); // 'light', 'dark', 'system'

  // Cargar preferencia de tema al inicializar
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Actualizar tema cuando cambia la preferencia del sistema
  useEffect(() => {
    if (themePreference === 'system') {
      setIsDarkMode(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, themePreference]);

  const loadThemePreference = async () => {
    try {
      const savedPreference = await AsyncStorage.getItem('themePreference');
      if (savedPreference) {
        setThemePreference(savedPreference);
        if (savedPreference === 'light') {
          setIsDarkMode(false);
        } else if (savedPreference === 'dark') {
          setIsDarkMode(true);
        }
        // Si es 'system', se mantiene el valor actual basado en systemColorScheme
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const saveThemePreference = async (preference) => {
    try {
      await AsyncStorage.setItem('themePreference', preference);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const setTheme = (preference) => {
    setThemePreference(preference);
    saveThemePreference(preference);
    
    if (preference === 'light') {
      setIsDarkMode(false);
    } else if (preference === 'dark') {
      setIsDarkMode(true);
    } else if (preference === 'system') {
      setIsDarkMode(systemColorScheme === 'dark');
    }
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    const newPreference = newMode ? 'dark' : 'light';
    setThemePreference(newPreference);
    saveThemePreference(newPreference);
  };

  const currentTheme = THEME.getCurrentTheme(isDarkMode);

  const value = {
    isDarkMode,
    themePreference,
    currentTheme,
    theme: THEME,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook para usar el tema
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook para obtener colores específicos de componentes
export const useComponentColors = () => {
  const { theme } = useTheme();
  return theme.components;
};

// Hook para obtener colores de marca
export const useBrandColors = () => {
  const { theme } = useTheme();
  return theme.brand;
};

export default ThemeContext;
