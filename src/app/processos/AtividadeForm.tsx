import { Button, Field, Input, Select } from "@/components/ui";
import { CRITICIDADE } from "@/lib/enums";
import { saveAtividade } from "./actions";

/** Formulário inline para adicionar atividade a um processo. */
export function AtividadeForm({ processoId }: { processoId: number }) {
  return (
    <form
      action={saveAtividade}
      className="elev rounded-2xl border border-line bg-card p-4"
    >
      <input type="hidden" name="processo_id" value={processoId} />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr_1fr_auto] md:items-end">
        <Field label="Nova atividade">
          <Input name="nome" required placeholder="Nome da atividade" />
        </Field>
        <Field label="Criticidade">
          <Select name="criticidade" defaultValue="Média">
            {CRITICIDADE.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="Frequência">
          <Input name="frequencia" placeholder="Ex.: Diária" />
        </Field>
        <Button type="submit">Adicionar</Button>
      </div>
    </form>
  );
}
