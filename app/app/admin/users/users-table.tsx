"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Owner } from "@/lib/types";
import type { UserWithOwner } from "@/app/actions/users";
import { toggleUserActiveAction } from "@/app/actions/users";
import { UserDialog } from "./user-dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Phone, UserCircle2 } from "lucide-react";

const ROLE_CONFIG: Record<string, { label: string; tone: "indigo" | "green" | "amber" }> = {
  admin: { label: "أدمن", tone: "indigo" },
  owner: { label: "مالك", tone: "green" },
  cleaner: { label: "عامل تنظيف", tone: "amber" },
};

interface UsersTableProps {
  users: UserWithOwner[];
  owners: Owner[];
}

export function UsersTable({ users, owners }: UsersTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingUser, setEditingUser] = useState<UserWithOwner | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  function handleToggleActive(user: UserWithOwner) {
    startTransition(async () => {
      const result = await toggleUserActiveAction(user.id, !user.is_active);
      if (result.success) {
        toast.success(user.is_active ? "تم تعطيل الحساب" : "تم تفعيل الحساب");
        router.refresh();
      } else {
        toast.error(result.error ?? "حدث خطأ غير متوقع");
      }
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-800">قائمة المستخدمين</h2>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="size-4" />
          إضافة مستخدم
        </Button>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
            <tr>
              <th className="text-right px-4 py-3 font-medium">الاسم</th>
              <th className="text-right px-4 py-3 font-medium">الجوال</th>
              <th className="text-right px-4 py-3 font-medium">الدور</th>
              <th className="text-right px-4 py-3 font-medium">المالك المرتبط</th>
              <th className="text-right px-4 py-3 font-medium">الحالة</th>
              <th className="text-right px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => {
              const role = ROLE_CONFIG[user.role] ?? {
                label: user.role,
                tone: "gray" as const,
              };
              return (
                <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <UserCircle2 className="size-4 text-gray-400" />
                      {user.full_name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600" dir="ltr">
                    <span className="flex items-center gap-1 justify-end">
                      <Phone className="size-3.5 text-gray-400" />
                      {user.phone}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={role.tone}>{role.label}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {user.owner?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      disabled={isPending}
                      onClick={() => handleToggleActive(user)}
                      className="disabled:opacity-50"
                    >
                      <Badge tone={user.is_active ? "green" : "red"}>
                        {user.is_active ? "نشط" : "معطّل"}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        title="تعديل"
                      >
                        <Pencil className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="p-10 text-center text-gray-400 text-sm">
            لا يوجد مستخدمون مضافون بعد
          </div>
        )}
      </Card>

      {showAddDialog && (
        <UserDialog owners={owners} onClose={() => setShowAddDialog(false)} />
      )}

      {editingUser && (
        <UserDialog
          owners={owners}
          user={editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}
    </div>
  );
}
