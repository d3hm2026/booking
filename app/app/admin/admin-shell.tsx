"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Building2,
  Users,
  Wallet,
  BarChart3,
  LogOut,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

const LINKS = [
  { href: "/admin", label: "التقويم", icon: Calendar },
  { href: "/admin/units", label: "الوحدات", icon: Building2 },
  { href: "/admin/users", label: "المستخدمين", icon: Users },
  { href: "/admin/expenses", label: "المصروفات", icon: Wallet },
  { href: "/admin/reports", label: "التقارير", icon: BarChart3 },
];

export function AdminShell({
  fullName,
  children,
}: {
  fullName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-60 shrink-0 border-l border-gray-200 bg-white flex flex-col">
        <div className="px-5 py-5 border-b border-gray-100 flex items-center gap-2.5">
          <div className="bg-indigo-600 text-white rounded-lg p-2 shrink-0">
            <Building2 className="size-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-gray-900 truncate">
              إدارة الشاليهات
            </h1>
            <p className="text-xs text-gray-400">لوحة الأدمن</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="size-[18px]" strokeWidth={2} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-800 truncate mb-2">
            {fullName}
          </p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              <LogOut className="size-4" />
              تسجيل الخروج
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <main className="p-6 max-w-7xl mx-auto w-full animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
