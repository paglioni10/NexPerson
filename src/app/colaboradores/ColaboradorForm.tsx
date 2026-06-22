import Link from "next/link";
import { Button, Field, Input, Select } from "@/components/ui";
import { SENIORIDADE, STATUS } from "@/lib/enums";
import type { Colaborador } from "@/lib/repo";
import { saveColaborador } from "./actions";

export function ColaboradorForm({ colaborador }: { colaborador?: Colaborador }) {
  return (
    <form action={saveColaborador} className="max-w-2xl space-y-5">
      {colaborador && <input type="hidden" name="id" value={colaborador.id} />}

      <Field label="Nome">
        <Input name="nome" required defaultValue={colaborador?.nome ?? ""} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Cargo">
          <Input name="cargo" defaultValue={colaborador?.cargo ?? ""} />
        </Field>
        <Field label="Senioridade">
          <Select name="senioridade" defaultValue={colaborador?.senioridade ?? ""}>
            <option value="">—</option>
            {SENIORIDADE.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="Área">
          <Input name="area" defaultValue={colaborador?.area ?? ""} />
        </Field>
        <Field label="Departamento">
          <Input name="departamento" defaultValue={colaborador?.departamento ?? ""} />
        </Field>
        <Field label="Tempo de empresa">
          <Input name="tempo_empresa" defaultValue={colaborador?.tempo_empresa ?? ""} />
        </Field>
        <Field label="Status">
          <Select name="status" defaultValue={colaborador?.status ?? "ativo"}>
            {STATUS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="flex gap-2">
        <Button type="submit">Salvar</Button>
        <Link
          href="/colaboradores"
          className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
