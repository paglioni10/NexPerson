type Tone = "critical" | "warning" | "neutral";

const toneStyles: Record<Tone, string> = {
  critical: "border-red-200 bg-red-50",
  warning: "border-amber-200 bg-amber-50",
  neutral: "border-slate-200 bg-white",
};

const valueStyles: Record<Tone, string> = {
  critical: "text-red-600",
  warning: "text-amber-600",
  neutral: "text-ink",
};

export function StatCard({
  label,
  value,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: string | number;
  tone?: Tone;
  hint?: string;
}) {
  return (
    <div className={`rounded-xl border p-5 ${toneStyles[tone]}`}>
      <div className={`text-3xl font-bold ${valueStyles[tone]}`}>{value}</div>
      <div className="mt-1 text-sm font-medium text-slate-700">{label}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}
