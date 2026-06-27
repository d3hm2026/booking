import Link from "next/link";

const LINKS = [
  { href: "/owner", label: "نظرة عامة" },
  { href: "/owner/finance", label: "التقارير المالية" },
];

export function OwnerNav({ active }: { active: string }) {
  return (
    <nav className="flex gap-1 mb-5 border-b border-gray-200 text-sm">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`px-3 py-2 border-b-2 -mb-px ${
            active === link.href
              ? "border-indigo-600 text-indigo-700 font-medium"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
