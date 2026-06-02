# Especificações do Software — Vincis

Este documento constitui a especificação oficial de software do **Vincis**, servindo como referência estrutural e funcional tanto para a equipe de engenharia quanto para os stakeholders. O Vincis é concebido como uma plataforma SaaS para otimização e controle analítico de estudos focados em concursos públicos.

---

## 1. Arquitetura e Engenharia de Software

O ecossistema Vincis é projetado sobre uma arquitetura de monorepo distribuída para garantir isolamento de responsabilidades, alta velocidade de desenvolvimento e facilidade de deploy.

### Estrutura Geral do Monorepo
* **Tecnologia de Orquestração:** npm workspaces + Lerna v9.
* **Frontend (`apps/web`):** Single Page Application (SPA) construída em Vue 3 (Composition API / `<script setup lang="ts">`) e Vite 8.
* **Backend (`apps/api`):** API RESTful desenvolvida em Node.js (≥ 22 LTS) com Express 5 e TypeScript.
* **Banco de Dados & ORM:** PostgreSQL gerenciado via Prisma Client.
* **Serviços Externos de Infraestrutura:** Supabase Client para autenticação de borda e gerenciamento de arquivos físicos (upload de editais).

---

## 2. Módulos de Software e Regras de Negócio

### 2.1 Gestão de Planos de Estudo (Isolamento Multitenant)
* **Visão de Negócio:** Permite que o estudante gerencie múltiplos editais simultaneamente (ex: "Polícia Federal" e "ABIN") de forma isolada, sem sobreposição de agendas ou conteúdos.
* **Comportamento Técnico:** 
  - O sistema usa a coluna `studyPlanId` como chave lógica de isolamento de dados.
  - O frontend armazena o plano de estudo selecionado na store reativa do **Pinia** (persistida localmente) e o injeta nos cabeçalhos e cookies das requisições.
  - O backend aplica o middleware `requireStudyPlan` para injetar automaticamente o contexto `req.studyPlan`, validando que todas as rotas filhas de disciplinas, tópicos e caderno de erros executem consultas filtradas por esse plano.

### 2.2 Estrutura Curricular (Disciplinas, Assuntos e Tópicos)
* **Visão de Negócio:** Mapeia de forma granular e ponderada o edital de cada concurso.
* **Comportamento Técnico:**
  - **Disciplinas (Discipline):** Cadastro de disciplinas contendo uma cor de identificação visual e um peso de relevância (`weight`, float). O peso define a carga horária prioritária no planejador de ciclos.
  - **Tópicos (Topic):** Unidade atômica do edital. Rastreia o progresso através do booleano `isCompleted`. A eliminação de entidades superiores (ex: Disciplina) remove automaticamente os tópicos relacionados (`onDelete: Cascade`).

### 2.3 Importador Inteligente de Editais (Processamento com IA)
* **Visão de Negócio:** Automatiza o cadastro estruturado de editais complexos em poucos segundos a partir de texto copiado ou arquivos.
* **Comportamento Técnico:**
  - Integração com IA através de um **SDK de Gerenciamento de IA** interno do backend.
  - O SDK centraliza prompts, gerencia o controle e monitoramento de uso de tokens, implementa cache de respostas recorrentes e abstrai o modelo de linguagem, permitindo que a API troque de provedor de LLM sem quebrar as rotas do aplicativo.
  - O retorno estruturado é processado e mapeado em lote para o banco de dados.

### 2.4 Módulo de Foco e Timer Integrado
* **Visão de Negócio:** Condução e cronometragem de sessões de estudo ativo de forma integrada e sem atrito.
* **Comportamento Técnico:**
  - **Modos do Timer:** Pomodoro clássico (25min estudo / 5min pausa) e contagem regressiva/progressiva configurável.
  - O timer é vinculado diretamente a uma chave de `Topic`. Ao finalizar, o frontend notifica a API para persistir a sessão de foco, computando as horas líquidas e atualizando o status do tópico.

### 2.5 Caderno de Erros Estruturado
* **Visão de Negócio:** Aplicação do método de estudo reverso, registrando e classificando falhas para revisões preventivas.
* **Comportamento Técnico:**
  - Modelo `ErrorLog` associando a descrição/análise do erro, a correção ideal ("pulo do gato"), a fonte da questão e a categorização do diagnóstico de erro.
  - Permite filtragem avançada por disciplina, assunto ou status de resolução (`isResolved`).

### 2.6 Dashboard Central de Desempenho
* **Visão de Negócio:** Análise visual consolidada da evolução acadêmica e do andamento do cronograma.
* **Comportamento Técnico:**
  - Agrupamento analítico executado pelo backend a nível de banco de dados para evitar gargalos em múltiplas requisições.
  - Renderização no frontend utilizando **PrimeVue v4** acoplado ao **Chart.js** para exibição de gráficos de progresso por matéria, gráficos de barras de horas líquidas diárias e curva de aproveitamento em simulados.

---

## 3. Diretrizes de Desenvolvimento e Manutenibilidade

Para manter o software performático e livre de débitos técnicos, todas as modificações devem cumprir os seguintes padrões:

### 3.1 Padrões de API e Backend (`apps/api`)
1. **Padrão de Feature:** Cada funcionalidade deve ficar isolada em sua pasta sob `src/features/<feature>/` contendo:
   - `<feature>.routes.ts`: Roteamento e middlewares.
   - `<feature>.schema.ts`: Schemas de validação de dados com **Zod**.
   - `<feature>.controller.ts`: Lógica HTTP e captura de erros obrigatória com `try/catch`.
   - `<feature>.service.ts`: Único local autorizado a se comunicar com o banco via Prisma.
2. **Mensagens:** Todos os retornos de erro HTTP devem ser amigáveis e escritos em português.

### 3.2 Padrões de Interface e Estilo (`apps/web`)
1. **Design Tokens:** Declarados no `@theme` em `global.css`. Uso estrito de aliases semânticas do Tailwind CSS v4. Cores arbitrárias em código inline (`bg-[#hex]`) são expressamente proibidas.
2. **PrimeVue Layering:** Componentes PrimeVue devem operar em modo `cssLayer` ordenado para garantir que classes utilitárias do Tailwind prevaleçam nos estilos.
3. **Componentização de Telas (Views):** As views apenas orquestram componentes macros e rotas. Telas com mais de 150 linhas de código devem ter subcomponentes extraídos para `components/ui/` (expostos com prefixo `V` no index/barrel) ou `components/features/`.
4. **Gerenciamento de Requisições:** Consumo de APIs obrigatoriamente controlado pelo **TanStack Vue Query** por meio de custom hooks. Chamadas diretas do Axios de dentro de componentes ou views são proibidas.
