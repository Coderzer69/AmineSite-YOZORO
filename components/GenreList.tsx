import Link from "next/link";

export default function GenreList({ genres }: { genres: string[] }) {
  return (
    <section aria-labelledby="genres-h" className="rounded-2xl border border-white/10 bg-ink-900/70 p-5">
      <h2 id="genres-h" className="mb-4 text-lg font-bold">Genres</h2>
      <ul className="grid grid-cols-2 gap-2">
        {genres.map((g) => (
          <li key={g}>
            <Link
              href={`/browse?genre=${encodeURIComponent(g)}`}
              className="block truncate rounded-lg bg-white/5 px-3 py-2 text-sm text-mist-300 transition hover:bg-accent/15 hover:text-accent"
            >
              {g}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}