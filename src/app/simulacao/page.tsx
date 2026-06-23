import { CriticidadeBadge } from "@/components/CriticidadeBadge";
import { StatCard } from "@/components/StatCard";
import { Empty, PageHeader } from "@/components/ui";
import { getSimulacao, listColaboradoresAtivos } from "@/lib/simulacao";

export const dynamic = "force-dynamic";

const situacaoStyle: Record<string, string> = {
  "Órfã": "bg-danger-bg text-danger",
  "Vira crítica": "bg-danger-bg text-danger",
  "Perde redundância": "bg-warn-bg text-warn",
};

export default async function SimulacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c } = await searchParams;
  const colaboradores = await listColaboradoresAtivos();
  const sim = c ? await getSimulacao(Number(c)) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Simulação de Impacto"
        description="Recálculo determinístico: o que acontece com a continuidade se um colaborador sair."
      />

      <form method="get" className="flex items-center gap-3 rounded-xl border border-line bg-card p-4">
        <span className="text-sm font-medium text-muted">
          O que acontece se sair:
        </span>
        <select
          name="c"
          defaultValue={c ?? ""}
          className="rounded-md border border-line bg-card px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
        >
          <option value="">Selecione um colaborador…</option>
          {colaboradores.map((col) => (
            <option key={col.id} value={col.id}>
              {col.nome}
            </option>
          ))}
        </select>
        <button className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark">
          Simular
        </button>
      </form>

      {!sim ? (
        <Empty>Selecione um colaborador para ver o impacto da saída dele.</Empty>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Atividades impactadas"
              value={sim.resumo.atividades_impactadas}
              tone={sim.resumo.atividades_impactadas > 0 ? "warning" : "neutral"}
            />
            <StatCard
              label="Ficam sem responsável"
              value={sim.resumo.novas_orfas}
              tone={sim.resumo.novas_orfas > 0 ? "critical" : "neutral"}
              hint="Viram órfãs (BF 0)"
            />
            <StatCard
              label="Processos comprometidos"
              value={sim.resumo.processos_comprometidos}
              tone={sim.resumo.processos_comprometidos > 0 ? "critical" : "neutral"}
            />
            <StatCard
              label="Cobertura (IRO)"
              value={`${sim.resumo.iro_antes}% → ${sim.resumo.iro_depois}%`}
              tone={
                sim.resumo.iro_depois < sim.resumo.iro_antes ? "warning" : "neutral"
              }
              hint="Ponderada por criticidade"
            />
          </div>

          <p className="text-sm text-muted">
            Se <strong>{sim.colaborador.nome}</strong> sair:{" "}
            {sim.resumo.novas_orfas > 0 && (
              <>
                <strong>{sim.resumo.novas_orfas}</strong> atividade(s) ficam sem
                nenhum responsável capaz,{" "}
              </>
            )}
            <strong>{sim.resumo.processos_comprometidos}</strong> processo(s) têm o
            risco agravado, e a cobertura cai de{" "}
            <strong>{sim.resumo.iro_antes}%</strong> para{" "}
            <strong>{sim.resumo.iro_depois}%</strong>.
          </p>

          {sim.atividades.length === 0 ? (
            <Empty>
              A saída de {sim.colaborador.nome} não reduz o Bus Factor de nenhuma
              atividade — boa resiliência.
            </Empty>
          ) : (
            <div className="overflow-hidden rounded-xl border border-line bg-card">
              <table className="w-full text-sm">
                <thead className="border-b border-line bg-subtle text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3">Atividade</th>
                    <th className="px-4 py-3">Processo</th>
                    <th className="px-4 py-3">Criticidade</th>
                    <th className="px-4 py-3">Bus Factor</th>
                    <th className="px-4 py-3">Situação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {sim.atividades.map((a, i) => (
                    <tr key={i} className="hover:bg-subtle">
                      <td className="px-4 py-3 font-medium text-ink">{a.nome}</td>
                      <td className="px-4 py-3 text-muted">{a.processo}</td>
                      <td className="px-4 py-3">
                        <CriticidadeBadge criticidade={a.criticidade} />
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {a.bf_antes} → <strong>{a.bf_depois}</strong>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                            situacaoStyle[a.situacao]
                          }`}
                        >
                          {a.situacao}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
