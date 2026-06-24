type Tone = "critical" | "warning" | "neutral";

const accent: Record<Tone, string> = {
  critical: "bg-danger",
  warning: "bg-warn",
  neutral: "bg-brand",
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
    <div className="elev elev-hover relative overflow-hidden rounded-card border border-line bg-card p-5">
      {/* faixa de acento à esquerda */}
      <span className={`absolute inset-y-0 left-0 w-1 ${accent[tone]}`} aria-hidden />
      <div className={`text-4xl font-extrabold tracking-tight ${valueStyles[tone]}`}>
        {value}
      </div>
      <div className="mt-1.5 text-sm font-semibold text-ink">{label}</div>
      {hint && <div className="mt-0.5 text-xs text-muted">{hint}</div>}
    </div>
  );
}
