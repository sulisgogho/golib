"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, signOut } = useAuth();

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-8 py-8 flex items-center justify-between">
        <span className="font-extrabold text-xl tracking-wider text-slate-900 dark:text-white uppercase">
          Go<span className="text-brand-500">Lib</span>
        </span>
      </div>

      {/* Menu */}
      <div className="px-6 flex-1 overflow-y-auto scrollbar-hide">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-4 px-2 tracking-widest">
          MENU
        </p>
        <nav className="space-y-1">
          <Link
            href="/"
            className={`flex items-center gap-4 px-2 py-3 font-medium transition-colors group ${
              pathname === "/"
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                pathname === "/"
                  ? "bg-[#FF6B4A] text-white shadow-md shadow-[#FF6B4A]/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              }`}
            >
              <i className="fa-solid fa-house text-sm"></i>
            </div>
            Discover
          </Link>
          <Link
            href="/library"
            className={`flex items-center gap-4 px-2 py-3 font-medium transition-colors group ${
              pathname === "/library"
                ? "text-slate-900 dark:text-white"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                pathname === "/library"
                  ? "bg-[#FF6B4A] text-white shadow-md shadow-[#FF6B4A]/30"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-brand-500"
              }`}
            >
              <i className="fa-solid fa-bookmark text-sm"></i>
            </div>
            My Library
          </Link>
        </nav>

        <div className="my-6 border-t border-slate-100 dark:border-slate-800"></div>

        {isAdmin && (
          <>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-4 px-2 tracking-widest">
              ADMIN
            </p>
            <nav className="space-y-1">
              <Link
                href="/admin"
                className={`flex items-center gap-4 px-2 py-3 font-medium transition-colors group ${
                  pathname === "/admin"
                    ? "text-slate-900 dark:text-white"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    pathname === "/admin"
                      ? "bg-[#FF6B4A] text-white shadow-md shadow-[#FF6B4A]/30"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-brand-500"
                  }`}
                >
                  <i className="fa-solid fa-file-circle-plus text-sm"></i>
                </div>
                Add Book
              </Link>
            </nav>
            <div className="my-6 border-t border-slate-100 dark:border-slate-800"></div>
          </>
        )}

        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-4 px-2 tracking-widest">
          ACCOUNT
        </p>
        <nav className="space-y-1">
          {user ? (
            <>
              <div className="flex items-center gap-3 px-2 py-3 mb-2">
                <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}`} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm" />
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-bold text-slate-800 dark:text-white truncate">{user.displayName}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</span>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-4 px-2 py-3 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 font-medium transition-colors"
              >
                <div className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500">
                  <i className="fa-solid fa-arrow-right-from-bracket text-sm"></i>
                </div>
                Log out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-4 px-2 py-3 text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-bold transition-colors"
            >
              <div className="w-8 h-8 flex items-center justify-center text-brand-500">
                <i className="fa-solid fa-arrow-right-to-bracket text-sm"></i>
              </div>
              Sign In
            </Link>
          )}
        </nav>
      </div>

      {/* Bottom Graphic */}
      <div className="mt-auto mb-8 flex flex-col items-center">
        <div className="w-20 h-20 bg-[#DFBBFA] dark:bg-[#7E57C2] rounded-3xl relative flex items-center justify-center overflow-hidden mb-3 shadow-sm">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M 0 50 Q 30 10 60 50 T 100 20"
              fill="none"
              stroke="#000"
              strokeWidth="2"
              className="opacity-50"
            />
            <path
              d="M 0 80 Q 40 40 80 90"
              fill="none"
              stroke="#000"
              strokeWidth="2"
              className="opacity-50"
            />
            <circle cx="35" cy="30" r="6" fill="#000" />
            <circle cx="70" cy="65" r="8" fill="#000" />
          </svg>
        </div>
        <span className="text-xs font-bold tracking-widest text-slate-500 dark:text-slate-400">
          BOOK LIBRARY
        </span>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar (Always visible on md and up) */}
      <aside className="hidden md:flex flex-shrink-0 flex-col w-64 h-full bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800">
        <SidebarContent />
      </aside>

      {/* Mobile Bottom Bar (Hidden on md and up) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-50 flex items-center justify-around px-2 pb-safe shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 ${
            pathname === "/" ? "text-[#FF6B4A]" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          } transition-colors`}
        >
          <i className="fa-solid fa-house text-lg"></i>
          <span className="text-[10px] font-medium">Discover</span>
        </Link>

        <Link
          href="/library"
          className={`flex flex-col items-center gap-1 ${
            pathname === "/library" ? "text-[#FF6B4A]" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          } transition-colors`}
        >
          <i className="fa-solid fa-bookmark text-lg"></i>
          <span className="text-[10px] font-medium">Library</span>
        </Link>
        {isAdmin && (
          <Link
            href="/admin"
            className={`flex flex-col items-center gap-1 ${
              pathname === "/admin" ? "text-[#FF6B4A]" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            } transition-colors`}
          >
            <i className="fa-solid fa-file-circle-plus text-lg"></i>
            <span className="text-[10px] font-medium">Add Book</span>
          </Link>
        )}
        {user ? (
          <button onClick={() => signOut()} className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors">
            <i className="fa-solid fa-arrow-right-from-bracket text-lg"></i>
            <span className="text-[10px] font-medium">Log out</span>
          </button>
        ) : (
          <Link href="/login" className="flex flex-col items-center gap-1 text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors">
            <i className="fa-solid fa-arrow-right-to-bracket text-lg"></i>
            <span className="text-[10px] font-medium">Sign In</span>
          </Link>
        )}
      </nav>
    </>
  );
}
