"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  href: string;
  icon: string;
  label: string;
}

const mainNav: NavItem[] = [
  { href: "/", icon: "fa-solid fa-house", label: "Discover" },
  { href: "/library", icon: "fa-solid fa-book", label: "My Library" },
  { href: "/bookmarks", icon: "fa-regular fa-bookmark", label: "Bookmarks" },
  { href: "/requests", icon: "fa-solid fa-envelope-open-text", label: "Request Book" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, signOut } = useAuth();

  const isActive = (href: string) => pathname === href;
  const isWhiteBg = pathname === "/library" || pathname === "/bookmarks" || pathname === "/requests";

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className={`hidden lg:flex flex-col items-center w-[80px] h-full shrink-0 ${isWhiteBg ? 'bg-[#FDFBF7]' : 'bg-[#F1EEE3]'} dark:bg-surface-950 border-r-2 border-[#d4cfc8] dark:border-surface-800 z-20 py-4 xl:py-8`}>
        {/* Logo */}
        <Link href="/" className="mb-6 xl:mb-12 text-surface-900 dark:text-white hover:text-brand-500 transition-colors">
          <i className="fa-solid fa-feather-pointed text-2xl"></i>
        </Link>

        {/* Main nav */}
        <nav className="flex-1 flex flex-col items-center justify-center gap-4 xl:gap-6 w-full">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex items-center justify-center w-10 h-10 rounded-full text-lg transition-all duration-300 ${isActive(item.href)
                  ? "bg-brand-500 text-white shadow-md shadow-brand-500/30"
                  : "text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-300 dark:hover:bg-surface-800"
                }`}
            >
              <i className={item.icon}></i>
            </Link>
          ))}

          {isAdmin && (
            <Link
              href="/admin"
              title="Admin"
              className={`flex items-center justify-center w-10 h-10 rounded-full text-lg transition-all duration-300 ${isActive("/admin")
                  ? "bg-brand-500 text-white shadow-md shadow-brand-500/30"
                  : "text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-300 dark:hover:bg-surface-800"
                }`}
            >
              <i className="fa-solid fa-gear"></i>
            </Link>
          )}
        </nav>

        {/* User block / Bottom */}
        <div className="mt-auto flex flex-col gap-4 items-center w-full">
          {user ? (
            <button
              onClick={() => signOut()}
              title="Log out"
              className="flex items-center justify-center w-10 h-10 rounded-full text-surface-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
          ) : (
            <Link
              href="/login"
              title="Sign In"
              className="flex items-center justify-center w-10 h-10 rounded-full text-surface-500 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
            >
              <i className="fa-solid fa-arrow-right-to-bracket"></i>
            </Link>
          )}
        </div>
      </aside>

      {/* ── Mobile Bottom Bar (Floating Pill) ── */}
      <nav className="lg:hidden fixed bottom-6 left-4 right-4 z-50 flex items-center justify-around px-4 py-3 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border border-surface-200 dark:border-surface-700 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] rounded-full">
        {mainNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 w-14 h-12 rounded-xl transition-all duration-150 ${isActive(item.href)
                ? "text-brand-500 font-medium"
                : "text-surface-500 hover:text-surface-900 dark:hover:text-white"
              }`}
          >
            <i className={`${item.icon} text-lg ${isActive(item.href) ? 'bg-brand-100 dark:bg-brand-500/20 px-4 py-1 rounded-full' : ''}`}></i>
          </Link>
        ))}

        {isAdmin && (
          <Link
            href="/admin"
            className={`flex flex-col items-center justify-center gap-1 w-14 h-12 rounded-xl transition-all duration-150 ${isActive("/admin")
                ? "text-brand-500 font-medium"
                : "text-surface-500 hover:text-surface-900 dark:hover:text-white"
              }`}
          >
            <i className={`fa-solid fa-gear text-lg ${isActive("/admin") ? 'bg-brand-100 dark:bg-brand-500/20 px-4 py-1 rounded-full' : ''}`}></i>
          </Link>
        )}
      </nav>
    </>
  );
}
