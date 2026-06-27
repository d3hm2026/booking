import { requireRole } from "@/lib/require-role";
import { LogoutButton } from "@/components/logout-button";
import { AdminNav } from "../admin-nav";
import { getUnits, getOwners } from "@/app/actions/units";
import { UnitsTable } from "./units-table";

export default async function UnitsPage() {
  const session = await requireRole(["admin"]);
  const [units, owners] = await Promise.all([getUnits(), getOwners()]);

  return (
    <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">أهلاً، {session.fullName}</h1>
        <LogoutButton />
      </div>

      <AdminNav active="/admin/units" />

      <UnitsTable units={units} owners={owners} />
    </main>
  );
}
