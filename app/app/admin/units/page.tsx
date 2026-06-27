import { getUnits, getOwners, getCleaners } from "@/app/actions/units";
import { UnitsTable } from "./units-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Building2, CheckCircle2, Wrench, UserSquare2 } from "lucide-react";

export default async function UnitsPage() {
  const [units, owners, cleaners] = await Promise.all([
    getUnits(),
    getOwners(),
    getCleaners(),
  ]);

  const activeCount = units.filter((u) => u.status === "active").length;
  const maintenanceCount = units.filter(
    (u) => u.status === "maintenance"
  ).length;

  return (
    <div>
      <PageHeader
        title="الوحدات"
        description="إدارة الاستراحات والشاليهات، الملاك، والتسعير اليومي"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Building2} label="إجمالي الوحدات" value={units.length} />
        <StatCard
          icon={CheckCircle2}
          label="نشطة"
          value={activeCount}
          tone="emerald"
        />
        <StatCard
          icon={Wrench}
          label="تحت الصيانة"
          value={maintenanceCount}
          tone="amber"
        />
        <StatCard
          icon={UserSquare2}
          label="الملاك"
          value={owners.length}
          tone="gray"
        />
      </div>

      <UnitsTable units={units} owners={owners} cleaners={cleaners} />
    </div>
  );
}
