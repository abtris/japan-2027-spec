import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { authConfigured, isAuthenticated } from "../../../../lib/auth";

export const metadata: Metadata = { title: "Přihlášení — Japonsko 2027", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (authConfigured() && await isAuthenticated()) redirect("/admin");
  const error = (await searchParams).error;
  return (
    <main className="admin-shell admin-login">
      <p className="eyebrow">Japonsko 2027</p><h1>Publikace</h1>
      {!authConfigured() && <p className="form-status form-status--error">Administrátorské proměnné prostředí nejsou nastavené.</p>}
      <form className="login-form" action="/api/admin/login" method="post">
        <label>Heslo<input name="password" type="password" required autoComplete="current-password" /></label>
        <button type="submit">Přihlásit</button>
      </form>
      {error && <p className="form-status form-status--error" role="alert">Nesprávné heslo.</p>}
    </main>
  );
}
