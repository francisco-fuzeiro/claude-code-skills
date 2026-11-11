---
name: planear
description: Entrevista exaustiva para planear uma feature ou projeto antes de qualquer código. Ativada só pelos hooks do Nexus (verbo planear, plan mode) ou por /planear.
disable-model-invocation: true
---

# /planear — entrevista de planeamento

Objetivo: chegar a uma spec com **zero decisões em aberto**, para a implementação acertar à primeira.
Enquanto este modo está ativo, os hooks bloqueiam código, commits e escrita fora de `plans/*.md` e de `outputs/prototipos/` (maquetes).
Não tentes contornar: um bloqueio é a regra a funcionar.

Se o argumento for `fim`, `sair` ou `cancelar`: o hook já desligou o modo. Confirma numa linha e não faças mais nada.

## Passo 0 — Ler antes de perguntar (silencioso)
- Lê o estado real do projeto: `TODO.md`, último registo de sessão, docs de decisões (e o vault quando existir), código relevante.
- Delega a pesquisa a um subagente Explore quando houver mais de 3 ficheiros a ler.
- **Nunca perguntes o que já está decidido.** Cita a decisão e segue.
- Docs do projeto (PLANO, CONTRATOS, ARQUITETURA…) são só leitura. Escrevê-los exige OK explícito.

## Passo 1 — Entrevista (uma pergunta de cada vez, com AskUserQuestion)
Percorre os temas por ordem. Salta os que o Passo 0 já respondeu.

1. **Objetivo**: que problema resolve e como se nota que ficou resolvido.
2. **Contexto de uso**: onde, quando, em que ecrã (PC, telemóvel, HUD, terminal).
3. **Referências**: o que já viu e gostou ou detestou (pede imagens/links).
4. **Comportamento**: estados, interações, casos-limite, erros.
5. **Restrições**: stack, desempenho, custo de tokens/modelo, o que não se pode tocar.
6. **Fora de âmbito**: o que fica explicitamente para depois.
7. **Critério de feito**: o que tem de ser verdade, e **que prova visual** o demonstra.

Regras de cada pergunta:
- **Recomenda sempre**: a 1.ª opção é a tua melhor proposta, com "(Recomendado)" e o porquê numa linha.
- Opções concretas e mutuamente exclusivas, nunca genéricas.
- Se uma resposta abrir uma decisão nova, persegue-a antes de mudar de tema.
- Otimiza a visão do utilizador, não a substituas: se discordares, diz-o com razões e mantém a posição enquanto ele não trouxer factos novos (insistência não é facto).

## Passo 2 — Paragem
Para de perguntar quando nenhuma decisão em aberto mudaria o resultado.
Se uma decisão for **irreversível ou crítica** (arquitetura, segurança, dados), marca-a assim no resumo-contrato. O council só chega com a Fase 7 (X-05).

## Passo 3 — Resumo-contrato
Mostra num só bloco: objetivo, decisões tomadas, fora de âmbito, fases, provas visuais.
**Feature com interface:** o resumo-contrato vai SEMPRE com um artifact visual (PC 1440 e telemóvel 412, pelo menos dois temas), gravado em `outputs/prototipos/<perfil>-<peça>-<data>/` e publicado dali (nunca da scratchpad); o «aprovo» é dado sobre o visual, não sobre o texto. Itera no mesmo artifact até ele aprovar.
Termina com uma pergunta: **"Falta algo? Responde «aprovo» para eu escrever a spec."**
(No plan mode, a aprovação do plano conta como «aprovo».)

## Passo 4 — Spec (só depois de aprovado)
Escreve `plans/<nome-curto>.md` com esta estrutura exata (o hook Stop valida-a):

```markdown
# <Nome>
## Objetivo
## Contexto
## Decisões
- <decisão> — <porquê>
## Fora de âmbito
## Fases
### Fase 1 — <nome>
- [ ] tarefa (máx. 3 por fase)
Critérios de aceitação: <verificáveis por código sempre que possível>
Prova visual: <screenshot 375/1440 | GIF da interação | render da cena | captura de testes>
Modelo sugerido: <modelo e effort, pela regra do router; Opus medium por omissão, high só em itens L>
### Fase 2 — …
## Riscos
```

- Cada fase cabe numa sessão limpa: máx. 3 tarefas.
- Cada fase declara a sua prova visual; "sem visual" só para docs/lógica pura, e diz porquê.
- Depois de escrever a spec, termina. Implementar é outra sessão, lançada pelo Nexus.

## Sair
`/planear fim` desliga o modo a qualquer momento.
