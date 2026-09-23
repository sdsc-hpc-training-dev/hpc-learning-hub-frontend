import type { Metadata } from "next";
import EventsView from "@/features/events/EventsView";
import { getEventsData } from "@/features/events/api";

export const metadata: Metadata = {
  title: "Events | HPC Learning Hub",
  description: "Upcoming SDSC events and recordings from past training sessions.",
};

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const data = await getEventsData();
  return <EventsView {...data} />;
}
