import { HomePage } from "../../../components/home-page";
import { getEntries } from "../../../lib/entries";
import { homeMetadata } from "../../../lib/site";

export const metadata = homeMetadata("en");
export const dynamic = "force-dynamic";

export default async function EnglishHome() {
  return <HomePage locale="en" entries={await getEntries()} />;
}
