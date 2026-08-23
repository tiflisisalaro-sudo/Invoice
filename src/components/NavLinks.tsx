"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "მთავარი" },
  { href: "/invoices", label: "ინვოისები" },
  { href: "/invoices/new", label: "ახალი ინვოისი" },
  { href: "/customers", label: "მყიდველები" },
  { href: "/menu", label: "მენიუ" },
  { href: "/settings", label: "პარამეტრები" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/invoices/new") return pathname === "/invoices/new";
  if (href === "/invoices") {
    return (
      pathname === "/invoices" ||
      (pathname.startsWith("/invoices/") && pathname !== "/invoices/new")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="nav-links">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={isActive(pathname, item.href) ? "active" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
