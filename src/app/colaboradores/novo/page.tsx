import { PageHeader } from "@/components/ui";
import { ColaboradorForm } from "../ColaboradorForm";

export default function NovoColaboradorPage() {
  return (
    <div>
      <PageHeader title="Novo colaborador" />
      <ColaboradorForm />
    </div>
  );
}
