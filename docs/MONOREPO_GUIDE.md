# 📦 Monorepo Guide

Guia de referência rápida para o monorepo com Lerna + npm workspaces.

## Estrutura

```
meu-projeto/
├── lerna.json
├── package.json
├── apps/
│   ├── web/        (@meu-projeto/web  — Vue 3 + Vite)
│   └── api/        (@meu-projeto/api  — Node.js)
└── packages/       (pacotes compartilhados, se houver)
```

---

## 1. Instalando dependências

Para instalar as dependências de todos os apps e pacotes de uma vez, rode na **raiz** do projeto:

```bash
npm install
```

O npm workspaces resolve tudo automaticamente e cria um único `node_modules/` compartilhado na raiz.

Se precisar reinstalar do zero (por exemplo, após renomear pastas ou resolver conflitos):

```bash
rm -rf node_modules
npm install
```

---

## 2. Rodando os apps

### Front-end (web) isolado

```bash
npx lerna run dev --scope=@meu-projeto/web
```

### Back-end (api) isolado

```bash
npx lerna run dev --scope=@meu-projeto/api
```

### Front e Back em paralelo

```bash
npx lerna run dev --parallel
```

Ou pelo script da raiz, se estiver configurado no `package.json` raiz:

```bash
npm run dev
```

### Build de todos os apps

```bash
npx lerna run build
```

---

## 3. Regras para commits

O objetivo é deixar claro no histórico qual parte do projeto foi alterada. Use o seguinte padrão:

```
<tipo>(<escopo>): <descrição curta>
```

### Escopos

| Escopo      | Quando usar                              |
|-------------|------------------------------------------|
| `web`       | Alterações em `apps/web`                 |
| `api`       | Alterações em `apps/api`                 |
| `packages`  | Alterações em pacotes compartilhados     |
| `root`      | Alterações na raiz (lerna.json, scripts) |

### Tipos comuns

| Tipo       | Quando usar                              |
|------------|------------------------------------------|
| `feat`     | Nova funcionalidade                      |
| `fix`      | Correção de bug                          |
| `chore`    | Configuração, dependências, build        |
| `refactor` | Refatoração sem mudança de comportamento |
| `docs`     | Documentação                             |

### Exemplos

```bash
feat(web): adiciona página de login
fix(api): corrige rota de autenticação
chore(root): atualiza versão do lerna
refactor(packages): extrai utilitários de data
```

---

## 4. Adicionando dependências

### Em um app específico

```bash
# Apenas no web
npm install axios --workspace=@meu-projeto/web

# Apenas na api
npm install express --workspace=@meu-projeto/api

# Dependência de dev em um app específico
npm install -D vitest --workspace=@meu-projeto/web
```

### Na raiz (compartilhada entre todos)

```bash
npm install -D typescript -w .
```

### Referenciar um pacote interno (apps se comunicando)

Se o `web` precisar importar algo da `api` ou de um pacote em `/packages`:

```bash
npm install @meu-projeto/api --workspace=@meu-projeto/web
```

E importe normalmente no código:

```ts
import { algo } from '@meu-projeto/api'
```

---

## Dicas rápidas

```bash
# Ver todos os pacotes reconhecidos pelo Lerna
npx lerna list

# Limpar node_modules de todos os pacotes
npx lerna clean

# Rodar um script só em apps que tiveram alterações (útil em CI)
npx lerna run build --since=main
```
