import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PublishForm } from "../../../components/publish-form";
import { authConfigured, isAuthenticated } from "../../../lib/auth";

export const metadata: Metadata = { title: "Publikace — Japonsko 2027", robots: { index: false, follow: false } };

export default async function AdminPage() {
  if (!authConfigured()) return <main className="admin-shell"><h1>Publikace není nakonfigurovaná</h1><p>Nastavte <code>ADMIN_PASSWORD</code> a alespoň 32 znaků dlouhý <code>ADMIN_SESSION_SECRET</code>.</p></main>;
  if (!(await isAuthenticated())) redirect("/admin/login");
  return (
    <main className="admin-shell">
      <div className="admin-heading"><div><p className="eyebrow">Japonsko 2027</p><h1>Publikace</h1></div><form action="/api/admin/logout" method="post"><button type="submit" className="button-secondary">Odhlásit</button></form></div>
      <p>Fotografie se nahraje přímo do Vercel Blob, potom se publikuje česká i anglická verze zápisku.</p>
      <PublishForm />
    </main>
  );
}
