# Vincis — Guia Definitivo de Código

Fonte única de verdade para humanos e IAs que escrevem código no Vincis-App.
Tudo aqui é regra. Se algo não estiver aqui, peça antes de inventar.

> **Documentos complementares (não duplicam este):**
> - [REQUISITOS.md](./REQUISITOS.md) — o que o produto deve fazer (escopo).
> - [TASK_GUIDE.md](./TASK_GUIDE.md) e [GUIDELINES_JIRA.md](./GUIDELINES_JIRA.md) — como abrir tasks no Jira.
> - [MONOREPO_GUIDE.md](./MONOREPO_GUIDE.md) — comandos `npm`/`lerna` no monorepo.

---

## 1. Stack

| Camada      | Tecnologia                                                       |
|-------------|------------------------------------------------------------------|
| Monorepo    | npm workspaces + Lerna (`apps/web`, `apps/api`, `packages/*`)    |
| Runtime     | Node.js ≥ 22 LTS                                                 |
| Backend     | Express 5 + TypeScript + Prisma (PostgreSQL) + Zod               |
| Frontend    | Vue 3 (`<script setup lang="ts">`) + Vite 8 + Vue Router         |
| Estilo      | Tailwind CSS **v4** (`@import "tailwindcss"`, sem `tailwind.config.js`) |
| UI          | PrimeVue v4 (preset Aura customizado em `vincis-primevue-theme.ts`) |
| Estado      | Pinia (local persistente) + TanStack Vue Query (dados da API)    |
| HTTP        | Axios via `src/lib/axios.ts`                                     |

---

## 2. Backend (`apps/api`)

### 2.1 Estrutura obrigatória de feature

```
src/features/<feature>/
├── <feature>.routes.ts      # Router Express + middlewares
├── <feature>.schema.ts      # Schemas Zod + tipos inferidos
├── <feature>.controller.ts  # HTTP: extrai req, chama service, retorna res
└── <feature>.service.ts     # Regra de negócio + Prisma
```

### 2.2 Responsabilidade de cada camada

| Arquivo        | Pode                                                       | Não pode                                |
|----------------|------------------------------------------------------------|-----------------------------------------|
| `*.routes.ts`  | Declarar rotas, aplicar `requireAuth`, `validateRequest`   | Lógica de negócio ou Prisma             |
| `*.schema.ts`  | Definir Zod schemas e exportar tipos via `z.infer<...>`    | Importar do Express ou do banco         |
| `*.controller.ts` | Ler `req.body/params/query/dbUser/studyPlan`, chamar service, formatar JSON, `try/catch` obrigatório | Tocar no Prisma diretamente |
| `*.service.ts` | Prisma + regras de domínio                                 | Conhecer `req`/`res` ou Express         |

### 2.3 Middlewares de contexto

- `requireAuth` — valida token, injeta `req.dbUser`.
- `injectStudyPlan` — lê cookie `study_plan_id`, injeta `req.studyPlan` (sem bloquear).
- `requireStudyPlan` — bloqueia se não houver plano ativo. **Use** em rotas de disciplinas, tópicos, caderno de erros.

### 2.4 Prisma

- Toda mudança de banco passa por `schema.prisma` + `npx prisma migrate dev`.
- Relações hierárquicas (Plano → Disciplina → Tópico) **devem** ter `onDelete: Cascade`.
- Nunca instanciar `PrismaClient` localmente; importar de `src/lib/prisma.ts`.

### 2.5 Erros

- `try/catch` em **todo** controller.
- Resposta de erro genérica: `{ message: "..." }` com status 4xx/5xx apropriado.
- Mensagens em **português**, voltadas ao usuário final.

---

## 3. Frontend (`apps/web`)

### 3.1 As regras críticas (leia antes de tocar em estilo)

Estas existem porque já quebraram o app uma vez. Não repita.

1. **NUNCA reimplementar utilitárias do Tailwind dentro do preset PrimeVue.**
   O bloco `css:` em `vincis-primevue-theme.ts` deve conter **apenas** custom properties (`:root { --x: ... }`). Nada de `.grid-cols-*`, `.gap-*`, `.mb-*`, `.text-*`. Esse CSS sai unlayered e vence o Tailwind (que vive em `@layer utilities`), quebrando silenciosamente `md:grid-cols-12`, `lg:flex`, etc.

2. **`cssLayer` do PrimeVue sempre ligado, nesta ordem:**
   ```ts
   cssLayer: { name: 'primevue', order: 'theme, base, primevue, components, utilities' }
   ```
   `cssLayer: false` é proibido. Garante que utility do Tailwind sempre vence override em componente PrimeVue.

3. **Não existe `tailwind.config.js`.** Tailwind v4 lê config via `@theme` em CSS. Se aparecer `tailwind.config.js`, apague.

