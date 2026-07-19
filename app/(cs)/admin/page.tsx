import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PublishForm } from "../../../components/publish-form";
import { authConfigured, isAuthenticated } from "../../../lib/auth";
import { getStoredEntries } from "../../../lib/entries";

export const metadata: Metadata = { title: "Publikace — Japonsko 2027", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const authenticated = await isAuthenticated();
  if (!authConfigured()) return <main className="admin-shell"><h1>Publikace není nakonfigurovaná</h1><p>Nastavte <code>ADMIN_PASSWORD</code> a alespoň 32 znaků dlouhý <code>ADMIN_SESSION_SECRET</code>.</p></main>;
  if (!authenticated) redirect("/admin/login");
  const entries = await getStoredEntries();
  return (
    <main className="admin-shell">
      <div className="admin-heading"><div><p className="eyebrow">Japonsko 2027</p><h1>Publikace</h1></div><form action="/api/admin/logout" method="post"><button type="submit" className="button-secondary">Odhlásit</button></form></div>
      <p>Fotografie se před nahráním zmenší na webovou velikost. EXIF se uloží bez GPS údajů.</p>
      <PublishForm entries={entries} />
    </main>
  );
}
