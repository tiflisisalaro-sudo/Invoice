import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { logout } from "@/app/login-actions";
import { NavLinks } from "@/components/NavLinks";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ტიფლისი — ინვოისი",
  description: "რესტორანი ტიფლისი, ონლაინ ინვოისები",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "ტიფლისი",
    statusBarStyle: "black-translucent",
  },
  icons: { apple: "/tiflisi-logo.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d2c32",
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-pathname") || "";
  const isLogin = pathname === "/login" || pathname.startsWith("/login/");

  if (isLogin) {
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
            <NavLinks />
            <form action={logout} className="logout">
              <button type="submit" className="ghost">
                გასვლა
              </button>
            </form>
          </aside>
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
