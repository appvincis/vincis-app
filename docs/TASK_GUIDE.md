# 📝 Guia de Criação de Tasks (Jira)

Este guia define o padrão esperado para a criação de tarefas no Jira, garantindo que o time tenha clareza técnica e objetivos bem definidos.

---

## 1. Título da Task

Siga o padrão definido no `MONOREPO_GUIDE.md` para facilitar o rastreio com os commits:

**Padrão:** `[TIPO]: <descrição curta>`

**Exemplos:**
- `[FEAT] feat(web): implementação de autenticação e cadastro`
- `[FIX] fix(api): correção de vazamento de memória no cache`
- `[REFACTOR] refactor(web): migração de componentes UI para PrimeVue`

---

## 2. Estrutura da Descrição

Toda task deve conter as seguintes seções:

### 1. Contexto & Objetivo
Explicação breve do *porquê* essa task é necessária e qual o impacto esperado no produto.
- *Ex: "Permitir que novos usuários se cadastrem garantindo a proteção de identidade."*

### 2. Guia de Implementação (Instruções Técnicas)
Detalhamento técnico para guiar o desenvolvedor.

*   **🛠️ Tech Stack:** Definição das ferramentas recomendadas (ex: Supabase Auth, Zod, PrimeVue).
*   **🏗️ Arquitetura:** Onde o código deve ser criado (pastas, rotas, middlewares).
*   **🔒 Segurança & Performance:** Requisitos críticos (ex: HttpOnly Cookies, hashing de senhas, validação de inputs).

### 3. Critérios de Aceite
Pontos verificáveis para considerar a tarefa como concluída (Done).
- [ ] O usuário consegue realizar X.
- [ ] O sistema retorna erro Y em caso de falha.
- [ ] Não há exposição de segredos no código.

---

## 3. Template para Copiar (Markdown)

```markdown
## 1. Contexto & Objetivo
[Descreva aqui o propósito da tarefa]

## 2. Guia de Implementação (Instruções Técnicas)

*   **🛠️ Tech Stack:**
    *   [Ferramenta 1]
    *   [Ferramenta 2]

*   **🏗️ Arquitetura:**
    *   [Caminhos de pastas/arquivos]
    *   [Lógica principal]

*   **🔒 Segurança & Performance:**
    *   [Constraint 1]
    *   [Constraint 2]

## 3. Critérios de Aceite
- [ ] [Critério 1]
- [ ] [Critério 2]
```
