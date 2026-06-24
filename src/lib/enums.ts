/** Opções de domínio compartilhadas entre formulários e o banco. */

export const STATUS = ["ativo", "inativo"] as const;

export const SENIORIDADE = ["Júnior", "Pleno", "Sênior", "Especialista"] as const;

export const CRITICIDADE = ["Baixa", "Média", "Alta"] as const;

export const PAPEL = ["principal", "secundario", "backup"] as const;

export const PAPEL_LABEL: Record<(typeof PAPEL)[number], string> = {
  principal: "Principal",
  secundario: "Secundário",
  backup: "Backup",
};

/** Níveis de domínio (1..4), ordinais, conforme docs/NexPerson.md §0. */
export const NIVEIS = [
  { value: 1, label: "Iniciante" },
  { value: 2, label: "Intermediário" },
  { value: 3, label: "Avançado" },
  { value: 4, label: "Especialista" },
] as const;

export const nivelLabel = (n: number) =>
  NIVEIS.find((x) => x.value === n)?.label ?? String(n);
