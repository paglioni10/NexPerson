const styles: Record<string, string> = {
  Alta: "bg-red-100 text-red-700",
  Média: "bg-amber-100 text-amber-700",
  Baixa: "bg-slate-100 text-slate-600",
};

export function CriticidadeBadge({ criticidade }: { criticidade: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
        styles[criticidade] ?? styles.Baixa
      }`}
    >
      {criticidade}
    </span>
  );
}
