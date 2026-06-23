const styles: Record<string, string> = {
  Alta: "bg-danger-bg text-danger",
  Média: "bg-warn-bg text-warn",
  Baixa: "bg-subtle text-muted",
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
