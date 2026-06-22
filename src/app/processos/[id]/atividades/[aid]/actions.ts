"use server";

import { revalidatePath } from "next/cache";
import { setAtribuicao, setCompetencia } from "@/lib/repo";

export async function saveCompetencia(
  atividadeId: number,
  processoId: number,
  colaboradorId: number,
  nivel: number | null,
) {
  await setCompetencia(atividadeId, colaboradorId, nivel);
  revalidatePath(`/processos/${processoId}/atividades/${atividadeId}`);
  revalidatePath(`/processos/${processoId}`);
  revalidatePath("/dashboard");
}

export async function saveAtribuicao(
  atividadeId: number,
  processoId: number,
  colaboradorId: number,
  papel: string | null,
) {
  await setAtribuicao(atividadeId, colaboradorId, papel);
  revalidatePath(`/processos/${processoId}/atividades/${atividadeId}`);
  revalidatePath(`/processos/${processoId}`);
  revalidatePath("/dashboard");
}
