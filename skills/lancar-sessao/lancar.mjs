// Skill lancar-sessao: lança uma sessão em background pelo Nexus e verifica o arranque.
// Uso: node lancar.mjs <config.json>
// config: { agente ("codex" | null = Claude), pasta, nome, pedidoFicheiro, worktree (true | false), modelo, effort, modo, gate }
// 15/10: sem `agente` o Nexus lança no Claude Code mesmo com um modelo do Codex (o Claude recusa `gpt-6.1-sol`);
// por isso um modelo `gpt-*` sem `agente: "codex"` é recusado aqui, antes de lançar.
// O token lê-se na hora e nunca se imprime.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

const cfgPath = process.argv[2];
if (!cfgPath) throw new Error('uso: node lancar.mjs <config.json>');
const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
const pedido = readFileSync(path.resolve(path.dirname(cfgPath), cfg.pedidoFicheiro), 'utf8').trim();
if (pedido.length > 8000) throw new Error(`pedido com ${pedido.length} caracteres, acima de 8000: encurta`);
if (/^gpt-/i.test(cfg.modelo ?? '') && cfg.agente !== 'codex') throw new Error(`modelo ${cfg.modelo} é do Codex: pôr "agente": "codex" na config`);
if (cfg.agente === 'codex' && cfg.gate) throw new Error('sessão Codex com gate: nunca (fica "por aprovar" para sempre); gate null');

const token = readFileSync(path.join(os.homedir(), '.claude/nexus/token-local'), 'utf8').trim();
const api = async (op, corpo) => {
  const r = await fetch(`http://127.0.0.1:4180/api/${op}`, {
    method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: JSON.stringify(corpo),
  });
  return { status: r.status, corpo: await r.json() };
};

const r = await api('sessoes.lancar', {
  agente: cfg.agente ?? null, pasta: cfg.pasta, nome: cfg.nome, pedido,
  worktree: cfg.worktree === false ? null : { nome: cfg.nome },
  modelo: cfg.modelo ?? null, effort: cfg.effort ?? null, modo: cfg.modo ?? null, gate: cfg.gate ?? null,
  naRaiz: cfg.naRaiz === true,
});
console.log(`lançamento: ${r.status} ${JSON.stringify(r.corpo)} (${pedido.length} caracteres)`);
if (r.status !== 200) process.exit(1);

// Espera a sessão aparecer na lista JÁ ARRANCADA (até ~90 s) e confere modelo, pasta e base da worktree.
// 15/10: a 1.ª leitura traz muitas vezes o estado de arranque («crashou», pasta da raiz, modelo ?): comparar então a
// base comparava a raiz com ela própria e dizia «base certa» sem ver a worktree. Só serve um estado real e, com
// worktree, a pasta da worktree.
const arrancou = (x) => x.estado !== 'crashou' && x.modelo && (cfg.worktree === false || path.resolve(x.pasta) !== path.resolve(cfg.pasta));
let s, ultima;
for (let i = 0; i < 45 && !s; i++) {
  await new Promise((ok) => setTimeout(ok, 2000));
  ultima = (await api('sessoes.listar', {})).corpo.sessoes?.find((x) => x.idCurto === r.corpo.idCurto || x.id?.startsWith(r.corpo.idCurto));
  if (ultima && (arrancou(ultima) || (ultima.estado === 'erro' && ultima.detalheDoAgente))) s = ultima;
}
if (!s) { console.log(`AVISO: a sessão não arrancou em 90 s (último estado: ${ultima?.estado ?? 'ausente'}, pasta ${ultima?.pasta ?? '?'})`); process.exit(2); }
if (s.estado === 'erro') { console.log(`ERRO NO ARRANQUE: ${s.detalheDoAgente}`); process.exit(3); }
console.log(`sessão: ${s.id} · ${s.estado} · ${s.modelo ?? '?'} · ${s.pasta}`);
if (cfg.worktree !== false) {
  const git = (cwd, ...a) => execFileSync('git', ['-C', cwd, ...a], { encoding: 'utf8' }).trim();
  const ramo = git(cfg.pasta, 'rev-parse', 'HEAD');
  const base = git(s.pasta, 'rev-parse', 'HEAD');
  console.log(base === ramo ? `worktree na base certa (${ramo.slice(0, 7)})` : `AVISO: worktree em ${base.slice(0, 7)} e o ramo local em ${ramo.slice(0, 7)}: git -C "${s.pasta}" merge --ff-only <ramo> e avisar a sessão`);
}
