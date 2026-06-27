import Link from "next/link";

const LINKS = [
  { href: "/admin", label: "التقويم" },
  { href: "/admin/units", label: "الوحدات" },
  { href: "/admin/users", label: "المستخدمين" },
  { href: "/admin/expenses", label: "المصروفات" },
  { href: "/admin/reports", label: "التقارير" },
];

export function AdminNav({ active }: { active: string }) {
  return (
    <nav className="flex gap-1 mb-5 border-b border-gray-200 text-sm">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`px-3 py-2 border-b-2 -mb-px ${
            active === link.href
              ? "border-gray-900 text-gray-900 font-medium"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
