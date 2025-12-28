"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { User } from "@/lib/auth";
import { api } from "@/lib/apiClient";
import {
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  setUserData,
  getUserData,
  removeUserData,
} from "@/lib/cookies";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_AUTH"; payload: { user: User; token: string } }
  | { type: "CLEAR_AUTH" }
  | { type: "SET_INITIALIZED"; payload: boolean };

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_AUTH":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isInitialized: true,
      };
    case "CLEAR_AUTH":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
      };
    case "SET_INITIALIZED":
      return { ...state, isInitialized: action.payload };
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Auto-initialize authentication on mount
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        const token = getAuthToken();
        const userData = getUserData();

        if (!token || !userData) {
          dispatch({ type: "SET_LOADING", payload: false });
          dispatch({ type: "SET_INITIALIZED", payload: true });
          return;
        }

        // Validate token by calling /auth/me
        const response = await api.auth.getMe();
        const user = response.data.user;

        dispatch({
          type: "SET_AUTH",
          payload: { user, token },
        });
        dispatch({ type: "SET_LOADING", payload: false });
        dispatch({ type: "SET_INITIALIZED", payload: true });
      } catch {
        // Token is invalid, clear it
        removeAuthToken();
        removeUserData();
        dispatch({ type: "CLEAR_AUTH" });
        dispatch({ type: "SET_LOADING", payload: false });
        dispatch({ type: "SET_INITIALIZED", payload: true });
      }
    };

    initializeAuth();
  }, []); // Empty dependency array - runs only once on mount

  const setAuth = useCallback((user: User, token: string) => {
    setAuthToken(token);
    setUserData(user);
    dispatch({ type: "SET_AUTH", payload: { user, token } });
  }, []);

  const clearAuth = useCallback(() => {
    removeAuthToken();
    removeUserData();
    dispatch({ type: "CLEAR_AUTH" });
  }, []);

  const logout = useCallback(() => {
    removeAuthToken();
    removeUserData();
    dispatch({ type: "CLEAR_AUTH" });
  }, []);

  const value: AuthContextType = {
    ...state,
    setAuth,
    clearAuth,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