4. **Cores arbitrárias `bg-[#hex]` / `text-[#hex]` são proibidas em templates Vue.** Use sempre o token semântico. Se o token faltar, adicione em `@theme`, não em arbitrary.

### 3.2 Estrutura de pastas

```
apps/web/src/
├── components/
│   ├── ui/              # Design system (Ds*.vue, exportados como V*)
│   ├── features/<dom>/  # Componentes acoplados a um domínio (ex: disciplines/)
│   └── layout/          # AppSidebar e outros chrome de app
├── views/               # Telas (rotas) — apenas orquestram componentes
├── layouts/             # AppLayout.vue (sidebar + slot)
├── stores/              # Pinia stores
├── hooks/               # useXxxQuery / useXxxMutation (Vue Query)
├── lib/                 # axios, helpers
├── router/index.ts
├── global.css           # @theme + reset mínimo
├── vincis-primevue-theme.ts
└── main.ts
```

### 3.3 Design tokens — fonte única

- **Onde declarar:** [global.css](../apps/web/src/global.css) dentro de `@theme { --color-... }`.
- **Como usar:** Tailwind gera utilities automaticamente: `bg-primary`, `text-on-surface`, `border-outline-variant`, `bg-surface-container-low`, etc.
- **Aliases `:root`:** existem só para o PrimeVue e componentes que precisam de `var(--x)` fora do Tailwind. Sempre apontam para o `@theme`.
- **Tokens existentes** (não duplicar — adicione novos no mesmo lugar):

  | Categoria   | Tokens                                                          |
  |-------------|-----------------------------------------------------------------|
  | Primary     | `primary`, `primary-container`, `primary-hover`, `primary-light`, `on-primary`, `on-primary-container` |
  | Secondary   | `secondary`, `secondary-container`, `on-secondary`, `on-secondary-container` |
  | Tertiary    | `tertiary`, `tertiary-container`                                |
  | Surface     | `background`, `surface`, `surface-container-lowest..highest`, `surface-dark`, `surface-dark-elevated` |
  | Foreground  | `on-surface`, `on-surface-variant`, `on-surface-muted`          |
  | Outline     | `outline`, `outline-variant`                                    |
  | Status      | `error`, `error-container`, `success`, `success-container`, `warning`, `warning-container` |
  | Tipografia  | `font-family-serif` (Newsreader), `font-family-sans` (Manrope)  |

### 3.4 Componentes UI

- **Arquivo:** `components/ui/Ds<Nome>.vue` (prefixo `Ds` no arquivo, sempre).
- **Export:** sempre via barrel [components/ui/index.ts](../apps/web/src/components/ui/index.ts) como `V<Nome>`.
- **Import:** `import { V<Nome> } from '@/components/ui'`. Nunca importar `Ds<Nome>.vue` direto fora de `index.ts`.
- **Reaproveitar PrimeVue:** prefira embrulhar `Card`, `Button`, `Tag`, `Menu` do PrimeVue dentro de `Ds*.vue` em vez de recriar HTML.

### 3.5 Views = orquestradoras (regra de ouro)

- View renderiza **layout macro + chamada de componentes**. Não desenha card/lista/grid complexo com 30 utilitárias inline.
- Se uma View ultrapassar ~150 linhas de template ou repetir blocos visuais, **extrair para `Ds*.vue` ou `components/features/`**.
- Ex.: dashboard usa `<VDiagnosticCard />`, `<VCardStat />`, `<VActivityItem />` — não HTML cru.

### 3.6 Estado

| Tipo de dado                                         | Onde mora                          |
|------------------------------------------------------|------------------------------------|
| Usuário logado, plano ativo, prefs locais persistidas| **Pinia** em `stores/` (`persist: true`) |
| Qualquer coisa que vem da API (queries, mutations)   | **Vue Query** em `hooks/useXxx.ts` |
| State efêmero de tela (form em digitação, modal)     | `ref()` / `reactive()` local       |

- **Proibido:** chamar `api.get/post` diretamente de uma View. Sempre via hook de Vue Query.
- **Chave de query:** array, com IDs explícitos: `['disciplines', planId]` — nunca string solta.
- **Invalidação:** mutations devem invalidar queries afetadas (`queryClient.invalidateQueries({ queryKey: ['disciplines', planId] })`).

### 3.7 Roteamento

- Rotas autenticadas vivem como filhas de `/private` em [router/index.ts](../apps/web/src/router/index.ts), com `meta: { requiresAuth: true }`.
- Layout `AppLayout` é aplicado automaticamente via component da rota pai.
- Guard global em `router.beforeEach` redireciona `/private/*` → `/auth` se `!authStore.isAuthenticated`.

### 3.8 Tipografia

- `font-serif` (Newsreader) — títulos, manchetes, valores em destaque.
- `font-sans` (Manrope) — UI, menus, corpo. É o default do `<body>`.
- Sem outras fontes. Sem `font-family` inline.

