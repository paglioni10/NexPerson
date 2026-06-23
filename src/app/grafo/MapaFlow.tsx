"use client";

import { useMemo } from "react";
import {
  Background,
  Controls,
  type Edge,
  MiniMap,
  type Node,
  Panel,
  ReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Grafo } from "@/lib/grafo";

const ROW_H = 64;
const COL_PROCESSO = 0;
const COL_ATIVIDADE = 320;
const COL_COLAB = 660;

/** Cor da borda/fundo de um nó de atividade ou processo conforme o Bus Factor. */
function bfStyle(bf: number | null): React.CSSProperties {
  if (bf == null) return { borderColor: "#cbd5e1", background: "#fff" };
  if (bf <= 1) return { borderColor: "#dc2626", background: "#fef2f2" }; // crítico/órfã
  if (bf === 2) return { borderColor: "#f59e0b", background: "#fffbeb" }; // moderado
  return { borderColor: "#16a34a", background: "#f0fdf4" }; // resiliente
}

const baseNode: React.CSSProperties = {
  borderRadius: 10,
  borderWidth: 2,
  borderStyle: "solid",
  padding: "8px 12px",
  fontSize: 12,
  fontWeight: 600,
  width: 220,
  color: "#111827",
};

export function MapaFlow({ grafo }: { grafo: Grafo }) {
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Coluna 2: atividades empilhadas, agrupadas por processo.
    const atividadeY = new Map<number, number>();
    grafo.atividades.forEach((a, i) => {
      const y = i * ROW_H;
      atividadeY.set(a.id, y);
      nodes.push({
        id: `a-${a.id}`,
        position: { x: COL_ATIVIDADE, y },
        data: { label: `${a.nome} · BF ${a.bus_factor}` },
        style: { ...baseNode, ...bfStyle(a.bus_factor) },
        sourcePosition: "right" as const,
        targetPosition: "left" as const,
      });
    });

    // Coluna 1: processos centralizados na média das suas atividades.
    grafo.processos.forEach((p) => {
      const ys = grafo.atividades
        .filter((a) => a.processo_id === p.id)
        .map((a) => atividadeY.get(a.id) ?? 0);
      const y = ys.length ? ys.reduce((s, v) => s + v, 0) / ys.length : 0;
      nodes.push({
        id: `p-${p.id}`,
        position: { x: COL_PROCESSO, y },
        data: { label: p.nome },
        style: {
          ...baseNode,
          ...bfStyle(p.bus_factor),
          fontWeight: 700,
          fontSize: 13,
        },
        sourcePosition: "right" as const,
        targetPosition: "left" as const,
      });
      grafo.atividades
        .filter((a) => a.processo_id === p.id)
        .forEach((a) =>
          edges.push({
            id: `p${p.id}-a${a.id}`,
            source: `p-${p.id}`,
            target: `a-${a.id}`,
            style: { stroke: "#cbd5e1" },
          }),
        );
    });

    // Coluna 3: colaboradores únicos. Contamos quantas atividades cada um cobre
    // de forma capaz — concentração = muitos vínculos chegando.
    const colabIds = [...new Set(grafo.links.map((l) => l.colaborador_id))];
    const colabInfo = new Map<number, { nome: string; capazes: number }>();
    grafo.links.forEach((l) => {
      const info = colabInfo.get(l.colaborador_id) ?? { nome: l.nome, capazes: 0 };
      if (l.capaz) info.capazes += 1;
      colabInfo.set(l.colaborador_id, info);
    });
    const colabY = new Map<number, number>();
    colabIds
      .sort((a, b) =>
        (colabInfo.get(a)?.nome ?? "").localeCompare(colabInfo.get(b)?.nome ?? ""),
      )
      .forEach((id, i) => {
        const y = i * ROW_H;
        colabY.set(id, y);
        const info = colabInfo.get(id)!;
        const concentrado = info.capazes >= 4;
        nodes.push({
          id: `c-${id}`,
          position: { x: COL_COLAB, y },
          data: { label: `${info.nome}${info.capazes ? ` · ${info.capazes} críticas` : ""}` },
          style: {
            ...baseNode,
            width: 200,
            background: concentrado ? "#fffbeb" : "#eff6ff",
            borderColor: concentrado ? "#f59e0b" : "#bfdbfe",
          },
          targetPosition: "left" as const,
        });
      });

    // Arestas atividade → colaborador. Tracejada/apagada se não for capaz.
    grafo.links.forEach((l) =>
      edges.push({
        id: `a${l.atividade_id}-c${l.colaborador_id}`,
        source: `a-${l.atividade_id}`,
        target: `c-${l.colaborador_id}`,
        style: l.capaz
          ? { stroke: "#2563eb", strokeWidth: 1.5 }
          : { stroke: "#cbd5e1", strokeDasharray: "4 4" },
      }),
    );

    return { nodes, edges };
  }, [grafo]);

  return (
    <div className="h-[calc(100vh-220px)] overflow-hidden rounded-xl border border-slate-200 bg-white">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        minZoom={0.2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#e2e8f0" gap={20} />
        <Controls />
        <MiniMap pannable zoomable />
        <Panel position="top-left">
          <div className="rounded-lg border border-slate-200 bg-white/90 p-3 text-xs shadow-sm">
            <div className="mb-1 font-semibold text-ink">Legenda</div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded border-2 border-red-600 bg-red-50" />
              Bus Factor ≤ 1 (crítico / órfã)
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded border-2 border-amber-500 bg-amber-50" />
              Bus Factor 2 (moderado)
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded border-2 border-green-600 bg-green-50" />
              Resiliente (≥ 3)
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded border-2 border-amber-500 bg-amber-50" />
              Colaborador com alta concentração
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-0.5 w-4 bg-blue-600" /> vínculo capaz
              <span className="ml-2 inline-block h-0.5 w-4 border-t-2 border-dashed border-slate-300" />{" "}
              sem capacidade
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
