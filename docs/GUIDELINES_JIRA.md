# 🚀 Diretrizes para Criação de Tasks no Jira - Vincis/NexLab

Este documento define o padrão ouro para a criação de tickets no Jira, garantindo que o time de desenvolvimento receba instruções claras, seguras e pragmáticas.

---

## 📋 Template de Task

Sempre que uma nova funcionalidade ou correção for solicitada, a descrição deve seguir esta estrutura:

### 1. Título Padrão
`[TIPO] Nome Curto e Claro da Feature/Bug`
*(Tipos comuns: [FEAT], [FIX], [REFACT], [DOCS], [TEST])*

### 2. Contexto & Objetivo
Explicação concisa do **porquê** essa tarefa é necessária e qual o impacto esperado no sistema ou para o usuário final.

### 3. Guia de Implementação (Instruções Técnicas)
*   **🛠️ Tech Stack:** Tecnologias recomendadas (ex: Bcrypt, Prisma, Supabase, JWT).
*   **🏗️ Arquitetura:** Onde o código deve residir (ex: Middleware, Service Layer, Hooks).
*   **🔒 Segurança & Performance:** Requisitos inegociáveis (ex: Hasheamento Argon2/Bcrypt, Cookies HttpOnly, Rate Limiting, Sanitização de inputs).

### 4. Critérios de Aceite
Lista de critérios de aceitação para considerar a task concluída:
*   [ ] Funcionalidade principal testada e validada.
*   [ ] Código revisado seguindo padrões de segurança.
*   [ ] Variáveis de ambiente configuradas no `.env.example`.
*   [ ] Documentação básica atualizada (se necessário).

---

## 🛠️ Regras Gerais de Escrita (Para o Antigravity)

1.  **Língua:** Sempre gerar o conteúdo em **Português (PT-BR)**.
2.  **Segurança:** Sempre sugerir os padrões mais modernos de mercado (OWASP), a menos que o prazo exija uma simplificação consciente.
3.  **Pragmatismo:** Se o prazo for curto, sugerir ferramentas que acelerem a entrega (ex: Supabase Auth, Clerk) em vez de desenvolvimento manual do zero.
4.  **Clareza:** Evitar termos ambíguos. Ser direto sobre o que se espera receber.