### 3.9 Ícones

- **PrimeIcons** (`<i class="pi pi-name" />`) — usado por padrão em UI/menus.
- **Material Symbols Outlined** — permitido em pontos icônicos específicos (`<span class="material-symbols-outlined">name</span>`).
- Não misture os dois no mesmo componente.

### 3.10 Animações

- Transição entre rotas já vem por `<transition name="page-fade">` em `AppLayout`.
- Para micro-animações em hover/click, use utilities do Tailwind (`transition-all`, `hover:scale-105`, `active:scale-95`).
- Não declarar `@keyframes` próprios sem necessidade — `animate-pulse`, `animate-bounce`, `animate-spin` já vêm do Tailwind.

---

## 4. Como adicionar uma feature de ponta a ponta

### Backend
1. Criar `apps/api/src/features/<feature>/` com os 4 arquivos da §2.1.
2. Editar `schema.prisma` se houver entidade nova → `npx prisma migrate dev --name add_<feature>`.
3. Registrar o `featureRouter` no `app.ts`/`server.ts` raiz.
4. Anotar `requireAuth` + (se aplicável) `requireStudyPlan` nas rotas privadas.

### Frontend
1. **View** — criar `apps/web/src/views/<Nome>View.vue` enxuta, só orquestrando componentes.
2. **Rota** — adicionar como filha de `/private` em `router/index.ts`.
3. **Sidebar** — adicionar item em `AppSidebar.vue` (array `navItems`).
4. **Hooks** — criar `hooks/use<Feature>.ts` com `useQuery`/`useMutation` consumindo `api`.
5. **Componentes** — para qualquer bloco visual reutilizável, criar `Ds<Nome>.vue` em `components/ui/` e exportar como `V<Nome>` no barrel.

---

## 5. Anti-padrões — não faça

| ❌ Não faça                                                | ✅ Faça em vez                                          |
|------------------------------------------------------------|---------------------------------------------------------|
| Reimplementar `.grid-cols-*` no preset PrimeVue            | Confiar no Tailwind                                     |
| `cssLayer: false` no PrimeVue                              | `cssLayer: { name: 'primevue', order: '...' }`          |
| `bg-[#fdf9f6]`, `text-[#1C1C1A]` em template               | `bg-background`, `text-on-surface`                      |
| `tailwind.config.js`                                       | `@theme` em `global.css`                                |
| `api.get(...)` direto na View                              | Hook `useXxxQuery()` em `hooks/`                        |
| Importar `DsCard.vue` direto numa View                     | `import { VCard } from '@/components/ui'`               |
| 200 linhas de template numa View                           | Extrair para `Ds<Nome>.vue` ou `components/features/`   |
| Lógica de banco no controller                              | Mover para o service                                    |
| `PrismaClient` instanciado ad-hoc                          | Importar `prisma` de `lib/prisma.ts`                    |
| Commit em `main` direto                                    | Branch `feat/...`, `fix/...`, `refactor/...`            |

---

## 6. Git e commits

- **Branches:** `feat/<nome>`, `fix/<nome>`, `refactor/<nome>`, `chore/<nome>`, `docs/<nome>`.
- **Formato de commit:** `<tipo>(<escopo>): <descrição curta>` em português.
  - Escopos: `web`, `api`, `packages`, `root`.
  - Tipos: `feat`, `fix`, `refactor`, `chore`, `docs`.
- **Exemplos:**
  - `feat(web): adiciona card de estatística no dashboard`
  - `fix(api): corrige cascade do tópico ao deletar disciplina`
  - `refactor(web): consolida tokens de cor em @theme`

---

## 7. Setup local rápido

```bash
nvm use 22                  # Node ≥ 22 obrigatório
rm -rf node_modules         # se vier de outra versão de Node
npm install                 # raiz — workspaces resolvem tudo
cd apps/api && npx prisma generate && cd ../..
npm run dev                 # web + api em paralelo
```

Front em `http://localhost:5174`, API em `http://localhost:3000` (ver `.env`).

---

## 8. Checklist antes de abrir PR

- [ ] Backend: cada camada respeita sua responsabilidade (§2.2).
- [ ] Backend: `try/catch` em todo controller. Migration do Prisma criada e commitada.
- [ ] Frontend: zero `bg-[#hex]`/`text-[#hex]` no diff (`grep -rE 'bg-\[#|text-\[#' apps/web/src`).
- [ ] Frontend: nenhuma chamada `api.*` direto em `views/`.
- [ ] Frontend: novos componentes exportados via `components/ui/index.ts` como `V*`.
- [ ] Frontend: tokens novos adicionados em `@theme` (não em `:root` solto, não em arbitrary).
- [ ] Layout testado em viewport `md` (≥ 768px) e mobile.
- [ ] Sem console error/warning em runtime.
- [ ] Commit segue formato `<tipo>(<escopo>): ...`.
