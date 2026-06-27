import { requireRole } from "@/lib/require-role";
import { getCleaningTasksForCleaner } from "@/app/actions/cleaning";
import { Topbar } from "@/components/ui/topbar";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { CleaningTasksList } from "./cleaning-tasks-list";
import { Sparkles } from "lucide-react";

export default async function CleanerPage() {
  const session = await requireRole(["cleaner"]);
  const tasks = await getCleaningTasksForCleaner();

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar title="مهام التنظيف" fullName={session.fullName} />

      <main className="max-w-2xl mx-auto p-4 sm:p-6">
        <PageHeader
          title="المهام المعلّقة"
          description="ارفع صورة بعد تنظيف الوحدة لإغلاق المهمة"
        />

        <div className="mb-6">
          <StatCard
            icon={Sparkles}
            label="مهام بانتظار التنظيف"
            value={tasks.length}
            tone="amber"
          />
        </div>

        <CleaningTasksList tasks={tasks} />
      </main>
    </div>
  );
}
