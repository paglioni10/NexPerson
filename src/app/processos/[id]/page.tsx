import Link from "next/link";
import { notFound } from "next/navigation";
import { CriticidadeBadge } from "@/components/CriticidadeBadge";
import { RiskBadge } from "@/components/RiskBadge";
import { Empty, LinkButton, PageHeader } from "@/components/ui";
import { getAtividadesBF } from "@/lib/metrics";
import { getProcesso } from "@/lib/repo";
import { AtividadeForm } from "../AtividadeForm";
import { removeAtividade, removeProcesso } from "../actions";

export const dynamic = "force-dynamic";

export default async function ProcessoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const processoId = Number(id);
  const processo = await getProcesso(processoId);
  if (!processo) notFound();
  const atividades = await getAtividadesBF(processoId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={processo.nome}
        description={processo.descricao ?? undefined}
        action={
          <div className="flex gap-2">
            <LinkButton href={`/processos/${processoId}/editar`} variant="ghost">
              Editar processo
            </LinkButton>
            <form action={removeProcesso}>
              <input type="hidden" name="id" value={processoId} />
              <button className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-danger hover:bg-danger-bg">
                Excluir
              </button>
            </form>
          </div>
        }
      />

      <div className="flex items-center gap-3 text-sm text-muted">
        <span>Área: {processo.area ?? "—"}</span>
        <span>·</span>
        <span className="flex items-center gap-1">
          Criticidade: <CriticidadeBadge criticidade={processo.criticidade} />
        </span>
      </div>

      <AtividadeForm processoId={processoId} />

      <div>
        <h2 className="mb-3 text-base font-bold text-ink">Atividades</h2>
        {atividades.length === 0 ? (
          <Empty>Nenhuma atividade neste processo.</Empty>
        ) : (
          <div className="elev overflow-hidden rounded-card border border-line bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-subtle text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Atividade</th>
                  <th className="px-4 py-3">Criticidade</th>
                  <th className="px-4 py-3">Risco</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {atividades.map((a) => (
                  <tr key={a.atividade_id} className="hover:bg-subtle">
                    <td className="px-4 py-3 font-medium text-ink">{a.nome}</td>
                    <td className="px-4 py-3">
                      <CriticidadeBadge criticidade={a.criticidade} />
                    </td>
                    <td className="px-4 py-3">
                      <RiskBadge busFactor={a.bus_factor} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-3">
                        <Link
                          href={`/processos/${processoId}/atividades/${a.atividade_id}`}
                          className="text-sm font-medium text-brand hover:underline"
                        >
                          Vínculos
                        </Link>
                        <form action={removeAtividade}>
                          <input type="hidden" name="id" value={a.atividade_id} />
                          <input type="hidden" name="processo_id" value={processoId} />
                          <button className="text-sm font-medium text-danger hover:underline">
                            Excluir
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
