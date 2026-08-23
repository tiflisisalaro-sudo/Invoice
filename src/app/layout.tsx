import type { Metadata, Viewport } from "next";
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
            <NavLinks />
          </aside>
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
