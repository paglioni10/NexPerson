import { Empty, LinkButton, PageHeader } from "@/components/ui";
import {
  getReconciliacaoBackups,
  getReconciliacaoExecutores,
} from "@/lib/metrics";
import { ReconcRow } from "./ReconcRow";

export const dynamic = "force-dynamic";

export default async function ReconciliacaoPage() {
  const [executores, backups] = await Promise.all([
    getReconciliacaoExecutores(),
    getReconciliacaoBackups(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reconciliação"
        description="Divergências entre o que foi declarado e o que os logs mostram (ADR-002)."
        action={<LinkButton href="/importar" variant="ghost">Importar CSV</LinkButton>}
      />

      <section>
        <h2 className="mb-1 text-base font-bold text-ink">
          Executa, mas não está cadastrado
        </h2>
        <p className="mb-3 text-sm text-muted">
          Aparece nos logs executando a atividade, mas não consta como competente.
          Possível backup real a formalizar.
        </p>
        {executores.length === 0 ? (
          <Empty>Sem divergências. Importe um CSV de execuções para reconciliar.</Empty>
        ) : (
          <div className="overflow-hidden rounded-xl border border-line bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-subtle text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Colaborador</th>
                  <th className="px-4 py-3">Atividade</th>
                  <th className="px-4 py-3">Execuções</th>
                  <th className="px-4 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {executores.map((item) => (
                  <ReconcRow key={`${item.colaborador_id}-${item.atividade_id}`} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-1 text-base font-bold text-ink">
          Backup que nunca executou
        </h2>
        <p className="mb-3 text-sm text-muted">
          Designado como backup, mas sem nenhum registro de execução. Suspeita de
          backup apenas no papel.
        </p>
        {backups.length === 0 ? (
          <Empty>Nenhum backup sem execução registrada.</Empty>
        ) : (
          <div className="overflow-hidden rounded-xl border border-line bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-line bg-subtle text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Colaborador</th>
                  <th className="px-4 py-3">Atividade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {backups.map((b, i) => (
                  <tr key={i} className="hover:bg-subtle">
                    <td className="px-4 py-3 font-medium text-ink">{b.colaborador}</td>
                    <td className="px-4 py-3 text-muted">{b.atividade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
