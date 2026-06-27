import { LogoBadge } from "@/components/logo";
import { LogoutButton } from "@/components/logout-button";

export function Topbar({
  title,
  fullName,
}: {
  title: string;
  fullName: string;
}) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <LogoBadge size="sm" />
          <div>
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            <p className="text-xs text-gray-400">{fullName}</p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </header>
  );
}
