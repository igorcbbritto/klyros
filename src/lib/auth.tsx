"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "agent";
  is_agent: boolean;
  company_id: string;
}

interface AuthContextType {
  user: DemoUser | null;
  isDemo: boolean;
  loginDemo: () => void;
  logout: () => void;
}

const DEMO_USER: DemoUser = {
  id: "1",
  name: "Admin Demo",
  email: "admin@empresa.com",
  role: "admin",
  is_agent: true,
  company_id: "1",
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isDemo: false,
  loginDemo: () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const demo = localStorage.getItem("helpdesk_demo");
    if (demo === "true") {
      setUser(DEMO_USER);
      setIsDemo(true);
    }
  }, []);

  const loginDemo = useCallback(() => {
    localStorage.setItem("helpdesk_demo", "true");
    setUser(DEMO_USER);
    setIsDemo(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("helpdesk_demo");
    setUser(null);
    setIsDemo(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isDemo, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}