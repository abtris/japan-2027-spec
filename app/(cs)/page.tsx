import { HomePage } from "../../components/home-page";
import { getEntries } from "../../lib/entries";
import { homeMetadata } from "../../lib/site";

export const metadata = homeMetadata("cs");
export const dynamic = "force-dynamic";

export default async function CzechHome() {
  return <HomePage locale="cs" entries={await getEntries()} />;
}
