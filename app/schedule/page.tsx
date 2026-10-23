import type { Metadata } from "next";
import ScheduleView from "@/components/ScheduleView";
import { getSchedule } from "@/lib/api";

export const metadata: Metadata = { title: "Schedule" };

export default async function SchedulePage() {
  const data = await getSchedule();
  return (
    <div className="container-x py-10">
      <h1 className="text-3xl font-extrabold md:text-4xl">Release schedule</h1>
      <p className="mb-8 mt-2 max-w-prose text-mist-300">
        New episodes of airing titles, by day. Times are sample data.
      </p>
      <ScheduleView data={data} />
    </div>
  );
}