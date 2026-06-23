/** Traduz o Bus Factor nas categorias auditáveis da spec (ADR-001). */
export function busFactorCategory(bf: number) {
  if (bf <= 0) return { label: "Órfã", className: "bg-danger-bg text-danger" };
  if (bf === 1) return { label: "Risco crítico", className: "bg-danger-bg text-danger" };
  if (bf === 2) return { label: "Risco moderado", className: "bg-warn-bg text-warn" };
  return { label: "Resiliente", className: "bg-ok-bg text-ok" };
}

export function RiskBadge({ busFactor }: { busFactor: number }) {
  const { label, className } = busFactorCategory(busFactor);
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {label} · BF {busFactor}
    </span>
  );
}
