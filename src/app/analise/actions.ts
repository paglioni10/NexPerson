"use server";

import { type Analise, gerarAnalise } from "@/lib/ai";

export async function gerarAnaliseAction(_prev: Analise | null): Promise<Analise> {
  return gerarAnalise();
}
