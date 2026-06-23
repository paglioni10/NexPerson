import { Empty, LinkButton, PageHeader, Table } from "@/components/ui";
import { listColaboradores } from "@/lib/repo";
import { removeColaborador } from "./actions";

export const dynamic = "force-dynamic";

export default async function ColaboradoresPage() {
  const colaboradores = await listColaboradores();

  return (
    <div>
      <PageHeader
        title="Colaboradores"
        description="Cadastro das pessoas da organização."
        action={<LinkButton href="/colaboradores/novo">Novo colaborador</LinkButton>}
      />

      {colaboradores.length === 0 ? (
        <Empty>Nenhum colaborador cadastrado ainda.</Empty>
      ) : (
        <Table
          head={
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Cargo</th>
              <th className="px-4 py-3">Área</th>
              <th className="px-4 py-3">Senioridade</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          }
        >
          {colaboradores.map((c) => (
            <tr key={c.id} className="hover:bg-subtle">
              <td className="px-4 py-3 font-medium text-ink">{c.nome}</td>
              <td className="px-4 py-3 text-muted">{c.cargo ?? "—"}</td>
              <td className="px-4 py-3 text-muted">{c.area ?? "—"}</td>
              <td className="px-4 py-3 text-muted">{c.senioridade ?? "—"}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    c.status === "ativo"
                      ? "bg-ok-bg text-ok"
                      : "bg-subtle text-muted"
                  }`}
                >
                  {c.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-3">
                  <a
                    href={`/colaboradores/${c.id}`}
                    className="text-sm font-medium text-brand hover:underline"
                  >
                    Editar
                  </a>
                  <form action={removeColaborador}>
                    <input type="hidden" name="id" value={c.id} />
                    <button className="text-sm font-medium text-danger hover:underline">
                      Excluir
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
