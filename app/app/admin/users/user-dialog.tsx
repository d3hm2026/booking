"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Owner, UserRole } from "@/lib/types";
import type { UserWithOwner } from "@/app/actions/users";
import { createUserAction, updateUserAction } from "@/app/actions/users";
import { Dialog } from "@/components/ui/dialog";
import { Field, inputClass } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

interface UserDialogProps {
  owners: Owner[];
  user?: UserWithOwner;
  onClose: () => void;
}

export function UserDialog({ owners, user, onClose }: UserDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState<UserRole>(user?.role ?? "owner");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = user
        ? await updateUserAction(user.id, formData)
        : await createUserAction(formData);
      if (result.success) {
        toast.success(user ? "تم تعديل المستخدم" : "تم إضافة المستخدم");
        router.refresh();
        onClose();
      } else {
        toast.error(result.error ?? "حدث خطأ غير متوقع");
      }
    });
  }

  return (
    <Dialog title={user ? "تعديل مستخدم" : "إضافة مستخدم جديد"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="الاسم الكامل">
          <input
            name="full_name"
            type="text"
            required
            defaultValue={user?.full_name}
            className={inputClass}
          />
        </Field>

        <Field label="رقم الجوال">
          <input
            name="phone"
            type="tel"
            dir="ltr"
            inputMode="numeric"
            required
            defaultValue={user?.phone}
            className={inputClass}
          />
        </Field>

        <Field label="الدور">
          <select
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className={inputClass}
          >
            <option value="admin">أدمن</option>
            <option value="owner">مالك</option>
            <option value="cleaner">عامل تنظيف</option>
          </select>
        </Field>

        {role === "owner" && (
          <Field label="المالك المرتبط">
            <select
              name="owner_id"
              required
              defaultValue={user?.owner_id ?? ""}
              className={inputClass}
            >
              <option value="">اختر المالك</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field label="الرمز السري" hint="رمز ثابت يحدده الأدمن (وليس OTP)">
          <input
            name="password_code"
            type="text"
            dir="ltr"
            required
            defaultValue={user?.password_code}
            className={inputClass}
          />
        </Field>

        <div className="flex gap-2 pt-1">
          <Button type="submit" loading={isPending} className="flex-1">
            {isPending ? "جارٍ الحفظ..." : "حفظ"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
