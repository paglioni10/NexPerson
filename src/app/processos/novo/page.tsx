import { PageHeader } from "@/components/ui";
import { ProcessoForm } from "../ProcessoForm";

export default function NovoProcessoPage() {
  return (
    <div>
      <PageHeader title="Novo processo" />
      <ProcessoForm />
    </div>
  );
}
