#!/usr/bin/env node
// /council · parte determinística (0 tokens): lint do brief, baralhar opções, montar o cartão.
// Uso: node council.mjs lint <dir>    → lê brief.json, escreve brief.md + lint.json (exit 1 se bloqueante)
//      node council.mjs cartao <dir>  → lê r1-*.json, r2-*.json, previsao.txt, mapa.json → escreve cartao.md
import fs from 'node:fs';
import path from 'node:path';

const [cmd, dir] = process.argv.slice(2);
if (!cmd || !dir) { console.error('uso: council.mjs <lint|cartao> <dir>'); process.exit(2); }
const ler = (f) => fs.readFileSync(path.join(dir, f), 'utf8');
const lerJson = (f) => { try { return JSON.parse(ler(f).replace(/^```(?:json)?\s*|\s*```\s*$/g, '')); } catch { return null; } };
const escrever = (f, c) => fs.writeFileSync(path.join(dir, f), typeof c === 'string' ? c : JSON.stringify(c, null, 2));
const palavras = (t) => (String(t ?? '').match(/\p{L}+/gu) ?? []).length;

// Linguagem carregada (PT-PT + PT-BR + EN). Aparece no brief → bloqueia.
const CARREGADAS = [
  'claramente', 'obviamente', 'óbvio', 'obvio', 'evidentemente', 'sem dúvida', 'sem duvida', 'indiscutivelmente',
  'o melhor', 'a melhor', 'a única', 'a unica', 'o único', 'o unico', 'devemos', 'deveríamos', 'deveriamos',
  'recomendo', 'recomendamos', 'prefiro', 'preferimos', 'péssim', 'pessim', 'excelente', 'perfeit', 'desastr',
  'naturalmente', 'certamente', 'é preciso', 'temos de', 'temos que', 'claro que', 'obviously', 'clearly', 'best option',
];

if (cmd === 'lint') {
  const b = lerJson('brief.json');
  const erros = [], avisos = [];
  if (!b) { console.error('brief.json inválido'); process.exit(2); }
  for (const k of ['pergunta', 'opcoes', 'criterios']) if (!b[k] || (Array.isArray(b[k]) && !b[k].length)) erros.push(`falta o campo "${k}"`);
  for (const k of ['recomendacao', 'recomendação', 'preferida', 'sugestao', 'sugestão', 'veredicto']) if (k in b) erros.push(`campo proibido "${k}": o brief não leva recomendação`);
  const ops = Array.isArray(b.opcoes) ? b.opcoes : [];
  if (ops.length < 2) erros.push('são precisas pelo menos 2 opções');
  ops.forEach((o, i) => {
    if (!o.descricao) erros.push(`opção ${i + 1} sem descrição`);
    if (!o.pros?.length) erros.push(`opção ${i + 1} ("${o.nome}") sem prós`);
    if (!o.contras?.length) erros.push(`opção ${i + 1} ("${o.nome}") sem contras`);
  });
  const tam = ops.map((o) => palavras([o.descricao, ...(o.pros ?? []), ...(o.contras ?? [])].join(' ')));
  if (tam.length >= 2) {
    const [mn, mx] = [Math.min(...tam), Math.max(...tam)];
    if (mx > 0 && (mx - mn) / mx > 0.3) erros.push(`opções desequilibradas: ${tam.join(' vs ')} palavras (máx. 30% de diferença)`);
  }
  (b.factos ?? []).forEach((f, i) => { if (!f.fonte) avisos.push(`facto ${i + 1} sem fonte`); });
  if (!b.fontes?.length) avisos.push('sem ponteiros para fontes: os membros só terão o resumo da sessão');
  const texto = JSON.stringify({ ...b, pergunta_original: undefined }).toLowerCase();
  const achadas = CARREGADAS.filter((p) => new RegExp(`(?<!\\p{L})${p}`, 'iu').test(texto));
  if (achadas.length) erros.push(`linguagem carregada: ${achadas.map((p) => `"${p}"`).join(', ')}`);

  // Baralhar (Fisher–Yates) e rotular A, B, C… — a ordem da sessão não passa para os membros.
  const idx = ops.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  const mapa = {}; const L = 'ABCDEFGH';
  const linhas = idx.map((orig, k) => {
    const o = ops[orig]; mapa[L[k]] = o.nome ?? `opção ${orig + 1}`;
    return `### Opção ${L[k]}\n${o.descricao}\n- Prós: ${(o.pros ?? []).join('; ')}\n- Contras: ${(o.contras ?? []).join('; ')}`;
  });
  const md = [
    '# Brief do council', '',
    '## Pergunta', b.pergunta, '',
    ...(b.pergunta_original ? ['## Nas palavras de quem decide', `> ${b.pergunta_original}`, ''] : []),
    '## Contexto (factos)', ...(b.factos ?? []).map((f) => `- ${f.texto}${f.fonte ? ` _(fonte: ${f.fonte})_` : ''}`), '',
    '## Fontes para leres tu mesmo', ...(b.fontes ?? []).map((f) => `- ${f}`), '',
    '## Restrições', ...(b.restricoes ?? []).map((r) => `- ${r}`), '',
    '## Critérios de decisão', ...(b.criterios ?? []).map((c) => `- ${c}`), '',
    '## Opções (ordem aleatória, sem preferência implícita)', ...linhas, '',
  ].join('\n');
  escrever('brief.md', md);
  escrever('mapa.json', mapa);
  escrever('lint.json', { ok: !erros.length, erros, avisos, palavras_por_opcao: Object.fromEntries(idx.map((o, k) => [L[k], tam[o]])) });
  console.log(JSON.stringify({ ok: !erros.length, erros, avisos }, null, 2));
  process.exit(erros.length ? 1 : 0);
}

