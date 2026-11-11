---
name: deploy-check
description: >
  Valida um site ou landing page (React/Vite) antes de fazer deploy para Vercel. Usa esta skill sempre
  que o utilizador menciona "deploy", "entregar ao cliente", "publicar o site", "Vercel", "lançar",
  "está pronto para entregar?", ou quando executa o slash command /deploy-check no Claude Code.
  Percorre um checklist completo: performance, responsividade, SEO, GA4, formulário, acessibilidade,
  variáveis de ambiente, e build sem erros. Gera um relatório de prontidão e bloqueia o deploy se
  encontrar problemas críticos. Essencial antes de qualquer entrega a cliente.
---

# Deploy Check

Validação completa antes de entregar um projeto de cliente. Nenhum site é entregue sem passar neste checklist.

---

## Como executar

O deploy-check corre em duas fases:
1. **Checks automáticos** — coisas que o Claude Code pode verificar no código
2. **Checks manuais** — coisas que requerem browser (Lighthouse, responsividade visual)

Para cada check, marcar: ✅ Passou | ⚠️ Aviso (não bloqueia) | ❌ Falhou (bloqueia deploy)

---

## Fase 1: Checks de código (automáticos)

### 1.1 Build sem erros
```bash
cd src
npm run build
```
- ❌ **Bloqueante:** qualquer erro de TypeScript ou de build
- ⚠️ **Aviso:** warnings de TypeScript (documentar e aceitar conscientemente)

### 1.2 Variáveis de ambiente
Verificar que existem e estão configuradas:
```bash
# Verificar .env.local e/ou .env.production
cat .env.local 2>/dev/null || echo "Sem .env.local"
```

Variáveis obrigatórias:
- [ ] `VITE_GA4_MEASUREMENT_ID` — ex: `G-XXXXXXXXXX`
- [ ] `VITE_FORMSPREE_ID` — se usar formulário Formspree
- [ ] Quaisquer outras definidas no projeto

> ⚠️ Garantir que variáveis sensíveis NUNCA estão commitadas no Git (verificar `.gitignore`)

### 1.3 Imagens e assets
```bash
# Verificar se existem imagens referenciadas no código
grep -r "src=\"" src/ | grep -v node_modules | grep -v ".svg"
```
- [ ] Todas as imagens existem no diretório correto
- [ ] Extensões corretas (preferir `.webp` ou `.jpg` para fotos, `.svg` para ícones)
- [ ] Nenhum `placeholder.jpg` ou `image-goes-here` no código

### 1.4 Copy — sem placeholders
```bash
grep -r "\[" src/ --include="*.tsx" --include="*.ts" | grep -v "node_modules"
```
- ❌ **Bloqueante:** qualquer `[Nome do Cliente]`, `[Inserir texto]`, `[TODO]`
- Verificar também: "Lorem ipsum", "texto de exemplo", "PREENCHER"

### 1.5 Links e hrefs
```bash
grep -r "href=" src/ --include="*.tsx" | grep -v "node_modules"
```
- [ ] Sem links `href="#"` sem destino real
- [ ] Sem `href="https://example.com"` ou placeholders
- [ ] Número de telefone e email corretos
- [ ] URL do Google Maps correto (se existir)

### 1.6 GA4 — verificar implementação
```bash
grep -r "gtag\|GA4\|MEASUREMENT_ID\|G-" src/ --include="*.tsx" --include="*.html"
```
- [ ] `gtag.js` carregado no `index.html`
- [ ] `VITE_GA4_MEASUREMENT_ID` usado (não hardcoded)
- [ ] `trackPageView` chamado nas rotas (se multi-página)
- [ ] Pelo menos 1 `trackEvent` no CTA principal

### 1.7 Formulário de contacto
```bash
grep -r "formspree\|fetch.*form\|handleSubmit" src/ --include="*.tsx"
```
- [ ] ID do Formspree correto (não de teste/exemplo)
- [ ] Campos obrigatórios têm `required`
- [ ] Estado de loading durante submit
- [ ] Mensagem de sucesso após envio
- [ ] Mensagem de erro se falhar

### 1.8 Responsividade — código
```bash
grep -r "overflow-x" src/ --include="*.tsx"
```
- [ ] `overflow-x-hidden` no `body` ou wrapper principal (evita scroll horizontal)
- [ ] Todas as secções usam `container` com `px-4 sm:px-6 lg:px-8` (ou equivalente)
- [ ] Nenhuma largura fixa acima de `max-w-screen-xl` sem `overflow-hidden`

