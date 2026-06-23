import { PageHeader } from "@/components/ui";
import { ImportarForm } from "./ImportarForm";

export default function ImportarPage() {
  return (
    <div>
      <PageHeader
        title="Importar execuções (CSV)"
        description="Logs de execução de ERP/Monday. Servem para sugerir cadastros e reconciliar — não definem capacidade (ADR-002)."
      />
      <ImportarForm />
    </div>
  );
}
