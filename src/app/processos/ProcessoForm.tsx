import Link from "next/link";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { CRITICIDADE } from "@/lib/enums";
import type { Processo } from "@/lib/repo";
import { saveProcesso } from "./actions";

export function ProcessoForm({ processo }: { processo?: Processo }) {
  return (
    <form action={saveProcesso} className="max-w-2xl space-y-5">
      {processo && <input type="hidden" name="id" value={processo.id} />}

      <Field label="Nome do processo">
        <Input name="nome" required defaultValue={processo?.nome ?? ""} />
      </Field>

      <Field label="Descrição">
        <Textarea name="descricao" defaultValue={processo?.descricao ?? ""} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Área responsável">
          <Input name="area" defaultValue={processo?.area ?? ""} />
        </Field>
        <Field label="Criticidade">
          <Select name="criticidade" defaultValue={processo?.criticidade ?? "Média"}>
            {CRITICIDADE.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="flex gap-2">
        <Button type="submit">Salvar</Button>
        <Link
          href="/processos"
          className="inline-flex items-center rounded-md border border-line px-3 py-2 text-sm font-medium text-ink hover:bg-subtle"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
