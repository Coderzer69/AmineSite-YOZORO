import Link from "next/link";
import Logo from "./Logo";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-ink-900/60">
      <div className="container-x py-10">
        <nav aria-label="Browse titles by letter" className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-mist-300">Browse titles by letter</h2>
          <ul className="flex flex-wrap gap-1.5">
            {letters.map((l) => (
              <li key={l}>
                <Link
                  href={`/browse?q=${l}`}
                  className="grid h-8 w-8 place-items-center rounded-md bg-white/5 text-xs font-semibold transition hover:bg-accent hover:text-white"
                >
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex flex-col gap-6 border-t border-white/10 pt-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md space-y-3">
            <Logo />
            <p className="text-sm text-mist-500">
              Yozora is an interface demo. It hosts no video, and every title, poster and
              synopsis here is fictional sample data.
            </p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm text-mist-300">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/browse" className="hover:text-white">Browse</Link>
            <Link href="/schedule" className="hover:text-white">Schedule</Link>
            <Link href="/browse?status=Airing" className="hover:text-white">Airing now</Link>
          </nav>
        </div>
        <p className="mt-8 text-xs text-mist-500">© {new Date().getFullYear()} Yozora demo</p>
      </div>
    </footer>
  );
}