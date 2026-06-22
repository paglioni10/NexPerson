import Link from "next/link";
import { CriticidadeBadge } from "@/components/CriticidadeBadge";
import { Empty, LinkButton, PageHeader, Table } from "@/components/ui";
import { listProcessos } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function ProcessosPage() {
  const processos = await listProcessos();

  return (
    <div>
      <PageHeader
        title="Processos"
        description="Processos da empresa e suas atividades."
        action={<LinkButton href="/processos/novo">Novo processo</LinkButton>}
      />

      {processos.length === 0 ? (
        <Empty>Nenhum processo cadastrado ainda.</Empty>
      ) : (
        <Table
          head={
            <tr>
              <th className="px-4 py-3">Processo</th>
              <th className="px-4 py-3">Área</th>
              <th className="px-4 py-3">Criticidade</th>
              <th className="px-4 py-3">Atividades</th>
            </tr>
          }
        >
          {processos.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <Link
                  href={`/processos/${p.id}`}
                  className="font-medium text-brand hover:underline"
                >
                  {p.nome}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-600">{p.area ?? "—"}</td>
              <td className="px-4 py-3">
                <CriticidadeBadge criticidade={p.criticidade} />
              </td>
              <td className="px-4 py-3 text-slate-600">{p.atividades}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
