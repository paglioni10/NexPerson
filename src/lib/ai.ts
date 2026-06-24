import "server-only";
import { sql } from "./db";
import {
  getConcentracao,
  getDashboard,
  getFalsosBackups,
  getProcessosRisco,
  getReconciliacao,
} from "./metrics";

/**
 * Camada de IA, APENAS linguagem (ADR-001 + ADR-004).
 * A IA não calcula nada: recebe os números já apurados pelas views e os traduz
 * em texto. Sempre há fallback determinístico se a chave/serviço falhar.
 */

export type Analise = {
  diagnostico: string[];
  recomendacoes: string[];
  resumo: string;
  fonte: "ia" | "fallback";
};

const MODEL = "gemini-2.5-flash";

async function buildPayload() {
  const [dashboard, processos, concentracao, falsos, reconc, orfas] =
    await Promise.all([
      getDashboard(),
      getProcessosRisco(),
      getConcentracao(),
      getFalsosBackups(),
      getReconciliacao(),
      sql<{ atividade: string; processo: string }[]>`
        select nome as atividade,
               (select nome from processo p where p.id = v.processo_id) as processo
        from vw_bus_factor_atividade v where bus_factor = 0`,
    ]);

  return {
    empresa: "Acme",
    dashboard,
    processos_risco: processos
      .filter((p) => p.bus_factor <= 1)
      .map((p) => ({ nome: p.nome, bus_factor: p.bus_factor })),
    atividades_orfas: orfas,
    concentracao: concentracao
      .filter((c) => c.ico > c.ico_alerta)
      .map((c) => ({ colaborador: c.nome, ico: c.ico })),
    falsos_backups: falsos,
    reconciliacao: reconc,
  };
}

const SYSTEM = `Você é o analista de continuidade operacional do NexPerson, plataforma de gestão de RISCO OPERACIONAL e CONTINUIDADE.
REGRAS:
1. Use SOMENTE os dados do JSON. Nunca invente números, nomes ou fatos.
2. NÃO avalie desempenho de pessoas. Analise a vulnerabilidade dos PROCESSOS e a concentração de conhecimento, com foco em resiliência.
3. Toda conclusão é uma SUGESTÃO de apoio à decisão humana.
4. Português do Brasil, tom corporativo, claro, sem emojis.
5. Não use o caractere travessão; prefira vírgulas, dois-pontos ou ponto final.
GLOSSÁRIO: Bus Factor (BF) = nº mínimo de pessoas cuja ausência interrompe um processo (0 = órfã; 1 = crítico). ICO = concentração de risco numa pessoa. IRO ponderado = % de cobertura com backup. Falso backup = designado sem capacidade real.`;

const TASK = `Com base no JSON, responda APENAS com um objeto JSON válido (sem markdown) no formato:
{"diagnostico": [string], "recomendacoes": [string], "resumo": string}
- diagnostico: 3 a 6 achados objetivos, do mais grave ao menos grave, cada um citando o número que o sustenta.
- recomendacoes: 3 a 5 ações priorizadas (treinamento cruzado, backup capaz, sucessão, validação de dados). Quando a reconciliação apontar alguém que já executa sem cadastro, sugira VALIDAR esse vínculo.
- resumo: parágrafo de 3 a 5 frases para a liderança, começando pela conclusão principal.`;

function fallback(p: Awaited<ReturnType<typeof buildPayload>>): Analise {
  const d = p.dashboard;
  const diagnostico: string[] = [];
  if (d.atividades_orfas > 0)
    diagnostico.push(`${d.atividades_orfas} atividade(s) crítica(s) estão órfãs, sem nenhum executor capaz.`);
  if (d.processos_bf1 > 0)
    diagnostico.push(`${d.processos_bf1} processo(s) dependem de uma única pessoa (Bus Factor 1).`);
  if (d.criticas_sem_redundancia > 0)
    diagnostico.push(`${d.criticas_sem_redundancia} atividade(s) crítica(s) não têm redundância.`);
  if (d.falsos_backups > 0)
    diagnostico.push(`${d.falsos_backups} backup(s) são apenas formais, sem capacidade real.`);
  diagnostico.push(`A cobertura ponderada por criticidade (IRO) é de ${d.iro_ponderado}%.`);

  const recomendacoes: string[] = [];
  if (p.atividades_orfas.length)
    recomendacoes.push(`Priorizar as atividades órfãs (ex.: ${p.atividades_orfas[0].atividade}): designar e capacitar ao menos um executor.`);
  if (p.reconciliacao.length)
    recomendacoes.push(`Validar ${p.reconciliacao[0].colaborador} como backup de "${p.reconciliacao[0].atividade}": já executa nos registros, mas não consta como competente.`);
  if (p.concentracao.length)
    recomendacoes.push(`Reduzir a concentração em ${p.concentracao[0].colaborador} (ICO ${p.concentracao[0].ico}) com treinamento cruzado.`);
  if (p.falsos_backups.length)
    recomendacoes.push(`Substituir backups apenas formais por executores efetivamente capazes.`);

  const resumo = `Os maiores riscos de continuidade estão nos processos com Bus Factor 1 e nas ${d.atividades_orfas} atividade(s) órfã(s). A cobertura ponderada é de ${d.iro_ponderado}% e ${d.pessoas_acima_ico} pessoa(s) concentram risco acima do limite. Recomenda-se priorizar a cobertura das atividades críticas e a formalização de backups reais.`;

  return { diagnostico, recomendacoes, resumo, fonte: "fallback" };
}

export async function gerarAnalise(): Promise<Analise> {
  const payload = await buildPayload();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fallback(payload);

  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: SYSTEM }] },
    contents: [
      { parts: [{ text: `${TASK}\n\nJSON:\n${JSON.stringify(payload)}` }] },
    ],
    generationConfig: { temperature: 0.3, responseMimeType: "application/json" },
  });
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  try {
    // O modelo pode retornar 503 (alta demanda) de forma transitória, tentamos de novo.
    let res: Response | null = null;
    for (let tentativa = 0; tentativa < 3; tentativa++) {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (res.ok) break;
      if (res.status !== 503 && res.status !== 429) break;
      await new Promise((r) => setTimeout(r, 1500));
    }
    if (!res || !res.ok) return fallback(payload);
    const data = await res.json();
    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return fallback(payload);

    const parsed = JSON.parse(text);
    return {
      diagnostico: Array.isArray(parsed.diagnostico) ? parsed.diagnostico : [],
      recomendacoes: Array.isArray(parsed.recomendacoes) ? parsed.recomendacoes : [],
      resumo: typeof parsed.resumo === "string" ? parsed.resumo : "",
      fonte: "ia",
    };
  } catch {
    return fallback(payload);
  }
}
