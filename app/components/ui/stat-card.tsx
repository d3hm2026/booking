import type { LucideIcon } from "lucide-react";

type Tone = "indigo" | "emerald" | "amber" | "red" | "gray";

const TONE_CLASSES: Record<Tone, string> = {
  indigo: "bg-indigo-50 text-indigo-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  red: "bg-red-50 text-red-600",
  gray: "bg-gray-100 text-gray-500",
};

export function StatCard({
  icon: Icon,
  label,
  value,
  tone = "indigo",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone?: Tone;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
      <div className={`rounded-lg p-2.5 ${TONE_CLASSES[tone]}`}>
        <Icon className="size-5" strokeWidth={2} />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
