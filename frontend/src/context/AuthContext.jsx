import React, { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../features/auth/services/authService";
import {
  authStorageKeys,
  clearStoredAuth,
  getStoredAuth,
  setStoredAuth,
  subscribeToAuthStorage,
} from "../features/auth/utils/authStorage";

const AuthContext = createContext(null);

function readLatestAuth(accessTokenFallback = null) {
  const storedAuth = getStoredAuth();
  return {
    accessToken: storedAuth.accessToken || accessTokenFallback || null,
    user: storedAuth.user || null,
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [accessToken, setAccessTokenState] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const syncState = (nextAuth) => {
    setUserState(nextAuth?.user || null);
    setAccessTokenState(nextAuth?.accessToken || null);
  };

  const persistAuth = (nextAuth) => {
    setStoredAuth({
      accessToken: nextAuth?.accessToken || null,
      user: nextAuth?.user || null,
    });
  };

  const clearAuth = () => {
    clearStoredAuth();
  };

  useEffect(() => {
    syncState(readLatestAuth());

    const unsubscribe = subscribeToAuthStorage((nextAuth) => {
      syncState(nextAuth);
    });

    const handleStorage = (event) => {
      if (Object.values(authStorageKeys).includes(event.key)) {
        syncState(readLatestAuth());
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      setIsInitializing(true);
      const storedAuth = readLatestAuth();

      try {
        if (storedAuth.accessToken) {
          const response = await authService.getMe();
          if (!isMounted) return;

          persistAuth({
            accessToken: readLatestAuth(storedAuth.accessToken).accessToken,
            user: response?.user || null,
          });
          return;
        }

        const refreshedAuth = await authService.refresh();
        if (!isMounted) return;

        persistAuth(refreshedAuth);
      } catch (error) {
        if (!isMounted) return;
        clearAuth();
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials) => {
    const authData = await authService.login(credentials);
    persistAuth(authData);
    return authData;
  };

  const loginWithGoogle = async (credential) => {
    const authData = await authService.loginWithGoogle(credential);
    if (!authData?.requiresOnboarding) {
      persistAuth(authData);
    }
    return authData;
  };

  const completeGoogleSignup = async (payload) => {
    const authData = await authService.completeGoogleSignup(payload);
    persistAuth(authData);
    return authData;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
    }
  };

  const logoutAll = async () => {
    try {
      await authService.logoutAll();
    } finally {
      clearAuth();
    }
  };

  const refreshAuth = async () => {
    const authData = await authService.refresh();
    persistAuth(authData);
    return authData;
  };

  const refreshCurrentUser = async () => {
    const response = await authService.getMe();
    const latestAuth = readLatestAuth(accessToken);
    persistAuth({
      accessToken: latestAuth.accessToken,
      user: response?.user || null,
    });
    return response?.user || null;
  };

  const updateUser = (nextUser) => {
    const latestAuth = readLatestAuth(accessToken);
    persistAuth({
      accessToken: latestAuth.accessToken,
      user: nextUser,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser: updateUser,
        accessToken,
        login,
        loginWithGoogle,
        completeGoogleSignup,
        logout,
        logoutAll,
        refreshAuth,
        refreshCurrentUser,
        changePassword: authService.changePassword,
        sendVerificationEmail: authService.sendVerification,
        resendVerificationEmail: authService.resendVerification,
        isAuthenticated: Boolean(user && accessToken),
        isInitializing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;