if (cmd === 'cartao') {
  const mapa = lerJson('mapa.json') ?? {};
  const nome = (l) => (l && mapa[String(l).trim().toUpperCase()] ? `${String(l).toUpperCase()} (${mapa[String(l).trim().toUpperCase()]})` : String(l ?? '—'));
  const membros = [['Claude', 'claude'], ['GPT', 'gpt']].map(([rot, k]) => ({ rot, r1: lerJson(`r1-${k}.json`), r2: lerJson(`r2-${k}.json`) }));
  const falhou = membros.filter((m) => !m.r1).map((m) => m.rot);
  const final = (m) => (m.r2?.posicao_final ?? m.r1?.recomendacao);
  const [a, b] = membros;
  const consenso = a.r1 && b.r1 && String(final(a)).toUpperCase() === String(final(b)).toUpperCase();
  let previsao = ''; try { previsao = ler('previsao.txt').trim(); } catch {}
  const ecoou = previsao && consenso && new RegExp(`^\\s*${String(final(a)).trim()}\\b`, 'i').test(previsao);
  const bloco = (m) => !m.r1 ? [`### ${m.rot}`, '_Sem resposta válida._'] : [
    `### ${m.rot} — ${nome(final(m))}${m.r2 ? (m.r2.mudou ? ' · **mudou de posição**' : ' · manteve') : ''} · confiança ${m.r2?.confianca ?? m.r1.confianca ?? '?'}`,
    ...(m.r1.razoes ?? []).map((r, i) => `${i + 1}. ${r}`),
    `- Mudaria de ideia se: ${m.r1.mudaria_se ?? '—'}`,
    ...(m.r1.opcao_nova ? [`- **Opção fora da lista:** ${m.r1.opcao_nova}`] : []),
    ...(m.r2 ? [`- Falha mais forte que viu no outro: ${m.r2.falha_do_outro ?? '—'}`, ...(m.r2.argumento_novo ? [`- Argumento novo: ${m.r2.argumento_novo}`] : [])] : []),
  ];
  const md = [
    '# Cartão do council', '',
    falhou.length ? `> ⚠️ Sem resposta de: ${falhou.join(', ')}. Resultado parcial.\n` : '',
    consenso ? `## ✅ Consenso: ${nome(final(a))}` : '## ⚖️ Discordância — a decisão é tua',
    '',
    ...bloco(a), '', ...bloco(b), '',
    '## A pergunta que só tu podes responder',
    ...[a.r2?.pergunta_chave, b.r2?.pergunta_chave, a.r1?.pergunta_chave, b.r1?.pergunta_chave].filter(Boolean).slice(0, 2).map((q) => `- ${q}`),
    '',
    '## Previsão selada da sessão principal',
    previsao ? `> ${previsao}` : '> (não registada)',
    ecoou ? '\n⚠️ **O council repetiu a previsão da sessão.** Pode ser acerto, ou viés a passar pelo brief. Se acontecer muitas vezes, aperta o lint ou deixa o Sol escrever o brief.' : '',
  ].join('\n');
  escrever('cartao.md', md);
  console.log(md);
}
