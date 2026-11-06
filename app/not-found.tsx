import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="font-display text-7xl font-extrabold text-accent">404</p>
        <h1 className="mt-4 text-2xl font-bold">We couldn&apos;t find that page</h1>
        <p className="mt-2 text-mist-300">The title or episode may have moved. Try browsing instead.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="btn-accent">Go home</Link>
          <Link href="/browse" className="btn-ghost">Browse anime</Link>
        </div>
      </div>
    </div>
  );
}