import { PageHeader } from "@/components/ui";
import { AnaliseClient } from "./AnaliseClient";

export default function AnalisePage() {
  return (
    <div>
      <PageHeader
        title="Análise por IA"
        description="Diagnóstico, recomendações e resumo executivo em linguagem natural, a partir dos indicadores calculados."
      />
      <AnaliseClient />
    </div>
  );
}
