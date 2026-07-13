"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/friends", label: "Friends" },
  { href: "/settings", label: "Group" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-black sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 flex items-center h-14 gap-6">
        <Link href="/dashboard" className="text-xl font-bold text-black shrink-0">
          Zusammen
        </Link>
        <div className="flex gap-1 flex-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                pathname === l.href || (l.href !== "/dashboard" && pathname.startsWith(l.href))
                  ? "bg-black text-white"
                  : "text-black hover:bg-gray-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          className="text-sm text-black hover:underline transition"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
