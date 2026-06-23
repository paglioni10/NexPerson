"use client";

import { useState, useTransition } from "react";
import { NIVEIS } from "@/lib/enums";
import type { ReconcExecutor } from "@/lib/metrics";
import { cadastrarCompetencia } from "./actions";

export function ReconcRow({ item }: { item: ReconcExecutor }) {
  const [nivel, setNivel] = useState(3); // sugere "Avançado" por padrão
  const [pending, startTransition] = useTransition();
  const [feito, setFeito] = useState(false);

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-3 font-medium text-ink">{item.colaborador}</td>
      <td className="px-4 py-3 text-slate-600">{item.atividade}</td>
      <td className="px-4 py-3 text-slate-600">{item.execucoes}×</td>
      <td className="px-4 py-3 text-right">
        {feito ? (
          <span className="text-sm font-medium text-green-600">Cadastrado ✓</span>
        ) : (
          <div className="flex items-center justify-end gap-2">
            <select
              value={nivel}
              onChange={(e) => setNivel(Number(e.target.value))}
              disabled={pending}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
            >
              {NIVEIS.map((n) => (
                <option key={n.value} value={n.value}>
                  {n.label}
                </option>
              ))}
            </select>
            <button
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await cadastrarCompetencia(item.atividade_id, item.colaborador_id, nivel);
                  setFeito(true);
                })
              }
              className="rounded-md bg-brand px-3 py-1 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50"
            >
              Cadastrar competência
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
