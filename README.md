# Skills para Claude Code

As skills que mais uso no dia a dia com o Claude Code. Cada uma é um ficheiro de instruções que o agente segue, com regras de prova: nada é dado como feito sem evidência, e quem decide sou eu.

Estão em português europeu. Várias têm regras com data: cada uma nasceu de um erro real e ficou escrita para não se repetir.

## Orquestrar agentes

| Skill | Para que serve |
|---|---|
| [`lancar-sessao`](skills/lancar-sessao/SKILL.md) | Lança uma sessão de trabalho em background com o pedido completo, o modelo certo, worktree própria e uma vigia. A sessão só volta a mim para o que é perigoso. |
| [`planear`](skills/planear/SKILL.md) | Entrevista de planeamento antes de qualquer código, até a spec não ter decisões em aberto. Enquanto está ativa, o código e os commits ficam bloqueados. |
| [`council`](skills/council/SKILL.md) | Põe dois modelos (Claude e GPT) a decidir às cegas sobre o mesmo brief. O brief é validado por código, as opções são baralhadas e o cartão final é montado por um script, não pelo agente. |

A `lancar-sessao` e a `planear` correm sobre o Nexus, o meu orquestrador pessoal em cima do Claude Code, que não é público. Estão aqui tal como as uso, para mostrar o método; os scripts da `lancar-sessao` precisam do Nexus para funcionar. A `council` é autónoma: só precisa do Claude Code e do Codex.

## Automação pessoal

| Skill | Para que serve |
|---|---|
| [`planeador-semanal`](skills/planeador-semanal/SKILL.md) | Lê o plano de trabalho da semana no email, aplica as minhas regras e publica o horário no calendário. Regra única: nenhuma hora existe sem fonte. Versão genérica, com exemplos inventados. |

## Qualidade antes de lançar

| Skill | Para que serve |
|---|---|
| [`prototipo`](skills/prototipo/SKILL.md) | Gera 4 variantes de uma peça de design, tira screenshots, recomenda uma e espera pela escolha. |
| [`deploy-check`](skills/deploy-check/SKILL.md) | Valida build, SEO, formulário, analytics e responsividade, e bloqueia o deploy se algo falhar. |
| [`security-sweep`](skills/security-sweep/SKILL.md) | Auditoria de segurança com 85 verificações, caça por classes de ataque com subagentes e verificação independente de cada achado. |

## Três regras que atravessam todas

1. **Evidência antes de conclusão.** Um check só passa com o ficheiro, a linha ou o screenshot que o prova. Na dúvida, fica como desconhecido.
2. **O agente recomenda, a pessoa decide.** Planos, variantes de design e correções de segurança param à espera de aprovação.
3. **Quem verifica não é quem fez.** Cada achado de segurança é revisto por um subagente novo, e no council nenhum membro vê a resposta do outro na primeira ronda.

## Como usar

Copia a pasta da skill para `.claude/skills/` no teu projeto (ou para `~/.claude/skills/`, se a quiseres em todos):

```bash
cp -r skills/council .claude/skills/
```

Depois, no Claude Code, pede pelo nome: `/council`, `/security-sweep`, `/prototipo hero da landing page`.

## Créditos

A metodologia das fases de caça e verificação do `security-sweep`, a escala de severidade e os anti-padrões foram adaptados de `cloudflare/security-audit-skill` (licença MIT).

## Autor

Francisco Fuzeiro, Lisboa. [LinkedIn](https://www.linkedin.com/in/franciscofuzeiro)

© 2026 Francisco Fuzeiro. Podes ler e adaptar para uso próprio; para redistribuir ou usar comercialmente, fala comigo.
