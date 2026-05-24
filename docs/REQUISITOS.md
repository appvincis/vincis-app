# Requisitos do Sistema — Vincis

## Metadados do Documento

| Campo             | Valor                          |
|-------------------|--------------------------------|
| **Autor**         | Pedro Henrique Galvão          |
| **Status**        | RASCUNHO                       |
| **Data prevista** | 15 de maio de 2026             |
| **Equipe**        | ISN Engineering LTD (Pedro Henrique Galvão, Arthur Lage, Igor Peixoto, João Paulo Cruz de Faria, William Leão) |

---

## 1. Visão Geral

O documento orienta o desenvolvimento do **Vincis**, alinhando a equipe sobre o escopo de entrega da primeira versão.

- **v1.0 — deadline:** 15 de maio de 2026
- **Apresentações:** a partir de 17 de junho de 2026
- **Margem de correção e preparação:** ~1 mês entre entrega e apresentação

---

## 2. Requisitos Funcionais

### 2.1 Registro e Login de Usuários

**História do usuário:**
> Um usuário deve conseguir se registrar e posteriormente fazer login na sua conta.

**Notas técnicas:**
- Autenticação via **JWT** com expiração configurada
- Senhas **hasheadas**
- Implementar **authMiddleware** para controle de acesso às rotas

---

### 2.2 Processo de Onboarding

**História do usuário:**
> O usuário, ao entrar na plataforma pela primeira vez, se depara com um processo dinâmico e chamativo de onboarding, apresentando a plataforma e suas principais funcionalidades.

**Notas técnicas:**
- Processo em **etapas**
- Uso de **animações e interações** com funcionalidades principais

---

### 2.3 Página Inicial (Dashboard / Layout Principal)

**História do usuário:**
> Após o onboarding, o usuário visualiza o painel principal ao centro da tela e uma sidebar retrátil à esquerda, com foto e nome do usuário no rodapé. Ao clicar em si mesmo, acessa perfil, dados pessoais e opção de deslogar.

**Notas técnicas:**
- Definir arquitetura do `App.vue` como container principal
- Sidebar retrátil renderizada junto às demais páginas
- Estrutura base para receber os demais módulos

---

### 2.4 Gestão de Planos de Estudo (Contextos Isolados)

**História do usuário:**
> Como estudante que se prepara para múltiplos concursos simultaneamente, quero criar e alternar entre diferentes "Planos de Estudo" dentro da mesma conta, para que materiais, editais e cronogramas de cada concurso fiquem completamente isolados e organizados.

**Notas técnicas:**
- Criar tabela dedicada para planos de estudo no banco de dados
- O `plano_estudo_id` deve ser **injetado automaticamente** em todas as requisições relevantes para evitar erros de contexto

---

### 2.5 Módulo de Disciplinas, Assuntos e Tópicos

**História do usuário:**
> Como estudante sobrecarregado com editais extensos, quero cadastrar disciplinas com pesos e cores personalizadas e poder colar o texto do edital para que o sistema crie automaticamente a estrutura de assuntos e tópicos, economizando tempo de planejamento.

**Notas técnicas:**
- CRUD completo de **Disciplinas** (com cor e peso)
- CRUD de **Assuntos** e **Tópicos**
- Extração automática de assuntos/tópicos via **IA** a partir do texto do edital
- ⚠️ Funcionalidade consome tokens — deve ser **mapeada e monitorada**

---

### 2.6 Planejador Automático de Ciclos de Estudo

**História do usuário:**
> Como estudante, quero informar minha disponibilidade semanal e metas diárias para que o sistema distribua automaticamente meus tópicos pendentes de forma inteligente e equilibrada.

**Notas técnicas:**
- Usuário define: dias da semana, carga horária diária e data-alvo (opcional)
- **Algoritmo de distribuição:** baseado no Peso (1–5) da disciplina × quantidade de tópicos pendentes
- **Agendamento dinâmico:** se o usuário pular um dia, o tópico é "empurrado" para a próxima sessão disponível

---

### 2.7 Módulo de Execução e Foco (Timer Integrado)

**História do usuário:**
> Como estudante, quero iniciar uma sessão de estudo para um tópico específico usando cronômetro ou Pomodoro, para que o sistema registre meu tempo real de estudo e atualize meu progresso automaticamente.

