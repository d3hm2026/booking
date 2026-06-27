"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { inputClass, Field } from "@/components/ui/field";
import { Building2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await loginAction(formData);
      if (result.success && result.redirectTo) {
        router.push(result.redirectTo);
      } else {
        setError(result.error ?? "حدث خطأ غير متوقع");
      }
    });
  }

  return (
    <main className="flex-1 flex items-center justify-center p-6 bg-gradient-to-b from-indigo-50 via-white to-white">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="flex justify-center mb-5">
          <div className="bg-indigo-600 text-white rounded-2xl p-3.5 shadow-lg shadow-indigo-200">
            <Building2 className="size-7" />
          </div>
        </div>

        <h1 className="text-xl font-bold text-center text-gray-900 mb-1">
          نظام إدارة الاستراحات والشاليهات
        </h1>
        <p className="text-sm text-gray-500 text-center mb-7">
          سجّل الدخول برقم الجوال والرمز السري
        </p>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="رقم الجوال">
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                required
                autoFocus
                placeholder="05xxxxxxxx"
                className={inputClass}
                dir="ltr"
              />
            </Field>

            <Field label="الرمز السري">
              <input
                id="code"
                name="code"
                type="password"
                inputMode="numeric"
                required
                placeholder="••••"
                className={inputClass}
                dir="ltr"
              />
            </Field>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 text-center">
                {error}
              </p>
            )}

            <Button type="submit" loading={isPending} className="w-full">
              {isPending ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
