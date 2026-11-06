import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton", className)} />;
}

export function CardSkeleton() {
  return (
    <div role="status" aria-label="Loading">
      <Skeleton className="aspect-[5/7] w-full rounded-xl" />
      <Skeleton className="mt-2.5 h-4 w-3/4" />
      <Skeleton className="mt-1.5 h-3 w-1/3" />
    </div>
  );
}

export function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
      {Array.from({ length: count }, (_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}

export function RowSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="w-[44%] shrink-0 sm:w-[28%] md:w-[22%] xl:w-[15.5%]"><CardSkeleton /></div>
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return <Skeleton className="h-[70vh] min-h-[460px] w-full rounded-none" />;
}