**Notas técnicas:**
- **Modos disponíveis:**
  - Pomodoro (ciclos de 25 min estudo / 5 min pausa)
  - Tempo Definido (contagem progressiva ou regressiva)
- Timer vinculado a um **Tópico** do planejamento
- Ao finalizar, status do tópico muda para `Concluído` ou `Em Revisão`
- Interface **minimalista** com: Play / Pause / Stop + barra de progresso visual
- **Efeito sonoro configurável**
- Tela de **histórico de sessões**
- Permitir **cadastro manual** de sessão realizada fora do modo foco

---

### 2.8 Tutor IA

> *(Módulo a ser detalhado — mencionado como requisito)*

---

### 2.9 Caderno de Erros

**História do usuário:**
> Como estudante, quero registrar questões que errei ou tive dúvida, categorizando-as por tópico, para que eu possa revisar especificamente meus pontos fracos e não repetir os mesmos erros.

---

### 2.10 Histórico e Resultado de Simulados

**História do usuário:**
> Como estudante, quero registrar meu desempenho em simulados completos, detalhando acertos e erros por disciplina, para acompanhar minha evolução percentual e identificar quais matérias precisam de mais atenção.

**Notas técnicas:**
- Cadastro de simulado: Nome/Instituição, Data, Total de Acertos, Erros e Brancos (por disciplina)
- Cálculo automático de **percentual de aproveitamento** (geral e por matéria)
- Visualização em **gráfico de linha (Trend Chart)** para acompanhar evolução ao longo do tempo

---

### 2.11 Dashboard Central de Desempenho

**História do usuário:**
> Como estudante, quero visualizar um resumo gráfico do meu progresso total, horas estudadas e desempenho em simulados, para ter uma visão clara da minha evolução e manter a motivação.

**Notas técnicas:**
- **KPIs exibidos:**
  - Total de horas estudadas (dia/semana)
  - % de progresso do edital
  - Média de acertos em simulados
- **Visualizações:**
  - Gráfico de rosca — progresso por matéria
  - Gráfico de barras — horas diárias
  - Libs: PrimeVue + Chart.js
- **Backend:** rota otimizada que retorna o agregado de métricas do `plano_estudo_id` ativo (evitar múltiplas requisições)

---

## 3. Requisitos Internos (não visíveis ao usuário)

### 3.1 SDK de Gerenciamento de IA

**Objetivo:**
Ferramenta interna que permita trocar entre modelos de IA facilmente e ofereça funcionalidades como:
- Monitoramento de tokens
- Cache de respostas
- Gerenciamento de prompts
- Troca de modelos sem impacto no restante da aplicação

---

### 3.2 Sistema de Permissões e Planos

**Objetivo:**
- Sistema de escolha de plano (Free / Premium)
- **Up-selling** durante o uso do plano free
- Definir quais módulos podem ser vendidos separadamente

---

## 4. Fora do Escopo (v1.0)

> Funcionalidades desejadas para versões futuras — **não entram na v1.0**.

| Funcionalidade | Observação |
|---|---|
| Visualização em árvore (Vue Flow) | Mostra dimensão real do progresso com previsão de conclusão |
| Checkout de pagamento (AbacatePay) | Tornaria o produto um SaaS completo de ponta a ponta |
| Tutor de IA no modo foco | IA especializada integrada ao timer |
| Banco de questões + simulado in-house | Sistema próprio de resolução de simulados |
| Flashcards no modo foco | Criação automatizada de flashcards por tópico |
| Módulo de acompanhamento de editais | Notificações mobile sobre datas importantes do processo seletivo |
| Importação e armazenamento de material de estudo | Armazenamento em nuvem organizado por matéria/assunto |
| Modo leitura (tema amarelado) | Além dos modos dark/light |
| Insights de IA do modo foco | Notas e insights gerados pela IA durante sessões de estudo |

---

## 5. Restrições e Decisões Técnicas Relevantes

| Decisão | Detalhe |
|---|---|
| Framework Frontend | Vue 3 (`App.vue` como container principal) |
| Autenticação | JWT com expiração + senhas hasheadas + authMiddleware |
| Gráficos | PrimeVue + Chart.js |
| Fluxogramas/Árvores (futuro) | Vue Flow |
| Pagamento (futuro) | AbacatePay |
| IA | Consumo de tokens mapeado; SDK interno para troca de modelos |
| Multitenancy | Isolamento por `plano_estudo_id` injetado automaticamente nas rotas |