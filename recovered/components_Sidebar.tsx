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
  { href: "/",        icon: "fa-solid fa-house",    label: "Discover"   },
  { href: "/library", icon: "fa-solid fa-book",     label: "My Library" },
  { href: "/bookmarks", icon: "fa-regular fa-bookmark", label: "Bookmarks" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, isAdmin, signOut } = useAuth();

  const isActive = (href: string) => pathname === href;

  return (