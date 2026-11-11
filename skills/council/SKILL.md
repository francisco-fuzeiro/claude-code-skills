---
name: council
description: "Council v2 de dois membros (Claude contra GPT pelo Codex) em 3 níveis, Rápido, Normal e Fundo, para uma decisão com opções reais. Brief neutro validado por código, opções baralhadas, previsão selada, cartão montado por código. Triggers PT: council, corre o council, pergunta ao council, põe isto no council, estou dividido entre, qual escolho, valida esta decisão. EN: council, run the council, pressure-test this decision, which option. Não dispara em perguntas de sim ou não sem alternativas nem em factos."
disable-model-invocation: true
---

# Council v2 (Rápido · Normal · Fundo)

## 1. Quando dispara
- O utilizador pede um council, ou tem uma decisão com 2 ou mais opções reais e quer segunda opinião.
- Nível: o que ele disser; sem nível, **Normal**. Rápido e Fundo só se ele os nomear.
- Não corre sozinho fora destes pedidos (os 4 gatilhos automáticos do plano são do Nexus, não desta skill).

## 2. Regra única
**A sessão principal prepara, nunca decide nem resume as posições.** Brief sem recomendação, membros às cegas, cartão montado pelo `council.mjs`. A recomendação só aparece se os dois membros concordarem.

## 3. Método
Pasta de trabalho: `<repo>/outputs/council/<tema-curto>/` (nunca a scratchpad: o Artifact e alguns leitores recusam esse caminho).

| Nível | Lado Claude (subagente, contexto limpo) | Lado GPT (`codex exec`) | Rondas | Chamadas |
|---|---|---|---|---|
| Rápido | Opus | `gpt-6.1-sol` | 1 (às cegas) | 2 |
| Normal | Opus | `gpt-6.1-sol` | 2 (às cegas + crítica cruzada) | 4 |
| Fundo | Opus | `gpt-6-astra` | 2 | 4 (Astra caro e com limite apertado) |

O Rápido automático do Nexus (X-05, ainda por fazer) usa Sonnet 5.5 do lado Claude; esta skill só corre a pedido, por isso usa Opus. Normal e Fundo nunca correm sozinhos. O council não entra no `/planear` (Decidido 06/10).

1. **Brief** em `brief.json`: `pergunta`, `contexto` (factos com fonte, sem adjetivos), `opcoes[]` (cada uma com `nome`, `descricao`, `pros[]`, `contras[]`), `criterios[]`, `restricoes[]`, `fontes[]` (caminhos absolutos). NUNCA um campo de recomendação.
2. **Lint:** `node ~/.claude/skills/council/council.mjs lint <pasta>`. Se sair 1, corrigir o brief e repetir (é o teu viés a ser apanhado: linguagem carregada, opção sem contras, opções com mais de 30% de diferença). Gera `brief.md` (opções baralhadas A, B, C) e `mapa.json`.
3. **Previsão selada:** escreve em `previsao.txt` a letra que esperas e porquê, numa linha, ANTES de lançar. Não a mostres aos membros.
4. **Ronda 1, em paralelo:** monta `r1-prompt.txt` = `pedido-r1.md` + `brief.md`.
   - Claude: Agent com `model` do nível, `run_in_background`, prompt "lê r1-prompt.txt, faz o que pede, escreve só o JSON em r1-claude.json; teto 10 min".
   - GPT: `codex exec --skip-git-repo-check --ephemeral -s read-only -m <modelo> -o r1-gpt.json - < r1-prompt.txt > r1-gpt.log 2>&1; echo "codex exit=$?" >> r1-gpt.log` em segundo plano; esperar com `until grep -q "codex exit=" r1-gpt.log; do sleep 3; done`.
5. **Ronda 2 (Normal e Fundo), em paralelo:** para cada membro, `pedido-r2.md` + `brief.md` + a sua resposta da ronda 1 + a do outro. Se concordaram na ronda 1, acrescentar ao pedido: "Concordaram os dois: imagina que estão ambos errados e diz porquê." Saídas `r2-claude.json` e `r2-gpt.json`.
6. **Cartão:** `node ~/.claude/skills/council/council.mjs cartao <pasta>` → `cartao.md`.
7. **Ao utilizador:** o cartão como está, e depois, separado e marcado como teu, só os factos novos que verificaste nas fontes. Pergunta-lhe a decisão (AskUserQuestion); a escolha e as duas posições ficam no plano ou no vault.

## 4. Standards verificáveis
- `lint.json` com `"ok": true` antes de lançar qualquer membro.
- `previsao.txt` existe e tem data de modificação anterior a `r1-claude.json` e `r1-gpt.json`.
- O lado Claude é um subagente novo (nunca um fork da sessão) e o prompt dele é só o ficheiro; o lado GPT corre com `-s read-only`.
- `cartao.md` gerado pelo script; nenhuma frase do cartão escrita por ti.
- Membro sem resposta válida: o cartão diz "resultado parcial"; não inventar a posição em falta.

## 5. Output
- `cartao.md` na pasta do tema, mostrado ao utilizador tal como saiu.
- Uma linha com o custo: modelos e chamadas usados (e tokens do `codex exec` se o log os trouxer).
- A decisão dele registada onde a decisão vive (plano, TODO ou vault), com o caminho do cartão.

## 6. Limites honestos
- Dois membros não são uma amostra: discordância é sinal para ele decidir, não um empate a desfazer.
- O lint apanha viés de forma (palavras, tamanhos); não apanha factos escolhidos a dedo no contexto. Se o council repetir a previsão muitas vezes, o viés está a passar: deixa o GPT escrever o brief a partir das fontes.
- O `codex exec` precisa do Codex com login; sem ele, avisar e correr só o lado Claude como "resultado parcial".
- Esta skill não faz os 4 gatilhos automáticos nem mede "mudou a decisão" (isso é do Nexus, X-05 e log do C-04).
