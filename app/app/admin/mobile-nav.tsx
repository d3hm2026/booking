"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Building2,
  Users,
  Wallet,
  BarChart3,
  MoreHorizontal,
  LogOut,
  X,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { LogoBadge } from "@/components/logo";

const MAIN_LINKS = [
  { href: "/admin", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/admin/calendar", label: "التقويم", icon: Calendar },
  { href: "/admin/bookings", label: "الحجوزات", icon: ClipboardList },
  { href: "/admin/units", label: "الوحدات", icon: Building2 },
];

const MORE_LINKS = [
  { href: "/admin/users", label: "المستخدمين", icon: Users },
  { href: "/admin/expenses", label: "المصروفات", icon: Wallet },
  { href: "/admin/reports", label: "التقارير", icon: BarChart3 },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function MobileNav({ fullName }: { fullName: string }) {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const moreActive = MORE_LINKS.some((l) => isActive(pathname, l.href));

  return (
    <>
      <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <LogoBadge size="sm" />
          <span className="text-sm font-bold text-gray-900">إدارة الشاليهات</span>
        </div>
        <span className="text-xs text-gray-400 truncate max-w-[110px]">{fullName}</span>
      </header>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 flex items-stretch pb-[env(safe-area-inset-bottom)]">
        {MAIN_LINKS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium ${
                active ? "text-indigo-600" : "text-gray-500"
              }`}
            >
              <Icon className="size-5" strokeWidth={2} />
              {label}
            </Link>
          );
        })}
        <button
          onClick={() => setShowMore(true)}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium ${
            moreActive ? "text-indigo-600" : "text-gray-500"
          }`}
        >
          <MoreHorizontal className="size-5" strokeWidth={2} />
          المزيد
        </button>
      </nav>

      {showMore && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40 flex items-end animate-overlay"
          onClick={() => setShowMore(false)}
        >
          <div
            className="bg-white w-full rounded-t-2xl p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] animate-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">المزيد</h3>
              <button
                onClick={() => setShowMore(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="إغلاق"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="space-y-1">
              {MORE_LINKS.map(({ href, label, icon: Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setShowMore(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${
                      active
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="size-5" />
                    {label}
                  </Link>
                );
              })}
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="size-5" />
                  تسجيل الخروج
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
