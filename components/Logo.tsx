import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" aria-label="Yozora home" className="group flex items-center gap-2 rounded-md">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true" className="transition-transform duration-500 ease-smooth group-hover:rotate-[-18deg]">
        <path d="M21 3a13 13 0 1 0 8 22A11 11 0 0 1 21 3Z" fill="#FF4D6D" />
        <circle cx="24" cy="9" r="1.6" fill="#FF8FA3" />
      </svg>
      <span className="font-display text-xl font-bold tracking-tight">
        Yozora
      </span>
    </Link>
  );
}