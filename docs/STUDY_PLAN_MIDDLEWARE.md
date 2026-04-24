# Guia de Uso: Middlewares de Plano de Estudo

Toda rota que depende de um plano de estudo deve utilizar os middlewares definidos em `study-plan.middleware.ts`. Existem dois middlewares com responsabilidades distintas:

| Middleware | Obrigatoriedade | Comportamento se sem cookie |
|---|---|---|
| `injectStudyPlan` | Opcional | Injeta `null` e continua |
| `requireStudyPlan` | Obrigatório | Retorna `400` e interrompe |

---

## `injectStudyPlan`

Lê o cookie `study_plan_id`, valida se o plano pertence ao usuário autenticado, e injeta o objeto `studyPlan` na requisição.

### Comportamento

- **Sem cookie:** injeta `req.studyPlan = null` e passa para o próximo handler
- **Cookie presente, plano não encontrado:** retorna `404`
- **Cookie presente, plano válido:** injeta `req.studyPlan` com o objeto completo do Prisma e passa para o próximo handler

### Quando usar

Use `injectStudyPlan` em rotas onde o plano de estudo é **opcional** — ou seja, o handler consegue responder mesmo sem um plano selecionado, geralmente retornando um aviso ao frontend.

```ts
// GET /subjects — exibe aviso se não houver plano
subjectRouter.get('/', requireAuth, injectStudyPlan, getSubjects)
```

```ts
// No controller, você verifica manualmente:
if (!req.studyPlan) {
    return res.status(200).json({
        message: 'Nenhum plano de estudo selecionado.',
        subjects: []
    })
}
```

---

## `requireStudyPlan`

Verifica se `req.studyPlan` foi injetado. Deve ser usado **sempre após** `injectStudyPlan`.

### Comportamento

- **`req.studyPlan` é `null`:** retorna `400` e interrompe a requisição
- **`req.studyPlan` válido:** passa para o próximo handler

### Quando usar

Use `requireStudyPlan` em rotas onde o plano de estudo é **obrigatório** — ou seja, a operação não faz sentido sem um plano selecionado.

```ts
// POST /subjects — criar matéria exige um plano
subjectRouter.post('/', requireAuth, injectStudyPlan, requireStudyPlan, createSubject)
```

---

## Regra prática

```
Rota de leitura que pode funcionar sem plano? → injectStudyPlan
Rota de escrita ou que depende do plano?      → injectStudyPlan + requireStudyPlan
```

### Exemplos comparativos

```ts
// ✅ leitura opcional — mostra aviso se não houver plano
router.get('/subjects', requireAuth, injectStudyPlan, getSubjects)

// ✅ escrita obrigatória — falha antes de chegar no controller
router.post('/subjects', requireAuth, injectStudyPlan, requireStudyPlan, createSubject)

// ❌ errado — requireStudyPlan sem injectStudyPlan nunca terá req.studyPlan
router.post('/subjects', requireAuth, requireStudyPlan, createSubject)
```

---

## Como o cookie é definido

O cookie `study_plan_id` é gerado pelo backend quando o usuário seleciona um plano via:

```
POST /study-plans/select
Body: { studyPlanId: 42 }
```

O backend valida que o plano pertence ao usuário e então define o cookie:

```ts
res.cookie('study_plan_id', studyPlanId, {
    httpOnly: true,             // JS não consegue ler
    sameSite: 'lax',            // proteção CSRF
    secure: process.env.NODE_ENV === 'production', // HTTPS apenas em produção
})
```

A partir desse momento, o cookie é enviado automaticamente em todas as requisições até que o usuário selecione outro plano ou faça logout.

---

## Encadeamento completo

```
Requisição chega
    → requireAuth        valida o token e injeta req.user e req.dbUser
    → injectStudyPlan    lê o cookie, busca o plano no banco, injeta req.studyPlan (ou null)
    → requireStudyPlan   (opcional) garante que req.studyPlan não é null
    → controller         acessa req.studyPlan com segurança
```
