"use server";

import { revalidatePath } from "next/cache";
import { setCompetencia } from "@/lib/repo";

/** Resolve uma divergência: cadastra a competência sugerida pelos logs. */
export async function cadastrarCompetencia(
  atividadeId: number,
  colaboradorId: number,
  nivel: number,
) {
  await setCompetencia(atividadeId, colaboradorId, nivel);
  revalidatePath("/reconciliacao");
  revalidatePath("/dashboard");
}
