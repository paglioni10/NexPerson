"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui";
import type { Analise } from "@/lib/ai";
import { gerarAnaliseAction } from "./actions";

export function AnaliseClient() {
  const [analise, action, pending] = useActionState(gerarAnaliseAction, null);

  return (
    <div className="space-y-6">
      <form action={action} className="elev flex items-center gap-3 rounded-card border border-line bg-card p-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Gerando análise…" : analise ? "Gerar novamente" : "Gerar análise"}
        </Button>
        <span className="text-sm text-muted">
          A IA traduz em texto os números já calculados — não estima nem decide.
        </span>
      </form>

      {analise && (
        <div className="space-y-5">
          {analise.fonte === "fallback" && (
            <p className="rounded-card border border-warn/40 bg-warn-bg px-4 py-2 text-xs text-warn">
              Gerado localmente (IA indisponível). Os números são os mesmos.
            </p>
          )}

          <Card title="Resumo executivo">
            <p className="text-sm leading-relaxed text-ink">{analise.resumo}</p>
          </Card>

          <Card title="Diagnóstico">
            <ul className="space-y-2">
              {analise.diagnostico.map((d, i) => (
                <li key={i} className="flex gap-2 text-sm text-ink">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                  {d}
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Recomendações">
            <ul className="space-y-2">
              {analise.recomendacoes.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm text-ink">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  {r}
                </li>
              ))}
            </ul>
          </Card>

          <p className="text-xs text-faint">
            Sugestão gerada por IA — revise antes de decidir.
          </p>
        </div>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="elev rounded-card border border-line bg-card p-6">
      <h2 className="mb-3 text-base font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}
