import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { AppState } from "react-native";
import {
  clearSession,
  getSavedSession,
  saveSession,
  touchSession,
  type User,
  verifyLogin,
} from "../database/db";

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The session is saved on the device, so closing and reopening the app keeps
// you signed in. You are logged out when you tap Log out, or after 7 days
// without opening the app.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getSavedSession());

  const login = (username: string, password: string): boolean => {
    const found = verifyLogin(username.trim(), password);
    if (found) {
      saveSession(found.id);
      setUser(found);
      return true;
    }
    return false;
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  // Keep the inactivity timer fresh, and sign out if the app has been left
  // idle (in the background) for longer than the allowed period.
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        if (getSavedSession() === null) setUser(null);
      } else {
        touchSession();
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
