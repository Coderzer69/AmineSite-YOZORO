"use client";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { useAuthModal } from "./AuthModalProvider";
import { cn } from "@/lib/utils";

export default function AuthModal() {
  const { open, mode, setMode, close } = useAuthModal();
  const reduce = useReducedMotion();
  const uid = useId();
  const dialog = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  useEffect(() => { setErrors({}); setDone(false); }, [mode, open]);

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => dialog.current?.querySelector<HTMLElement>("input")?.focus(), 60);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return close();
      if (e.key !== "Tab" || !dialog.current) return;
      const f = dialog.current.querySelectorAll<HTMLElement>("button, input, [href]");
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lastFocus.current?.focus();
    };
  }, [open, close]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const next: Record<string, string> = {};
    if (mode === "register" && String(d.get("username") ?? "").trim().length < 3) next.username = "Use at least 3 characters.";
    if (!/^\S+@\S+\.\S+$/.test(String(d.get("email") ?? ""))) next.email = "Enter a valid email address.";
    if (String(d.get("password") ?? "").length < 8) next.password = "Use at least 8 characters.";
    setErrors(next);
    if (Object.keys(next).length === 0) setDone(true); // mock: no backend
  };

  const field = (name: string, label: string, type = "text", autoComplete?: string) => (
    <div>
      <label htmlFor={`${uid}-${name}`} className="mb-1.5 block text-sm font-medium">{label}</label>
      <input
        id={`${uid}-${name}`} name={name} type={type} autoComplete={autoComplete}
        aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${uid}-${name}-err` : undefined}
        className={cn(
          "h-11 w-full rounded-xl border bg-white/5 px-3.5 text-sm placeholder:text-mist-500",
          errors[name] ? "border-red-400" : "border-white/10 focus:border-accent/60",
        )}
      />
      {errors[name] && <p id={`${uid}-${name}-err`} className="mt-1 text-xs text-red-300">{errors[name]}</p>}
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] grid place-items-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} aria-hidden />
          <motion.div
            ref={dialog} role="dialog" aria-modal="true" aria-labelledby={`${uid}-title`}
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass relative w-full max-w-md rounded-3xl p-6 shadow-lift sm:p-8"
          >
            <button type="button" onClick={close} aria-label="Close" className="absolute right-4 top-4 rounded-full p-2 text-mist-300 hover:bg-white/10 hover:text-white">
              <X className="h-5 w-5" />
            </button>

            {done ? (
              <div className="py-6 text-center" role="status">
                <CheckCircle2 className="mx-auto h-12 w-12 text-accent" aria-hidden />
                <h2 id={`${uid}-title`} className="mt-4 text-2xl font-bold">
                  {mode === "login" ? "Signed in" : "Account created"}
                </h2>
                <p className="mt-2 text-sm text-mist-300">This is a demo, so nothing was sent to a server.</p>
                <button type="button" onClick={close} className="btn-accent mt-6">Continue</button>
              </div>
            ) : (
              <>
                <h2 id={`${uid}-title`} className="text-2xl font-bold">
                  {mode === "login" ? "Welcome back" : "Create your account"}
                </h2>
                <div role="tablist" aria-label="Sign in or register" className="mt-5 grid grid-cols-2 rounded-full bg-white/5 p-1">
                  {(["login", "register"] as const).map((m) => (
                    <button
                      key={m} role="tab" type="button" aria-selected={mode === m}
                      onClick={() => setMode(m)}
                      className={cn("rounded-full py-2 text-sm font-semibold transition", mode === m ? "bg-accent" : "text-mist-300 hover:text-white")}
                    >
                      {m === "login" ? "Sign in" : "Register"}
                    </button>
                  ))}
                </div>

                <form onSubmit={onSubmit} noValidate className="mt-5 space-y-4">
                  {mode === "register" && field("username", "Username", "text", "username")}
                  {field("email", "Email", "email", "email")}
                  {field("password", "Password", "password", mode === "login" ? "current-password" : "new-password")}
                  <button type="submit" className="btn-accent w-full">
                    {mode === "login" ? "Sign in" : "Create account"}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}