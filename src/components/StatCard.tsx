type Tone = "critical" | "warning" | "neutral";

const toneStyles: Record<Tone, string> = {
  critical: "border-danger/40 bg-danger-bg",
  warning: "border-warn/40 bg-warn-bg",
  neutral: "border-line bg-card",
};

const valueStyles: Record<Tone, string> = {
  critical: "text-danger",
  warning: "text-warn",
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
      <div className="mt-1 text-sm font-medium text-ink">{label}</div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </div>
  );
}
