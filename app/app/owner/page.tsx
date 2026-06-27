import { requireRole } from "@/lib/require-role";
import { LogoutButton } from "@/components/logout-button";

export default async function OwnerPage() {
  const session = await requireRole(["owner"]);

  return (
    <main className="flex-1 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">
          أهلاً، {session.fullName}
        </h1>
        <LogoutButton />
      </div>
      <p className="text-gray-500">
        لوحة المالك — قيد الإعداد (عرض الوحدات والحجوزات الخاصة بك قريباً)
      </p>
    </main>
  );
}
