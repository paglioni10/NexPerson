import { PageHeader } from "@/components/ui";
import { getGrafo } from "@/lib/grafo";
import { MapaFlow } from "./MapaFlow";

export const dynamic = "force-dynamic";

export default async function GrafoPage() {
  const grafo = await getGrafo();

  return (
    <div>
      <PageHeader
        title="Mapa de Dependência"
        description="Processo → Atividade → Colaborador. Gargalos destacados por Bus Factor."
      />
      <MapaFlow grafo={grafo} />
    </div>
  );
}
