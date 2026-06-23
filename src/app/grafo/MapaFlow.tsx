"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Background,
  Controls,
  type Edge,
  Handle,
  MiniMap,
  type Node,
  type NodeProps,
  NodeResizer,
  Panel,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Grafo } from "@/lib/grafo";

const ROW_H = 64;
const COL_PROCESSO = 0;
const COL_ATIVIDADE = 320;
const COL_COLAB = 660;

type FocoTipo = "tudo" | "processo" | "colaborador" | "atividade";

type BoxData = {
  label: string;
  bg: string;
  border: string;
  bold?: boolean;
};

function bfColors(bf: number | null): { bg: string; border: string } {
  if (bf == null) return { bg: "#fff", border: "#cbd5e1" };
  if (bf <= 1) return { bg: "#fef2f2", border: "#dc2626" };
  if (bf === 2) return { bg: "#fffbeb", border: "#f59e0b" };
  return { bg: "#f0fdf4", border: "#16a34a" };
}

/** Nó customizado: caixa arrastável e redimensionável. */
function BoxNode({ data, selected }: NodeProps) {
  const d = data as BoxData;
  return (
    <>
      <NodeResizer minWidth={120} minHeight={40} isVisible={!!selected} />
      <Handle type="target" position={Position.Left} />
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          borderRadius: 10,
          border: `2px solid ${d.border}`,
          background: d.bg,
          padding: "8px 12px",
          fontSize: d.bold ? 13 : 12,
          fontWeight: d.bold ? 700 : 600,
          color: "#111827",
          boxSizing: "border-box",
        }}
      >
        {d.label}
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
}

const nodeTypes = { box: BoxNode };

const ctrlClass =
  "rounded-md border border-line bg-card px-2 py-1.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light";

export function MapaFlow({ grafo }: { grafo: Grafo }) {
  const [focoTipo, setFocoTipo] = useState<FocoTipo>("tudo");
  const [focoId, setFocoId] = useState<number | null>(null);
  const [soGargalos, setSoGargalos] = useState(false);
  const [ocultarSemCapacidade, setOcultarSemCapacidade] = useState(false);
  const [mostrarCoexecutores, setMostrarCoexecutores] = useState(true);
  const [resetKey, setResetKey] = useState(0);

  const colaboradores = useMemo(() => {
    const map = new Map<number, string>();
    grafo.links.forEach((l) => map.set(l.colaborador_id, l.nome));
    return [...map.entries()]
      .map(([id, nome]) => ({ id, nome }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [grafo.links]);

  // Layout automático calculado a partir dos filtros (a "organização padrão").
  const computed = useMemo(() => {
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

    if (soGargalos) {
      const bf = new Map(grafo.atividades.map((a) => [a.id, a.bus_factor]));
      visAtiv = new Set([...visAtiv].filter((id) => (bf.get(id) ?? 9) <= 1));
      visProc = new Set(
        [...visProc].filter((pid) =>
          atividadesDoProc(pid).some((aid) => visAtiv.has(aid)),
        ),
      );
    }

    const visLinks = grafo.links.filter(
      (l) =>
        visAtiv.has(l.atividade_id) &&
        visColab.has(l.colaborador_id) &&
        (!ocultarSemCapacidade || l.capaz),
    );

    const colabComLink = new Set(visLinks.map((l) => l.colaborador_id));
    visColab = new Set(
      [...visColab].filter(
        (cid) =>
          colabComLink.has(cid) || (focoTipo === "colaborador" && cid === focoId),
      ),
    );

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const ativOrdenadas = grafo.atividades.filter((a) => visAtiv.has(a.id));
    const atividadeY = new Map<number, number>();
    ativOrdenadas.forEach((a, i) => {
      const y = i * ROW_H;
      atividadeY.set(a.id, y);
      const c = bfColors(a.bus_factor);
      nodes.push({
        id: `a-${a.id}`,
        type: "box",
        position: { x: COL_ATIVIDADE, y },
        style: { width: 220 },
        data: { label: `${a.nome} · BF ${a.bus_factor}`, ...c },
      });
    });

    grafo.processos
      .filter((p) => visProc.has(p.id))
      .forEach((p) => {
        const ys = ativOrdenadas
          .filter((a) => a.processo_id === p.id)
          .map((a) => atividadeY.get(a.id) ?? 0);
        const y = ys.length ? ys.reduce((s, v) => s + v, 0) / ys.length : 0;
        const c = bfColors(p.bus_factor);
        nodes.push({
          id: `p-${p.id}`,
          type: "box",
          position: { x: COL_PROCESSO, y },
          style: { width: 220 },
          data: { label: p.nome, ...c, bold: true },
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
          type: "box",
          position: { x: COL_COLAB, y: i * ROW_H },
          style: { width: 200 },
          data: {
            label: `${c.nome}${capazes ? ` · ${capazes} críticas` : ""}`,
            bg: concentrado ? "#fffbeb" : "#eff6ff",
            border: concentrado ? "#f59e0b" : "#bfdbfe",
          },
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
      count: { proc: visProc.size, ativ: visAtiv.size, colab: visColab.size },
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

  // Estado controlado: permite arrastar e redimensionar; persiste na sessão.
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Reaplica o layout automático quando os filtros mudam ou ao "Restaurar".
  useEffect(() => {
    setNodes(computed.nodes);
    setEdges(computed.edges);
  }, [computed, resetKey, setNodes, setEdges]);

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
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-card p-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted">Ver por:</span>
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

        <button
          onClick={() => setResetKey((k) => k + 1)}
          className="rounded-md border border-line px-3 py-1.5 text-sm font-medium text-ink hover:bg-subtle"
        >
          Restaurar organização
        </button>

        <div className="ml-auto flex flex-wrap items-center gap-4 text-sm text-muted">
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

      <div className="h-[calc(100vh-280px)] overflow-hidden rounded-xl border border-line bg-card">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#e2e8f0" gap={20} />
          <Controls />
          <MiniMap pannable zoomable />
          <Panel position="top-left">
            <div className="rounded-lg border border-line bg-card/90 p-3 text-xs shadow-sm">
              <div className="mb-1 font-semibold text-ink">
                Exibindo {computed.count.proc} processos · {computed.count.ativ}{" "}
                atividades · {computed.count.colab} colaboradores
              </div>
              <div className="mb-1 text-faint">
                Arraste para mover · selecione para redimensionar
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
                <span className="ml-2 inline-block h-0.5 w-4 border-t-2 border-dashed border-line" />{" "}
                sem capacidade
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
