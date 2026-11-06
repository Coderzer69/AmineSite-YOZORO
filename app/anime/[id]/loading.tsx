import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton className="-mt-16 h-[44vh] min-h-[320px] w-full rounded-none" />
      <div className="container-x -mt-40 grid gap-8 md:grid-cols-[240px_1fr]">
        <Skeleton className="mx-auto aspect-[5/7] w-48 md:w-full" />
        <div className="space-y-4 pt-24">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-24 w-full max-w-prose" />
        </div>
      </div>
    </div>
  );
}