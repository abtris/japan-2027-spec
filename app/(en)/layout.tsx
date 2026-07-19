import type { ReactNode } from "react";
import { Observability } from "../../components/observability";

export default function EnglishLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><head><link rel="stylesheet" href="/assets/styles.css" /></head><body>{children}<Observability /></body></html>;
}