### 1.9 SEO — meta tags
```bash
grep -r "og:title\|og:description\|meta name=\"description\"" index.html
```
- [ ] `<title>` com nome do negócio e cidade/sector
- [ ] `<meta name="description">` com 150-160 caracteres
- [ ] `<meta property="og:title">` para partilha nas redes
- [ ] `<meta property="og:image">` com imagem 1200×630px
- [ ] `<link rel="canonical">` com URL de produção
- [ ] `lang="pt"` no `<html>`

### 1.10 Favicon
```bash
ls public/favicon* 2>/dev/null || ls src/assets/favicon* 2>/dev/null
```
- [ ] Favicon existe e referenciado no `index.html`
- [ ] Preferir `.svg` ou pelo menos `.png` (não o favicon padrão do Vite)

---

## Fase 2: Checks manuais (browser)

### 2.1 Executar preview local
```bash
npm run preview
```

### 2.2 Lighthouse audit
No Chrome DevTools → Lighthouse:
- [ ] Performance: **> 85** (mobile) / **> 90** (desktop)
- [ ] Accessibility: **> 90**
- [ ] Best Practices: **> 90**
- [ ] SEO: **> 90**

> ⚠️ Se Performance mobile < 85: verificar imagens não otimizadas, JavaScript desnecessário, ou fonts a bloquear render.

### 2.3 Responsividade visual
Testar em DevTools a:
- [ ] **375px** (iPhone SE) — nenhum overflow horizontal
- [ ] **768px** (tablet) — layout intermédio correto
- [ ] **1440px** (desktop) — conteúdo centrado, não demasiado largo

### 2.4 Funcionalidade completa
- [ ] Navbar: todos os links funcionam e navegam para a secção correta
- [ ] Formulário: submeter com dados reais → confirmar email recebido
- [ ] WhatsApp button (se existir): abre conversa com número correto
- [ ] Google Maps embed (se existir): mostra localização correta
- [ ] Animações: funcionam sem glitches no scroll
- [ ] Dark/light mode toggle (se aplicável): alterna corretamente

### 2.5 Cross-browser (mínimo)
- [ ] Chrome (principal)
- [ ] Safari (especialmente em iOS — testar animações e scroll)
- [ ] Firefox

---

## Fase 3: Configuração Vercel

### 3.1 vercel.json (criar se não existir)
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
> Necessário para SPAs com React Router.

### 3.2 Variáveis de ambiente no Vercel
Confirmar que estão definidas no painel do Vercel:
- `VITE_GA4_MEASUREMENT_ID`
- `VITE_FORMSPREE_ID`
- Outras variáveis do projeto

### 3.3 Build settings
- Framework Preset: **Vite**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

---

## Relatório de prontidão

Após verificar todos os items, gerar relatório:

```
╔══════════════════════════════════════════╗
║  DEPLOY CHECK — [Nome do Cliente]        ║
║  Data: [hoje]                            ║
╚══════════════════════════════════════════╝

RESULTADO: ✅ PRONTO PARA DEPLOY / ❌ BLOQUEADO

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHECKS AUTOMÁTICOS
✅ Build sem erros
✅ Variáveis de ambiente configuradas
✅ Sem placeholders no copy
✅ GA4 implementado
✅ Formulário funcional
⚠️  [Aviso: imagens não convertidas para WebP]

CHECKS MANUAIS
✅ Lighthouse Performance: 91 (mobile)
✅ Responsividade: 375px / 768px / 1440px
✅ Formulário testado com email real
⚠️  [Aviso: não testado em Firefox]

PROBLEMAS CRÍTICOS (bloqueantes):
[Nenhum / Lista de problemas ❌]

AVISOS (não bloqueantes):
[Lista de ⚠️ ou "Nenhum"]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRÓXIMO PASSO: 
✅ Executar: vercel --prod
❌ Resolver [X problemas] antes de deploy
```

---

## Regras de bloqueio

**❌ NUNCA fazer deploy se:**
- Build tem erros
- Existem placeholders de texto no código
- Formulário não foi testado com envio real
- GA4 não está a disparar (verificar em GA4 DebugView)
- Performance Lighthouse mobile < 70

**⚠️ Avisar o cliente e documentar se:**
- Performance entre 70-85
- Imagens não estão em WebP
- Não foi testado em Safari/iOS
- Lighthouse Accessibility entre 80-90
