import { getUsers } from "@/app/actions/users";
import { getOwners } from "@/app/actions/units";
import { UsersTable } from "./users-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Users as UsersIcon, ShieldCheck, Home, Sparkles } from "lucide-react";

export default async function UsersPage() {
  const [users, owners] = await Promise.all([getUsers(), getOwners()]);

  const adminCount = users.filter((u) => u.role === "admin").length;
  const ownerCount = users.filter((u) => u.role === "owner").length;
  const cleanerCount = users.filter((u) => u.role === "cleaner").length;

  return (
    <div>
      <PageHeader
        title="المستخدمين"
        description="إدارة حسابات الدخول: الأدمن، الملاك، وعمال التنظيف"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard icon={UsersIcon} label="إجمالي الحسابات" value={users.length} />
        <StatCard icon={ShieldCheck} label="أدمن" value={adminCount} tone="indigo" />
        <StatCard icon={Home} label="ملاك" value={ownerCount} tone="emerald" />
        <StatCard icon={Sparkles} label="عمال تنظيف" value={cleanerCount} tone="amber" />
      </div>

      <UsersTable users={users} owners={owners} />
    </div>
  );
}
