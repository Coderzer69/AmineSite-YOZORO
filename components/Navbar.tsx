"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, User } from "lucide-react";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import { useAuthModal } from "./AuthModalProvider";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
  { href: "/schedule", label: "Schedule" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { openAuth } = useAuthModal();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenu(false), [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
        scrolled || menu
          ? "glass border-x-0 border-t-0"
          : "border-b border-transparent bg-gradient-to-b from-ink-950/80 to-transparent",
      )}
    >
      <div className="container-x flex h-16 items-center gap-4 lg:gap-8">
        <Logo />

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {links.map((l) => {
              const current = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                      current ? "bg-white/10 text-white" : "text-mist-300 hover:text-white",
                    )}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <SearchBar className="ml-auto hidden w-full max-w-sm md:block" />

        <button type="button" onClick={() => openAuth("login")} className="btn-accent ml-auto hidden md:ml-0 md:inline-flex">
          <User className="h-4 w-4" aria-hidden /> Sign in
        </button>

        <button
          type="button"
          className="ml-auto rounded-full p-2 text-mist-100 hover:bg-white/10 md:hidden"
          aria-label={menu ? "Close menu" : "Open menu"}
          aria-expanded={menu}
          aria-controls="mobile-menu"
          onClick={() => setMenu((m) => !m)}
        >
          {menu ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {menu && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden md:hidden"
          >
            <div className="container-x space-y-4 pb-5 pt-1">
              <SearchBar onNavigate={() => setMenu(false)} />
              <nav aria-label="Mobile">
                <ul className="grid gap-1">
                  {links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="block rounded-xl px-3 py-3 text-base font-medium hover:bg-white/10">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <button type="button" onClick={() => { setMenu(false); openAuth("login"); }} className="btn-accent w-full">
                Sign in
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}