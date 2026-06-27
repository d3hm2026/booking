"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/actions/auth";

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
    <main className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-center mb-1">
          نظام إدارة الاستراحات والشاليهات
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          سجّل الدخول برقم الجوال والرمز السري
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              رقم الجوال
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              required
              autoFocus
              placeholder="05xxxxxxxx"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-gray-400"
              dir="ltr"
            />
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium mb-1">
              الرمز السري
            </label>
            <input
              id="code"
              name="code"
              type="password"
              inputMode="numeric"
              required
              placeholder="••••"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-gray-400"
              dir="ltr"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gray-900 text-white rounded-lg py-2.5 font-medium disabled:opacity-50"
          >
            {isPending ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </main>
  );
}
