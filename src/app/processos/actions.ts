"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  deleteAtividade,
  deleteProcesso,
  upsertAtividade,
  upsertProcesso,
} from "@/lib/repo";

const orNull = (v: FormDataEntryValue | null) => {
  const s = (v ?? "").toString().trim();
  return s === "" ? null : s;
};

export async function saveProcesso(formData: FormData) {
  const idRaw = formData.get("id")?.toString();
  await upsertProcesso({
    id: idRaw ? Number(idRaw) : undefined,
    nome: (formData.get("nome") ?? "").toString().trim(),
    descricao: orNull(formData.get("descricao")),
    area: orNull(formData.get("area")),
    criticidade: (formData.get("criticidade") ?? "Média").toString(),
  });
  revalidatePath("/processos");
  revalidatePath("/dashboard");
  redirect("/processos");
}

export async function removeProcesso(formData: FormData) {
  await deleteProcesso(Number(formData.get("id")));
  revalidatePath("/processos");
  revalidatePath("/dashboard");
  redirect("/processos");
}

export async function saveAtividade(formData: FormData) {
  const idRaw = formData.get("id")?.toString();
  const processoId = Number(formData.get("processo_id"));
  await upsertAtividade({
    id: idRaw ? Number(idRaw) : undefined,
    processo_id: processoId,
    nome: (formData.get("nome") ?? "").toString().trim(),
    descricao: orNull(formData.get("descricao")),
    criticidade: (formData.get("criticidade") ?? "Média").toString(),
    tempo_medio: orNull(formData.get("tempo_medio")),
    frequencia: orNull(formData.get("frequencia")),
  });
  revalidatePath(`/processos/${processoId}`);
  revalidatePath("/dashboard");
}

export async function removeAtividade(formData: FormData) {
  const processoId = Number(formData.get("processo_id"));
  await deleteAtividade(Number(formData.get("id")));
  revalidatePath(`/processos/${processoId}`);
  revalidatePath("/dashboard");
}
