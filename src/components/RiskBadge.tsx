/** Traduz o Bus Factor nas categorias auditáveis da spec (ADR-001). */
export function busFactorCategory(bf: number) {
  if (bf <= 0) return { label: "Órfã", className: "bg-red-100 text-red-700" };
  if (bf === 1) return { label: "Risco crítico", className: "bg-red-100 text-red-700" };
  if (bf === 2) return { label: "Risco moderado", className: "bg-amber-100 text-amber-700" };
  return { label: "Resiliente", className: "bg-green-100 text-green-700" };
}

export function RiskBadge({ busFactor }: { busFactor: number }) {
  const { label, className } = busFactorCategory(busFactor);
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {label} · BF {busFactor}
    </span>
  );
}
