# Sessão de Insights de IA (Tutor Modo Flash)

Este documento detalha o funcionamento técnico da nova **Sessão de Insights de IA**, criada para fornecer um chatbot LLM focado em editais e matérias de concursos.

## 1. Visão Geral
A Sessão de Insights IA (`AIInsightsView.vue`) atua como uma interface de chat na qual os usuários podem realizar perguntas diretas sobre suas disciplinas ou editais, recebendo respostas baseadas no modelo `gpt-4o-mini` da OpenAI.

O grande diferencial deste componente é o **Paywall Dinâmico**. A página pode ser acessada por qualquer usuário (Premium ou Free), mas o comportamento muda drasticamente dependendo do status da assinatura.

## 2. Estrutura do Paywall (Restrição de Acesso)

O sistema verifica se o usuário é assinante através do hook `usePlan()` (`plan.isPremium`).

**Se o usuário for PREMIUM:**
- Ele visualiza a interface de mensagens (chat) normalmente.
- Pode interagir com o campo de texto.
- O evento de envio de mensagem (`handleSend`) é habilitado, permitindo chamadas à API da OpenAI.

**Se o usuário for FREE:**
- A camada que envolve as mensagens e o input de texto (`textarea`) recebe as classes CSS: `blur-md pointer-events-none select-none opacity-50`.
- Isso causa um efeito visual de **fundo desfocado**.
- Uma `<div class="absolute inset-0 z-10">` (overlay) é renderizada sobreposta à interface desfocada. Ela exibe uma mensagem convidando o usuário a assinar ("Desbloqueie o Tutor de IA") e um botão **"Fazer Upgrade"**, que redireciona o usuário para a página `/private/plans`.
- A API da OpenAI nunca é chamada acidentalmente por um usuário free, pois os eventos de clique estão bloqueados via CSS (`pointer-events-none`) e também protegidos internamente no script.

## 3. Funcionamento do Chatbot (LLM)

A lógica de conversação é mantida em uma lista reativa do Vue: `messages`. 
Cada mensagem possui o formato: `{ id, role, text }`, sendo `role` `user` (para mensagens do usuário) ou `assistant` (para mensagens da IA).

### Prompt de Sistema (System Instruction)
Antes de enviar a conversa para a API, é injetado um **System Prompt** rigoroso. Este prompt orienta o modelo a:
- Ser "cirúrgico" e direto ao ponto.
- Focar na visão das bancas examinadoras.
- Destacar pegadinhas usando o emoji ⚠️.
- Usar formatação limpa (Bullet points e negrito) para leitura dinâmica, ideal para estudantes em momento de estudo cronometrado.

### Integração com OpenAI
1. O texto do usuário é capturado do `textarea` e anexado ao final do histórico de mensagens.
2. O botão de enviar é temporariamente bloqueado (`isLoading = true`).
3. Uma requisição `fetch` do tipo POST é feita ao endpoint `https://api.openai.com/v1/chat/completions`.
4. As mensagens são mapeadas para o formato esperado pela OpenAI, encabeçadas pelo Prompt de Sistema.
5. Quando a resposta retorna, ela é adicionada à lista `messages`, e a função `scrollToBottom` garante que a interface de chat desça para exibir a nova mensagem.

### Fallback/Simulação (Ambientes sem Chave de API)
Para facilitar o desenvolvimento, caso a variável de ambiente `VITE_OPENAI_API_KEY` não esteja presente, a aplicação adota um **Modo Simulado**.
- Ao invés de causar um erro por falta de token, a interface imita um carregamento de 1.5 segundos.
- Retorna uma resposta amigável avisando que o sistema está em simulação e instruindo como inserir a API Key correta.

## 4. Integração na Aplicação
A visualização foi injetada no roteador `apps/web/src/router/index.ts` com a rota `/private/ai-insights`.
Além disso, um novo link de navegação foi adicionado em `AppSidebar.vue`. Para permitir o "Paywall de Vitrine" (quando o usuário free vê que a feature existe mas não consegue usá-la), o link na barra lateral foi configurado com `isPremium: false`. Isso garante que todos vejam o botão de Insights na Sidebar, instigando o clique.

## 5. Diagnóstico de IA no Dashboard (Card do Dashboard)
No Dashboard (`PrivateView.vue`), o componente `VDiagnosticCard` (`DsDiagnosticCard.vue`) exibe resumos de desempenho gerados pela IA.
Para torná-lo funcional e evitar informações sem sentido caso o usuário não possua dados cadastrados, foi implementada a seguinte lógica:
1. O Dashboard executa a query `useDisciplinesQuery()` para verificar se o usuário possui disciplinas cadastradas.
2. Caso a lista de disciplinas esteja vazia (`disciplines.length === 0`), a propriedade `:isEmpty="true"` é enviada ao card de diagnóstico.
3. Com `isEmpty` ativo, o card oculta os diagnósticos simulados e exibe um texto amigável recomendando que o usuário dê os seus primeiros passos ("Parece que você ainda não começou a cadastrar sua rotina de estudos...").
4. São fornecidos botões de ação rápida para redirecionar o usuário diretamente às telas de "Cadastrar Disciplinas" e "Criar Tarefas".
5. Quando o usuário cadastra sua primeira disciplina, o card automaticamente passa a exibir os relatórios de insights e curva de retenção do Diagnóstico Vincis.
