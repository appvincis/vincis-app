# Guia de Uso: `req.user` vs `req.dbUser`

Toda requisição autenticada passa pelo middleware `requireAuth`, que injeta dois objetos diferentes na requisição:

| Propriedade | Tipo | Origem |
|---|---|---|
| `req.user` | `User` (Supabase) | `@supabase/supabase-js` |
| `req.dbUser` | `User` (Prisma) | `@prisma/client` |

---

## `req.user` — Usuário do Supabase

Representa o usuário autenticado dentro do sistema de autenticação do Supabase.

### Principais campos

```ts
req.user.id          // UUID do Supabase (string) — ex: "a1b2c3d4-..."
req.user.email       // E-mail do usuário
req.user.created_at  // Data de criação da conta no Supabase
```

### Quando usar

Use `req.user` apenas quando precisar de informações específicas da **autenticação**, como:

- Buscar o usuário no banco local pelo `supabaseId` (como o próprio `requireAuth` faz)
- Acessar o e-mail diretamente do token, sem consultar o banco

> **Na prática, raramente você vai usar `req.user` diretamente nos controllers.**

---

## `req.dbUser` — Usuário da Aplicação (Prisma)

Representa o registro do usuário na **base de dados local** da aplicação, gerenciado pelo Prisma.

### Principais campos

```ts
req.dbUser.id          // ID numérico do banco (number) — ex: 42
req.dbUser.name        // Nome do usuário
req.dbUser.email       // E-mail
req.dbUser.supabaseId  // UUID do Supabase vinculado a esse registro
```

### Quando usar

Use `req.dbUser` na **grande maioria dos controllers e middlewares**, sempre que precisar:

- Filtrar registros por dono (`userId`)
- Criar registros vinculados ao usuário
- Verificar permissões de acesso a um recurso

```ts
// ✅ correto — usar dbUser.id para operações no banco
const userId = req.dbUser!.id
const studyPlans = await studyPlanService.getStudyPlans(userId)
```

---

## Regra prática

```
Está fazendo uma query no banco? → req.dbUser.id
Está lidando com autenticação/sessão? → req.user.id
```

### Exemplo comparativo

```ts
// ❌ errado — req.user.id é um UUID string, não o ID numérico do banco
const studyPlan = await studyPlanService.getStudyPlanById(planId, req.user!.id)

// ✅ correto — req.dbUser.id é o ID numérico esperado pelo Prisma
const studyPlan = await studyPlanService.getStudyPlanById(planId, req.dbUser!.id)
```

---

## Como o middleware popula esses valores

```
Requisição chega
    → requireAuth lê o cookie access_token
    → valida o token com Supabase → popula req.user
    → busca o usuário no banco pelo supabaseId → popula req.dbUser
    → chama next()
```

Ambos os valores só estão disponíveis **após** o middleware `requireAuth`. Nunca acesse `req.user` ou `req.dbUser` em rotas não protegidas.
