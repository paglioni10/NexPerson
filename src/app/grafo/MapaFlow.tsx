"use client";

import { useMemo, useState } from "react";
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

type FocoTipo = "tudo" | "processo" | "colaborador" | "atividade";

function bfStyle(bf: number | null): React.CSSProperties {
  if (bf == null) return { borderColor: "#cbd5e1", background: "#fff" };
  if (bf <= 1) return { borderColor: "#dc2626", background: "#fef2f2" };
  if (bf === 2) return { borderColor: "#f59e0b", background: "#fffbeb" };
  return { borderColor: "#16a34a", background: "#f0fdf4" };
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

const ctrlClass =
  "rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light";

export function MapaFlow({ grafo }: { grafo: Grafo }) {
  const [focoTipo, setFocoTipo] = useState<FocoTipo>("tudo");
  const [focoId, setFocoId] = useState<number | null>(null);
  const [soGargalos, setSoGargalos] = useState(false);
  const [ocultarSemCapacidade, setOcultarSemCapacidade] = useState(false);
  const [mostrarCoexecutores, setMostrarCoexecutores] = useState(true);

  // Colaboradores únicos (para o seletor e os nós).
  const colaboradores = useMemo(() => {
    const map = new Map<number, string>();
    grafo.links.forEach((l) => map.set(l.colaborador_id, l.nome));
    return [...map.entries()]
      .map(([id, nome]) => ({ id, nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [grafo.links]);

  const { nodes, edges, visibleCount } = useMemo(() => {
    // 1) Conjuntos visíveis conforme o modo de foco.
    let visAtiv = new Set<number>();
    let visProc = new Set<number>();
    let visColab = new Set<number>();

    const atividadesDoProc = (pid: number) =>
      grafo.atividades.filter((a) => a.processo_id === pid).map((a) => a.id);
    const colabsDaAtiv = (aid: number) =>
      grafo.links.filter((l) => l.atividade_id === aid).map((l) => l.colaborador_id);

    if (focoTipo === "tudo" || focoId == null) {
      grafo.atividades.forEach((a) => visAtiv.add(a.id));
      grafo.processos.forEach((p) => visProc.add(p.id));
      colaboradores.forEach((c) => visColab.add(c.id));
    } else if (focoTipo === "processo") {
      visProc.add(focoId);
      atividadesDoProc(focoId).forEach((aid) => {
        visAtiv.add(aid);
        colabsDaAtiv(aid).forEach((cid) => visColab.add(cid));
      });
    } else if (focoTipo === "atividade") {
      const a = grafo.atividades.find((x) => x.id === focoId);
      if (a) {
        visAtiv.add(a.id);
        visProc.add(a.processo_id);
        colabsDaAtiv(a.id).forEach((cid) => visColab.add(cid));
      }
    } else if (focoTipo === "colaborador") {
      visColab.add(focoId);
      grafo.links
        .filter((l) => l.colaborador_id === focoId)
        .forEach((l) => {
          visAtiv.add(l.atividade_id);
          const a = grafo.atividades.find((x) => x.id === l.atividade_id);
          if (a) visProc.add(a.processo_id);
        });
      if (mostrarCoexecutores) {
        [...visAtiv].forEach((aid) =>
          colabsDaAtiv(aid).forEach((cid) => visColab.add(cid)),
        );
      }
    }

    // 2) Filtro "só gargalos" (BF <= 1) sobre as atividades visíveis.
    if (soGargalos) {
      const bf = new Map(grafo.atividades.map((a) => [a.id, a.bus_factor]));
      visAtiv = new Set([...visAtiv].filter((id) => (bf.get(id) ?? 9) <= 1));
      // Reduz processos e colaboradores aos ainda conectados.
      visProc = new Set(
        [...visProc].filter((pid) =>
          atividadesDoProc(pid).some((aid) => visAtiv.has(aid)),
        ),
      );
    }

    // 3) Arestas visíveis.
    const visLinks = grafo.links.filter(
      (l) =>
        visAtiv.has(l.atividade_id) &&
        visColab.has(l.colaborador_id) &&
        (!ocultarSemCapacidade || l.capaz),
    );

    // 4) Remove colaboradores que ficaram sem nenhuma aresta (exceto o focado).
    const colabComLink = new Set(visLinks.map((l) => l.colaborador_id));
    visColab = new Set(
      [...visColab].filter(
        (cid) =>
          colabComLink.has(cid) || (focoTipo === "colaborador" && cid === focoId),
      ),
    );

    // 5) Layout sobre o conjunto filtrado (re-empilha, sem buracos).
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const ativOrdenadas = grafo.atividades.filter((a) => visAtiv.has(a.id));
    const atividadeY = new Map<number, number>();
    ativOrdenadas.forEach((a, i) => {
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

    grafo.processos
      .filter((p) => visProc.has(p.id))
      .forEach((p) => {
        const ys = ativOrdenadas
          .filter((a) => a.processo_id === p.id)
          .map((a) => atividadeY.get(a.id) ?? 0);
        const y = ys.length ? ys.reduce((s, v) => s + v, 0) / ys.length : 0;
        nodes.push({
          id: `p-${p.id}`,
          position: { x: COL_PROCESSO, y },
          data: { label: p.nome },
          style: { ...baseNode, ...bfStyle(p.bus_factor), fontWeight: 700, fontSize: 13 },
          sourcePosition: "right" as const,
          targetPosition: "left" as const,
        });
        ativOrdenadas
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

    const capazesPorColab = new Map<number, number>();
    grafo.links.forEach((l) => {
      if (l.capaz)
        capazesPorColab.set(
          l.colaborador_id,
          (capazesPorColab.get(l.colaborador_id) ?? 0) + 1,
        );
    });
    colaboradores
      .filter((c) => visColab.has(c.id))
      .forEach((c, i) => {
        const capazes = capazesPorColab.get(c.id) ?? 0;
        const concentrado = capazes >= 4;
        nodes.push({
          id: `c-${c.id}`,
          position: { x: COL_COLAB, y: i * ROW_H },
          data: { label: `${c.nome}${capazes ? ` · ${capazes} críticas` : ""}` },
          style: {
            ...baseNode,
            width: 200,
            background: concentrado ? "#fffbeb" : "#eff6ff",
            borderColor: concentrado ? "#f59e0b" : "#bfdbfe",
          },
          targetPosition: "left" as const,
        });
      });

    visLinks.forEach((l) =>
      edges.push({
        id: `a${l.atividade_id}-c${l.colaborador_id}`,
        source: `a-${l.atividade_id}`,
        target: `c-${l.colaborador_id}`,
        style: l.capaz
          ? { stroke: "#2563eb", strokeWidth: 1.5 }
          : { stroke: "#cbd5e1", strokeDasharray: "4 4" },
      }),
    );

    return {
      nodes,
      edges,
      visibleCount: { proc: visProc.size, ativ: visAtiv.size, colab: visColab.size },
    };
  }, [
    grafo,
    colaboradores,
    focoTipo,
    focoId,
    soGargalos,
    ocultarSemCapacidade,
    mostrarCoexecutores,
  ]);

  // Remonta o canvas quando o filtro muda → reaplica o fitView.
  const flowKey = `${focoTipo}-${focoId}-${soGargalos}-${ocultarSemCapacidade}-${mostrarCoexecutores}`;

  const opcoesFoco =
    focoTipo === "processo"
      ? grafo.processos.map((p) => ({ id: p.id, nome: p.nome }))
      : focoTipo === "atividade"
        ? grafo.atividades.map((a) => ({ id: a.id, nome: a.nome }))
        : focoTipo === "colaborador"
          ? colaboradores
          : [];

  return (
    <div className="space-y-3">
      {/* Barra de controles */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">Ver por:</span>
          <select
            className={ctrlClass}
            value={focoTipo}
            onChange={(e) => {
              setFocoTipo(e.target.value as FocoTipo);
              setFocoId(null);
            }}
          >
            <option value="tudo">Tudo</option>
            <option value="processo">Processo</option>
            <option value="colaborador">Colaborador</option>
            <option value="atividade">Atividade</option>
          </select>
        </div>

        {focoTipo !== "tudo" && (
          <select
            className={ctrlClass}
            value={focoId ?? ""}
            onChange={(e) =>
              setFocoId(e.target.value === "" ? null : Number(e.target.value))
            }
          >
            <option value="">Selecione…</option>
            {opcoesFoco.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nome}
              </option>
            ))}
          </select>
        )}

        <div className="ml-auto flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={soGargalos}
              onChange={(e) => setSoGargalos(e.target.checked)}
            />
            Só gargalos (BF ≤ 1)
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={ocultarSemCapacidade}
              onChange={(e) => setOcultarSemCapacidade(e.target.checked)}
            />
            Ocultar vínculos sem capacidade
          </label>
          {focoTipo === "colaborador" && (
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={mostrarCoexecutores}
                onChange={(e) => setMostrarCoexecutores(e.target.checked)}
              />
              Mostrar co-executores
            </label>
          )}
        </div>
      </div>

      <div className="h-[calc(100vh-280px)] overflow-hidden rounded-xl border border-slate-200 bg-white">
        <ReactFlow
          key={flowKey}
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
              <div className="mb-1 font-semibold text-ink">
                Exibindo {visibleCount.proc} processos · {visibleCount.ativ}{" "}
                atividades · {visibleCount.colab} colaboradores
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded border-2 border-red-600 bg-red-50" />
                Bus Factor ≤ 1 (crítico / órfã)
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded border-2 border-amber-500 bg-amber-50" />
                BF 2 / colaborador concentrado
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded border-2 border-green-600 bg-green-50" />
                Resiliente (≥ 3)
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-0.5 w-4 bg-blue-600" /> capaz
                <span className="ml-2 inline-block h-0.5 w-4 border-t-2 border-dashed border-slate-300" />{" "}
                sem capacidade
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
