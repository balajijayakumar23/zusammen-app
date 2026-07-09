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
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 flex items-center h-14 gap-6">
        <Link href="/dashboard" className="text-xl font-bold text-violet-700 shrink-0">
          Zusammen
        </Link>
        <div className="flex gap-1 flex-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                pathname === l.href || (l.href !== "/dashboard" && pathname.startsWith(l.href))
                  ? "bg-violet-100 text-violet-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          className="text-sm text-slate-500 hover:text-slate-700 transition"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
