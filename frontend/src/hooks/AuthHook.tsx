import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "../types";
import { authService } from "../services/auth.service";

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    let user = authService.isAuthenticated();
    if (user instanceof Promise) {
      user.then((u) => setUser(u || null));
    } else {
      setUser(user || null);
    }
  }, []);
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
