import StartHereView from "@/features/start-here/StartHereView";
import { getStartHereData } from "@/features/start-here/api";

export default async function Home() {
  const data = await getStartHereData();
  return <StartHereView data={data} />;
}
