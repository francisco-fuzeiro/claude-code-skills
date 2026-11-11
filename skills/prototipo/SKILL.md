---
name: "prototipo"
description: "Gera N variantes de qualquer peça de design (secção de site, ecrã ou componente de uma app, post, cartão), compara-as com screenshots, recomenda uma e só implementa a escolhida depois de quem decide escolher."
---

# /prototipo: variantes de design, com evidência

> Origem: inspirada num fluxo `/prototype` mostrado por um designer da equipa do Claude Code.
> Regra de fundo: o modelo ainda não é bom juiz de design. A skill produz opções e evidência; quem escolhe é a pessoa. O Claude recomenda, nunca decide sozinho.

## Uso

`/prototipo <peça> [N] [perfil] [--implementa]`

- `<peça>`: o que se desenha, numa frase. Ex.: "hero da landing page", "cartão de estado da app", "caixa de pendentes no telemóvel", "post de lançamento".
- `N`: 4 por omissão, máximo 5.
- `perfil`: o nome de um perfil definido no projeto (ver Passo 0) ou `livre`. Se não for óbvio pela peça, pergunta uma vez.
- `--implementa`: implementa logo a recomendada. Só quando a pessoa o escrever.

## Passo 0: perfil e contexto

Um perfil diz à skill onde está a verdade visual de um projeto. Escolhe o perfil e lê as fontes dele. Se a peça já existe, lê o código e tira screenshot (variante 0, a referência).

Cada perfil define quatro coisas:

1. **Fontes a ler, por ordem:** ficheiros de tokens, CSS base, protótipo aprovado, a peça atual.
2. **Regras do visual que não se negoceiam:** temas, uso do acento, tipos de letra, densidade.
3. **Tamanhos de prova:** um pequeno e um grande.
4. **Regras de implementação:** onde vivem as peças partilhadas, o que nunca se edita sem ok.

### Exemplo: perfil de uma app com interface escura

- Fontes: `src/ui/tokens.css`, `src/ui/base.css`, o protótipo aprovado em `references/design/` e a peça atual.
- Só escuro. O acento é a cor do contexto em foco: mostra cada variante em pelo menos dois temas, para provar que não depende de uma cor.
- Uma cor reservada para "por aprovar". Vermelho só para erro e perigo.
- Denso e calmo. Nada de visual que não responda a: o que está a acontecer, o que mudou, o que precisa de aprovação, o que vem a seguir.
- Telemóvel: alvos de 44 px, inputs de 16 px, sem overflow a 412 px, usável a uma mão.
- Copy PT-PT, sem travessões, com o vocabulário do produto. Dados realistas, nunca "Item 1".
- Tamanhos de prova: 1440x900 e 412x915.
- Cores sempre por token, nunca literais.

### Exemplo: perfil de um site de cliente

- Fontes: o `CLAUDE.md` do projeto, `client-brand.md` e `client-brief.md` (público, objetivo, tom).
- Sem marca escrita: para e diz que falta. Não inventes cores nem fontes.
- Sem fotografias de negócios reais nem rostos reconhecíveis (placeholders na geometria final).
- Tamanhos de prova: 375x812 e 1440x900.

### `livre`

Sem marca: pergunta o tom numa linha e propõe uma direção diferente por variante.

## Passo 1: variantes (conceitos diferentes, não afinações)

Escreve antes o conceito de cada variante numa linha. Cada uma muda a ideia, não a cor de um botão. Pelo menos dois eixos por variante:

- hierarquia (o que se lê primeiro: promessa, prova, estado, imagem);
- composição (centrada, dividida, assimétrica, em camadas, em lista, em grelha);
- densidade (tudo à vista contra revelação progressiva);
- movimento (estático, revelação, estado vivo, contador);
- ação principal (onde está, quantos toques até ela; nos sites: um CTA, dois níveis, telefone, marcação).

Regras: mesmos tokens do perfil em todas; copy real ou PT-PT a sério (nunca lorem, nunca PT-BR, sem travessões); sem dependências novas; tem de funcionar no tamanho pequeno do perfil.

Cada variante é um HTML autónomo (Tailwind por CDN, tokens do perfil copiados para `:root`, fontes ligadas), fora do código do projeto:

```
outputs/prototipos/<perfil>-<peça>-<AAAA-MM-DD>/
  v0-atual.png (se a peça existir)
  v1.html ... vN.html
  v1-<pequeno>.png, v1-<grande>.png ...
  index.html (folha de contacto, legível no telemóvel)
```

## Passo 2: evidência

Screenshot de cada variante nos dois tamanhos do perfil, com Playwright em Chromium.

Abre tu cada imagem e verifica: nada cortado ou sobreposto, texto legível no tamanho pequeno, ação principal visível sem scroll. Variante partida corrige-se ou sai.

A folha de contacto (`index.html`) mostra por variante: o conceito numa linha, os screenshots e a nota do Passo 3.

## Passo 3: recomendação, não decisão

Avalia contra o objetivo, a clareza no tamanho pequeno e as regras do perfil. Escolhe uma e diz porquê em 3 linhas no máximo, com o que perde face à segunda melhor, e diz qual é a mais arriscada. Depois para e entrega (salvo `--implementa`):

```
| # | Conceito | Forte | Fraco |
Recomendo a N porque ...
Folha de contacto: <caminho>
Qual implemento?
```

## Passo 4: implementar a escolhida

1. Isolamento: worktree no repo do projeto; nunca direto no main.
2. Transpõe para o código do projeto (React/TypeScript/Tailwind/Framer Motion), com os primitivos que já existem.
3. Gate em ciclo, máximo 3 tentativas: `npx tsc -b && npm run build` (e `npm test`, se existir). Ao fim de 3 falhas, para e reporta.
4. Prova visual: screenshot da peça implementada nos dois tamanhos, lado a lado com a variante escolhida (`final-*.png`). Se divergir sem razão, corrige.
5. Commit com mensagem clara. Nunca push sem a pessoa pedir.

## Entrega final (curta, para o telemóvel)

- Variante implementada e porquê, numa linha.
- Gate: comando e código de saída.
- Screenshots finais e ficheiros tocados.
- O que ficou de fora.

## Nunca

- Escolher e implementar sem a pessoa, salvo `--implementa`.
- Variantes que são a mesma ideia com outras cores.
- Dar como feito sem gate a 0 e sem screenshot final verificado.
- Misturar marcas entre projetos.
- Copiar código de bibliotecas de componentes: inspiração é mecanismo, nunca ficheiro.
