import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, AuthTokens } from '@/src/types';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'CLEAR_USER' }
  | { type: 'UPDATE_TOKENS'; payload: AuthTokens };

const initialState: AuthState = {
  user: null,
  tokens: null,
  isLoading: true,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isLoading: false,
      };
    
    case 'CLEAR_USER':
      return {
        ...state,
        user: null,
        tokens: null,
        isLoading: false,
      };
    
    case 'UPDATE_TOKENS':
      return {
        ...state,
        tokens: action.payload,
      };
    
    default:
      return state;
  }
};

interface AuthContextType extends AuthState {
  setUser: (user: User, tokens: AuthTokens) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  updateTokens: (tokens: AuthTokens) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 앱 시작 시 저장된 사용자 정보 복원 (추후 AsyncStorage 연결)
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        // TODO: AsyncStorage에서 사용자 정보 복원
        // const storedUser = await AsyncStorage.getItem('wallet-slot-user');
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        console.error('Failed to load stored auth:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadStoredAuth();
  }, []);

  const setUser = async (user: User, tokens: AuthTokens) => {
    try {
      // TODO: AsyncStorage에 사용자 정보 저장
      // await AsyncStorage.setItem('wallet-slot-user', JSON.stringify(user));
      dispatch({ type: 'SET_USER', payload: { user, tokens } });
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  const clearUser = async () => {
    try {
      // TODO: AsyncStorage에서 사용자 정보 삭제
      // await AsyncStorage.removeItem('wallet-slot-user');
      dispatch({ type: 'CLEAR_USER' });
    } catch (error) {
      console.error('Failed to clear user:', error);
    }
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const updateTokens = (tokens: AuthTokens) => {
    dispatch({ type: 'UPDATE_TOKENS', payload: tokens });
  };

  const value: AuthContextType = {
    ...state,
    setUser,
    clearUser,
    setLoading,
    updateTokens,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuthStore = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthStore must be used within an AuthProvider');
  }
  return context;
};
