"use client";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type Mode = "login" | "register";
interface Ctx {
  open: boolean;
  mode: Mode;
  setMode: (m: Mode) => void;
  openAuth: (m?: Mode) => void;
  close: () => void;
}
const AuthCtx = createContext<Ctx | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const openAuth = useCallback((m: Mode = "login") => { setMode(m); setOpen(true); }, []);
  const close = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ open, mode, setMode, openAuth, close }), [open, mode, openAuth, close]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuthModal() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuthModal must be used inside AuthModalProvider");
  return ctx;
}