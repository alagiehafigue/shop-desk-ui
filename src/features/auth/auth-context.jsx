import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { fetchCurrentUser, logoutRequest } from "./auth-api";
import {
  clearAuthStorage,
  getStoredAccessToken,
  getStoredUser,
  setStoredAccessToken,
  setStoredUser,
} from "../../lib/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => getStoredAccessToken());
  const [user, setUser] = useState(() => getStoredUser());
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(getStoredAccessToken()));

  useEffect(() => {
    let isMounted = true;

    async function bootstrapAuth() {
      if (!accessToken) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const nextUser = await fetchCurrentUser();

        if (!isMounted) {
          return;
        }

        setUser(nextUser);
        setStoredUser(nextUser);
      } catch {
        if (isMounted) {
          clearAuthStorage();
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    }

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [accessToken]);

  const value = useMemo(
    () => ({
      accessToken,
      user,
      isAuthenticated: Boolean(accessToken && user),
      isBootstrapping,
      signIn: ({ accessToken: nextToken, user: nextUser }) => {
        setAccessToken(nextToken);
        setUser(nextUser);
        setStoredAccessToken(nextToken);
        setStoredUser(nextUser);
      },
      signOut: async () => {
        try {
          await logoutRequest();
        } catch {
          // Logout should still clear local auth state even if the request fails.
        } finally {
          clearAuthStorage();
          setAccessToken(null);
          setUser(null);
        }
      },
    }),
    [accessToken, isBootstrapping, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
