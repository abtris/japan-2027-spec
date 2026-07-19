import type { ReactNode } from "react";

export default function EnglishLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><head><link rel="stylesheet" href="/assets/styles.css" /></head><body>{children}</body></html>;
}
