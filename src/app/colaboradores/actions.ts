"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteColaborador, upsertColaborador } from "@/lib/repo";

const orNull = (v: FormDataEntryValue | null) => {
  const s = (v ?? "").toString().trim();
  return s === "" ? null : s;
};

export async function saveColaborador(formData: FormData) {
  const idRaw = formData.get("id")?.toString();
  await upsertColaborador({
    id: idRaw ? Number(idRaw) : undefined,
    nome: (formData.get("nome") ?? "").toString().trim(),
    cargo: orNull(formData.get("cargo")),
    area: orNull(formData.get("area")),
    departamento: orNull(formData.get("departamento")),
    senioridade: orNull(formData.get("senioridade")),
    tempo_empresa: orNull(formData.get("tempo_empresa")),
    status: (formData.get("status") ?? "ativo").toString(),
  });
  revalidatePath("/colaboradores");
  revalidatePath("/dashboard");
  redirect("/colaboradores");
}

export async function removeColaborador(formData: FormData) {
  await deleteColaborador(Number(formData.get("id")));
  revalidatePath("/colaboradores");
  revalidatePath("/dashboard");
}
