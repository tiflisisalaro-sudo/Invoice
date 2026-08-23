import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ტიფლისი — ინვოისი",
  description: "რესტორანი ტიფლისი, ონლაინ ინვოისები",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
          </aside>
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
