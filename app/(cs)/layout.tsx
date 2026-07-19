import type { ReactNode } from "react";
import { Observability } from "../../components/observability";

export default function CzechLayout({ children }: { children: ReactNode }) {
  return <html lang="cs"><head><link rel="stylesheet" href="/assets/styles.css" /></head><body>{children}<Observability /></body></html>;
}
