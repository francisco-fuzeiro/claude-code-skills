// Skill lancar-sessao: vigia uma sessão lançada. Correr com run_in_background; sai (e acorda quem a lançou) quando a
// sessão acaba o turno, tem um pedido sem resposta há 10 min, morre ou fica 30 min sem mexer.
// Uso: node vigia.mjs <id da sessão, completo ou os primeiros 8 caracteres>. O token lê-se na hora e nunca se imprime.
// Sessões sem transcript do Claude (Codex) seguem-se pelo estado do sessoes.listar (15/10: vigias com id curto ou
// numa sessão Codex ficavam caladas para sempre, porque o transcript nunca aparecia).
import { readFileSync, statSync, readdirSync, existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const PEDIDO = process.argv[2];
if (!PEDIDO) throw new Error('uso: node vigia.mjs <id da sessão>');
const pastaProj = path.join(os.homedir(), '.claude/projects');
const token = readFileSync(path.join(os.homedir(), '.claude/nexus/token-local'), 'utf8').trim();
const api = async (op) => (await fetch(`http://127.0.0.1:4180/api/${op}`, {
  method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: '{}',
})).json();

const candidatas = ((await api('sessoes.listar')).sessoes ?? []).filter((x) => x.id.startsWith(PEDIDO));
if (candidatas.length !== 1) {
  console.log(`ERRO: ${candidatas.length} sessões começam por ${PEDIDO}; passar o id completo`);
  process.exit(1);
}
const ID = candidatas[0].id;
const transcript = () => {
  for (const d of readdirSync(pastaProj)) {
    const f = path.join(pastaProj, d, `${ID}.jsonl`);
    if (existsSync(f)) return f;
  }
  return null;
};

function ultimoAssistente(f) {
  const linhas = readFileSync(f, 'utf8').trim().split('\n');
  for (let i = linhas.length - 1; i >= 0; i--) {
    try { const j = JSON.parse(linhas[i]); if (j.type === 'assistant') return j; } catch { /* linha a meio */ }
  }
  return null;
}

const espera = (ms) => new Promise((ok) => setTimeout(ok, ms));
const inicio = Date.now();
let semTrabalharDesde = null;
for (;;) {
  await espera(60_000);
  let s;
  try {
    const p = ((await api('caixa.ler')).pedidos ?? []).find((x) => x.sessaoId === ID);
    s = ((await api('sessoes.listar')).sessoes ?? []).find((x) => x.id === ID);
    if (!s || !s.vivo) { console.log(`MORREU: a sessão já não está viva (estado ${s?.estado ?? 'desconhecido'})`); break; }
    if (p && Date.now() - (Date.parse(p.recebidoEm ?? '') || inicio) > 600_000) {
      console.log(`PEDIDO SEM RESPOSTA HÁ 10 MIN: ${p.tipo} ${p.resumo}`); break;
    }
  } catch (e) { console.log(`aviso: serviço sem resposta (${e.name})`); continue; }
  const f = transcript();
  if (f === null) {
    // Sem transcript do Claude: segue o estado do Nexus.
    if (s.estado === 'a-trabalhar') { semTrabalharDesde = null; continue; }
    semTrabalharDesde ??= Date.now();
    if (Date.now() - semTrabalharDesde > 90_000) { console.log(`FIM DE TURNO (pelo estado do Nexus): ${s.estado}`); break; }
    continue;
  }
  const parado = (Date.now() - statSync(f).mtimeMs) / 1000;
  const a = ultimoAssistente(f);
  if (a?.message?.stop_reason === 'end_turn' && parado > 90) {
    const texto = a.message.content.filter((c) => c.type === 'text').map((c) => c.text).join('\n');
    console.log(`FIM DE TURNO:\n${texto.slice(-3000)}`);
    break;
  }
  if (parado > 1800) { console.log('PARADA: 30 min sem mexer no transcript'); break; }
}
