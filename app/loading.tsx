import { GridSkeleton, HeroSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <div className="-mt-16"><HeroSkeleton /></div>
      <div className="container-x mt-12"><GridSkeleton count={10} /></div>
    </>
  );
}