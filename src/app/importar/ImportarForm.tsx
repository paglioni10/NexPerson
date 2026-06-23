"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui";
import { type ImportResult, importarCsv } from "./actions";

const inicial: ImportResult = { ok: false, importados: 0, erros: [] };

const exemplo = `colaborador,atividade,data
Beatriz Rocha,Contas a pagar,2026-05-10
João Pereira,Cotação de fornecedores,2026-05-12
Ana Lima,Admissão de funcionário,2026-05-14`;

export function ImportarForm() {
  const [state, action, pending] = useActionState(importarCsv, inicial);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <form action={action} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Arquivo CSV
            </label>
            <input
              type="file"
              name="arquivo"
              accept=".csv,text/csv"
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-dark"
            />
          </div>

          <div className="text-center text-xs text-slate-400">— ou cole o conteúdo —</div>

          <div>
            <textarea
              name="texto"
              rows={6}
              placeholder={exemplo}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-xs text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
            />
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Importando…" : "Importar"}
            </Button>
            <span className="text-xs text-slate-400">
              Colunas: <code>colaborador, atividade, data</code> (data opcional). O
              casamento é por nome.
            </span>
          </div>
        </form>
      </div>

      {state.mensagem && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            state.ok
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          <p className="font-medium">{state.mensagem}</p>
          {state.ok && (
            <p className="mt-1">
              Veja as divergências em{" "}
              <Link href="/reconciliacao" className="font-semibold underline">
                Reconciliação
              </Link>
              .
            </p>
          )}
          {state.erros.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs">
              {state.erros.map((e, i) => (
                <li key={i}>
                  Linha {e.linha}: {e.motivo}{" "}
                  <span className="text-slate-500">({e.conteudo})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
