"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-gray-800 border-b border-amber-500 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-amber-400">WARGame</h1>
        
        <div className="flex gap-6">
          <Link
            href="/"
            className={`px-4 py-2 rounded font-semibold transition ${
              isActive("/")
                ? "bg-amber-500 text-gray-900"
                : "text-white hover:bg-gray-700"
            }`}
          >
            เลือกตัวละคร
          </Link>
          <Link
            href="/teams"
            className={`px-4 py-2 rounded font-semibold transition ${
              isActive("/teams")
                ? "bg-amber-500 text-gray-900"
                : "text-white hover:bg-gray-700"
            }`}
          >
            เล่น
          </Link>
        </div>
      </div>
    </nav>
  );
}
