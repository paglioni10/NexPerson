"use client";

import { useTransition } from "react";
import { NIVEIS, PAPEL, PAPEL_LABEL } from "@/lib/enums";
import type { VinculoRow } from "@/lib/repo";
import { saveAtribuicao, saveCompetencia } from "./actions";

const selectClass =
  "rounded-md border border-line bg-card px-2 py-1.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light disabled:opacity-50";

export function VinculosEditor({
  atividadeId,
  processoId,
  nivelMinimoCapaz,
  vinculos,
}: {
  atividadeId: number;
  processoId: number;
  nivelMinimoCapaz: number;
  vinculos: VinculoRow[];
}) {
  const [pending, startTransition] = useTransition();

  const onNivel = (colaboradorId: number, value: string) =>
    startTransition(() =>
      saveCompetencia(
        atividadeId,
        processoId,
        colaboradorId,
        value === "" ? null : Number(value),
      ),
    );

  const onPapel = (colaboradorId: number, value: string) =>
    startTransition(() =>
      saveAtribuicao(atividadeId, processoId, colaboradorId, value === "" ? null : value),
    );

  return (
    <div className="elev overflow-hidden rounded-2xl border border-line bg-card">
      <table className="w-full text-sm">
        <thead className="border-b border-line bg-subtle text-left text-xs font-semibold uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3">Colaborador</th>
            <th className="px-4 py-3">Nível de domínio (capacidade)</th>
            <th className="px-4 py-3">Papel (designação)</th>
            <th className="px-4 py-3">Situação</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {vinculos.map((v) => {
            const inativo = v.status !== "ativo";
            const capaz = !inativo && v.nivel != null && v.nivel >= nivelMinimoCapaz;
            const falsoBackup = v.papel === "backup" && !capaz;
            return (
              <tr key={v.colaborador_id} className="hover:bg-subtle">
                <td className="px-4 py-3 font-medium text-ink">
                  {v.nome}
                  {inativo && (
                    <span className="ml-2 text-xs font-normal text-faint">
                      (inativo)
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <select
                    className={selectClass}
                    defaultValue={v.nivel ?? ""}
                    disabled={pending}
                    onChange={(e) => onNivel(v.colaborador_id, e.target.value)}
                  >
                    <option value="">—</option>
                    {NIVEIS.map((n) => (
                      <option key={n.value} value={n.value}>
                        {n.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <select
                    className={selectClass}
                    defaultValue={v.papel ?? ""}
                    disabled={pending}
                    onChange={(e) => onPapel(v.colaborador_id, e.target.value)}
                  >
                    <option value="">—</option>
                    {PAPEL.map((p) => (
                      <option key={p} value={p}>
                        {PAPEL_LABEL[p]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  {falsoBackup ? (
                    <span className="rounded-full bg-warn-bg px-2 py-0.5 text-xs font-semibold text-warn">
                      Falso backup
                    </span>
                  ) : capaz ? (
                    <span className="rounded-full bg-ok-bg px-2 py-0.5 text-xs font-semibold text-ok">
                      Executor capaz
                    </span>
                  ) : (
                    <span className="text-xs text-faint">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
