import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface AppState {
  theme: 'light' | 'dark' | 'system';
  language: 'ko' | 'en';
  biometricEnabled: boolean;
  notificationEnabled: boolean;
  soundEnabled: boolean;
}

type AppAction =
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'SET_LANGUAGE'; payload: 'ko' | 'en' }
  | { type: 'TOGGLE_BIOMETRIC' }
  | { type: 'TOGGLE_NOTIFICATION' }
  | { type: 'TOGGLE_SOUND' };

const initialState: AppState = {
  theme: 'system',
  language: 'ko',
  biometricEnabled: true,
  notificationEnabled: true,
  soundEnabled: true,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    
    case 'TOGGLE_BIOMETRIC':
      return { ...state, biometricEnabled: !state.biometricEnabled };
    
    case 'TOGGLE_NOTIFICATION':
      return { ...state, notificationEnabled: !state.notificationEnabled };
    
    case 'TOGGLE_SOUND':
      return { ...state, soundEnabled: !state.soundEnabled };
    
    default:
      return state;
  }
};

interface AppContextType extends AppState {
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: 'ko' | 'en') => void;
  toggleBiometric: () => void;
  toggleNotification: () => void;
  toggleSound: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const setLanguage = (language: 'ko' | 'en') => {
    dispatch({ type: 'SET_LANGUAGE', payload: language });
  };

  const toggleBiometric = () => {
    dispatch({ type: 'TOGGLE_BIOMETRIC' });
  };

  const toggleNotification = () => {
    dispatch({ type: 'TOGGLE_NOTIFICATION' });
  };

  const toggleSound = () => {
    dispatch({ type: 'TOGGLE_SOUND' });
  };

  const value: AppContextType = {
    ...state,
    setTheme,
    setLanguage,
    toggleBiometric,
    toggleNotification,
    toggleSound,
  };

  return React.createElement(AppContext.Provider, { value }, children);
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};
