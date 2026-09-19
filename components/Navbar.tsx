"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Leadership", href: "/leadership" },
  { name: "Council", href: "/council" },
  { name: "Cafeteria", href: "/cafeteria" },
  { name: "Calendar", href: "/calendar" },
  { name: "Activities", href: "/activities" },
  { name: "Study Material", href: "/study-material" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">

        {/* Brand */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3"
        >
          <img
            src="/vidyagyan-logo.png"
            alt="VidyaGyan"
            className="h-10 w-auto object-contain"
          />

          <div className="hidden border-l border-slate-200 pl-3 sm:block">
            <p className="text-sm font-bold leading-tight text-slate-900">
              VidyaGyan
            </p>

            <p className="text-[11px] font-medium leading-tight text-slate-500">
              Council Portal
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="ml-auto flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.name}
              </Link>
            );
          })}

          {/* Authentication */}
          <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-3">

            {/* Sign In */}
            <Link
              href="/#signin"
              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-200"
            >
              Sign In
            </Link>

            {/* Dashboard */}
            <Link
              href="/dashboard"
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                pathname.startsWith("/dashboard")
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              Dashboard
            </Link>

          </div>
        </nav>
      </div>
    </header>
  );
}
