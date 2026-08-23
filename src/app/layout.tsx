import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { logout } from "@/app/login-actions";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ტიფლისი — ინვოისი",
  description: "რესტორანი ტიფლისი, ონლაინ ინვოისები",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const path = (await headers()).get("x-pathname") || "";
  if (path.startsWith("/login")) {
    return (
      <html lang="ka">
        <body>{children}</body>
      </html>
    );
  }

  return (
    <html lang="ka">
      <body>
        <div className="shell">
          <aside className="nav">
            <div className="brand">
              <img src="/tiflisi-logo.png" alt="ტიფლისი" />
              <span>ინვოისები</span>
            </div>
            <Link href="/">მთავარი</Link>
            <Link href="/invoices">ინვოისები</Link>
            <Link href="/invoices/new">ახალი ინვოისი</Link>
            <Link href="/customers">მყიდველები</Link>
            <Link href="/menu">მენიუ</Link>
            <Link href="/settings">პარამეტრები</Link>
            <form action={logout} className="logout">
              <button type="submit" className="ghost">გასვლა</button>
            </form>
          </aside>
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
