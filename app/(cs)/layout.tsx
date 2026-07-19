import type { ReactNode } from "react";

export default function CzechLayout({ children }: { children: ReactNode }) {
  return <html lang="cs"><head><link rel="stylesheet" href="/assets/styles.css" /></head><body>{children}</body></html>;
}
