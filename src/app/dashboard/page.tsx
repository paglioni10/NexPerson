import { Section } from "@/components/Section";
import { StatCard } from "@/components/StatCard";
import { RiskBadge } from "@/components/RiskBadge";
import {
  getConcentracao,
  getDashboard,
  getFalsosBackups,
  getProcessosRisco,
  getReconciliacao,
} from "@/lib/metrics";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [d, processos, concentracao, falsos, reconc] = await Promise.all([
    getDashboard(),
    getProcessosRisco(),
    getConcentracao(),
    getFalsosBackups(),
    getReconciliacao(),
  ]);

  return (
    <div className="space-y-8">
      <div className="grad-brand elev relative overflow-hidden rounded-2xl p-7 text-white">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard Executivo</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-white/85">
          Contagens acionáveis de risco de continuidade — cada número rastreável até
          sua origem.
        </p>
      </div>

      {/* Contagens acionáveis (ADR-001 §4) — sem score composto opaco */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard
          label="Atividades órfãs"
          value={d.atividades_orfas}
          tone={d.atividades_orfas > 0 ? "critical" : "neutral"}
          hint="Bus Factor 0 — ninguém capaz"
        />
        <StatCard
          label="Processos com Bus Factor 1"
          value={d.processos_bf1}
          tone={d.processos_bf1 > 0 ? "critical" : "neutral"}
          hint="Uma ausência interrompe"
        />
        <StatCard
          label="Atividades críticas sem redundância"
          value={d.criticas_sem_redundancia}
          tone={d.criticas_sem_redundancia > 0 ? "warning" : "neutral"}
          hint="Alta criticidade, BF 1"
        />
        <StatCard
          label="Pessoas com concentração alta"
          value={d.pessoas_acima_ico}
          tone={d.pessoas_acima_ico > 0 ? "warning" : "neutral"}
          hint="ICO acima do limite"
        />
        <StatCard
          label="Falsos backups"
          value={d.falsos_backups}
          tone={d.falsos_backups > 0 ? "warning" : "neutral"}
          hint="Designado, mas sem capacidade"
        />
        <StatCard
          label="Cobertura (IRO ponderado)"
          value={`${d.iro_ponderado}%`}
          tone={d.iro_ponderado < 60 ? "warning" : "neutral"}
          hint="Ponderado por criticidade"
        />
      </div>

      <p className="text-xs text-faint">
        {d.total_processos} processos · {d.total_atividades} atividades ·{" "}
        {d.total_colaboradores} colaboradores ativos
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          title="Processos por risco"
          description="Bus Factor do processo = menor BF entre suas atividades críticas."
        >
          <ul className="divide-y divide-line">
            {processos.map((p) => (
              <li
                key={p.processo_id}
                className="flex items-center justify-between py-2.5"
              >
                <span className="text-sm font-medium text-ink">{p.nome}</span>
                <RiskBadge busFactor={p.bus_factor} />
              </li>
            ))}
          </ul>
        </Section>

        <Section
          title="Concentração de conhecimento (ICO)"
          description="Quanto do risco crítico está concentrado em cada pessoa (0–100)."
        >
          <ul className="divide-y divide-line">
            {concentracao.map((c) => {
              const alto = c.ico > c.ico_alerta;
              return (
                <li
                  key={c.colaborador_id}
                  className="flex items-center justify-between py-2.5"
                >
                  <span className="text-sm font-medium text-ink">{c.nome}</span>
                  <span
                    className={`text-sm font-bold ${alto ? "text-warn" : "text-muted"}`}
                  >
                    {c.ico}
                  </span>
                </li>
              );
            })}
          </ul>
        </Section>

        <Section
          title="Falsos backups"
          description="Designados como backup, mas sem capacidade real (inativos ou abaixo do nível mínimo)."
        >
          {falsos.length === 0 ? (
            <p className="text-sm text-faint">Nenhum identificado.</p>
          ) : (
            <ul className="divide-y divide-line">
              {falsos.map((f, i) => (
                <li key={i} className="py-2.5 text-sm">
                  <span className="font-medium text-ink">{f.colaborador}</span>
                  <span className="text-muted"> — {f.atividade}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section
          title="Reconciliação: execução × cadastro"
          description="Executa nos registros, mas não consta como competente — possível backup real a validar."
        >
          {reconc.length === 0 ? (
            <p className="text-sm text-faint">Sem divergências.</p>
          ) : (
            <ul className="divide-y divide-line">
              {reconc.map((r, i) => (
                <li key={i} className="py-2.5 text-sm">
                  <span className="font-medium text-ink">{r.colaborador}</span>
                  <span className="text-muted">
                    {" "}
                    executa <strong>{r.atividade}</strong> ({r.execucoes}×) sem
                    cadastro
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}
