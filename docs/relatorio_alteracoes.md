# Relatório Detalhado de Alterações (Vincis-App)

Este relatório descreve detalhadamente cada uma das **32 modificações** realizadas nos arquivos do repositório [Vincis-App](file:///home/igorpeixoto/Vincis-App), incluindo banco de dados, backend, rotas, hooks de API e componentes frontend em Vue 3.

---

## Índice de Arquivos Modificados

1. [apps/api/prisma/schema.prisma](file:///home/igorpeixoto/Vincis-App/apps/api/prisma/schema.prisma)
2. [apps/api/src/features/ai/ai.routes.ts](file:///home/igorpeixoto/Vincis-App/apps/api/src/features/ai/ai.routes.ts)
3. [apps/api/src/features/discipline/discipline.controller.ts](file:///home/igorpeixoto/Vincis-App/apps/api/src/features/discipline/discipline.controller.ts)
4. [apps/api/src/features/discipline/discipline.routes.ts](file:///home/igorpeixoto/Vincis-App/apps/api/src/features/discipline/discipline.routes.ts)
5. [apps/api/src/features/discipline/discipline.schema.ts](file:///home/igorpeixoto/Vincis-App/apps/api/src/features/discipline/discipline.schema.ts)
6. [apps/api/src/features/discipline/discipline.service.ts](file:///home/igorpeixoto/Vincis-App/apps/api/src/features/discipline/discipline.service.ts)
7. [apps/api/src/features/edital/edital.controller.ts](file:///home/igorpeixoto/Vincis-App/apps/api/src/features/edital/edital.controller.ts)
8. [apps/api/src/features/edital/edital.routes.ts](file:///home/igorpeixoto/Vincis-App/apps/api/src/features/edital/edital.routes.ts)
9. [apps/api/src/features/focus-session/focus-session.schema.ts](file:///home/igorpeixoto/Vincis-App/apps/api/src/features/focus-session/focus-session.schema.ts)
10. [apps/api/src/features/focus-session/focus-session.service.ts](file:///home/igorpeixoto/Vincis-App/apps/api/src/features/focus-session/focus-session.service.ts)
11. [apps/api/src/features/study-plan/study-plan.middleware.ts](file:///home/igorpeixoto/Vincis-App/apps/api/src/features/study-plan/study-plan.middleware.ts)
12. [apps/api/src/server.ts](file:///home/igorpeixoto/Vincis-App/apps/api/src/server.ts)
13. [apps/web/src/components/features/disciplines/CreateDisciplineForm.vue](file:///home/igorpeixoto/Vincis-App/apps/web/src/components/features/disciplines/CreateDisciplineForm.vue)
14. [apps/web/src/components/features/disciplines/DisciplineCard.vue](file:///home/igorpeixoto/Vincis-App/apps/web/src/components/features/disciplines/DisciplineCard.vue)
15. [apps/web/src/components/features/disciplines/DisciplineDetails.vue](file:///home/igorpeixoto/Vincis-App/apps/web/src/components/features/disciplines/DisciplineDetails.vue)
16. [apps/web/src/components/features/disciplines/DisciplineSettings.vue](file:///home/igorpeixoto/Vincis-App/apps/web/src/components/features/disciplines/DisciplineSettings.vue)
17. [apps/web/src/components/features/disciplines/DisciplinesHeader.vue](file:///home/igorpeixoto/Vincis-App/apps/web/src/components/features/disciplines/DisciplinesHeader.vue)
18. [apps/web/src/components/features/planner/PlannerSettingsPanel.vue](file:///home/igorpeixoto/Vincis-App/apps/web/src/components/features/planner/PlannerSettingsPanel.vue)
19. [apps/web/src/components/layout/AITutorDrawer.vue](file:///home/igorpeixoto/Vincis-App/apps/web/src/components/layout/AITutorDrawer.vue)
20. [apps/web/src/components/layout/AppSidebar.vue](file:///home/igorpeixoto/Vincis-App/apps/web/src/components/layout/AppSidebar.vue)
21. [apps/web/src/components/layout/StudyPlanSwitcher.vue](file:///home/igorpeixoto/Vincis-App/apps/web/src/components/layout/StudyPlanSwitcher.vue)
22. [apps/web/src/hooks/useAiSession.ts](file:///home/igorpeixoto/Vincis-App/apps/web/src/hooks/useAiSession.ts)
23. [apps/web/src/hooks/useDisciplines.ts](file:///home/igorpeixoto/Vincis-App/apps/web/src/hooks/useDisciplines.ts)
24. [apps/web/src/hooks/useEditais.ts](file:///home/igorpeixoto/Vincis-App/apps/web/src/hooks/useEditais.ts)
25. [apps/web/src/hooks/useFocusSessions.ts](file:///home/igorpeixoto/Vincis-App/apps/web/src/hooks/useFocusSessions.ts)
26. [apps/web/src/hooks/usePayment.ts](file:///home/igorpeixoto/Vincis-App/apps/web/src/hooks/usePayment.ts)
27. [apps/web/src/router/index.ts](file:///home/igorpeixoto/Vincis-App/apps/web/src/router/index.ts)
28. [apps/web/src/views/DisciplinasView.vue](file:///home/igorpeixoto/Vincis-App/apps/web/src/views/DisciplinasView.vue)
29. [apps/web/src/views/EditaisView.vue](file:///home/igorpeixoto/Vincis-App/apps/web/src/views/EditaisView.vue)
30. [apps/web/src/views/ErrorLogsView.vue](file:///home/igorpeixoto/Vincis-App/apps/web/src/views/ErrorLogsView.vue)
31. [apps/web/src/views/PlansView.vue](file:///home/igorpeixoto/Vincis-App/apps/web/src/views/PlansView.vue)
32. [apps/web/src/views/StudyPlansView.vue](file:///home/igorpeixoto/Vincis-App/apps/web/src/views/StudyPlansView.vue)

---

## 1. Banco de Dados e Modelagem

### 1.1 [apps/api/prisma/schema.prisma](file:///home/igorpeixoto/Vincis-App/apps/api/prisma/schema.prisma)
* **Linhas Modificadas**: Linha 54 (no modelo `Discipline`).
* **O que foi criado**: Campo booleano `isActive` para representar o status ativo/arquivado da disciplina.
* **Qual foi a alteração**: Adição do campo `isActive Boolean @default(true)`.
* **Por que foi feito**: Para permitir a persistência de status ativo ou arquivado nas disciplinas no banco de dados.
* **Código Modificado (Diff)**:
```diff
 model Discipline {
   id          Int       @id @default(autoincrement())
   name        String
   description String?
   color       String
   weight      Float     @default(1.0)
+  isActive    Boolean   @default(true)
   studyPlanId Int
```

---

## 2. Backend API (TypeScript / Node.js)

### 2.1 [apps/api/src/server.ts](file:///home/igorpeixoto/Vincis-App/apps/api/src/server.ts)
* **Linhas Modificadas**: Linhas 6 e 43.
* **O que foi criado**: Registro do endpoint `/ai` ligando-o ao roteador `aiRouter`.
* **Qual foi a alteração**: Importação de `aiRouter` e adição de `app.use("/ai", aiRouter)`.
* **Por que foi feito**: Registrar e expor as rotas de IA para o Tutor do site.
* **Código Modificado (Diff)**:
```diff
 import { studyPlanRouter } from './features/study-plan/study-plan.routes.js'
+import { aiRouter } from './features/ai/ai.routes.js'
...
 app.use("/focus-sessions", focusSessionRouter)
+app.use("/ai", aiRouter)
```

### 2.2 [apps/api/src/features/ai/ai.routes.ts](file:///home/igorpeixoto/Vincis-App/apps/api/src/features/ai/ai.routes.ts)
* **Linhas Modificadas**: Linhas 20, 29, 39, 48, 57-65, 73, 81.
* **O que foi criado**: Conversão manual de tipo de `id` para string nas consultas ao banco; importação dinâmica da classe `PDFParse` do pacote `pdf-parse`; alteração de chaves do Vercel AI SDK.
* **Qual foi a alteração**:
  - `where: { id, userId }` alterado para `where: { id: id as string, userId }`.
  - Importação de PDF com `require('pdf-parse')` substituída por `import('pdf-parse')` dinâmico e instância da classe `PDFParse`.
  - Parâmetro `maxTokens` alterado para `maxOutputTokens`.
  - Remoção de `sendUsage: true` no stream.
* **Por que foi feito**: Corrigir bugs de compilação causados por tipos conflitantes de IDs no Prisma, erro na importação CommonJS (`require`) em ambiente ES Modules (ESM) e adequação à nova API do Vercel AI SDK.
* **Código Modificado (Diff)**:
```diff
@@ -40,7 +40,7 @@ aiRouter.get('/sessions/:id', async (req: Request, res: Response) => {
-      where: { id, userId },
+      where: { id: id as string, userId },
...
-                    const pdfParse = require('pdf-parse');
-                    const pdfData = await pdfParse(buffer);
+                    const { PDFParse } = await import('pdf-parse');
+                    const parser = new PDFParse({ data: buffer });
+                    const pdfData = await parser.getText();
                     edital.parsedContent = pdfData.text;
```

### 2.3 [apps/api/src/features/study-plan/study-plan.middleware.ts](file:///home/igorpeixoto/Vincis-App/apps/api/src/features/study-plan/study-plan.middleware.ts)
* **Linhas Modificadas**: Linhas 9 a 17.
* **O que foi criado**: Captura alternativa de `studyPlanId` via cabeçalhos HTTP (`x-study-plan-id`) ou Query Parameters.
* **Qual foi a alteração**: O middleware agora verifica parâmetros na URL e headers antes de ler o cookie de navegação.
* **Por que foi feito**: Permitir a consulta de dados e clonagem de disciplinas pertencentes a outros planos de estudos sem alterar forçadamente o plano de estudos atualmente ativo nos cookies do navegador do usuário.
* **Código Modificado (Diff)**:
```diff
     const injectedReq = req as StudyPlanInjectedRequest
-    const studyPlanId = req.cookies?.study_plan_id
+    const queryOrHeaderId = req.query.study_plan_id || req.headers['x-study-plan-id']
+    const studyPlanId = queryOrHeaderId ? Number(queryOrHeaderId) : (req.cookies?.study_plan_id ? Number(req.cookies.study_plan_id) : null)
     const userId = injectedReq.dbUser!.id
```

### 2.4 [apps/api/src/features/discipline/discipline.controller.ts](file:///home/igorpeixoto/Vincis-App/apps/api/src/features/discipline/discipline.controller.ts)
* **Linhas Modificadas**: Linhas 2, 59-62 e novas linhas de 94 a 407.
* **O que foi criado**: 
  - Imports de IA e Zod.
  - Função `generateTopicsForDiscipline` (geração de tópicos com IA sob verificação Premium).
  - Métodos em lote: `bulkCreateDisciplines`, `bulkDeleteDisciplines`, `bulkWeightUpdateDisciplines`, `bulkStatusUpdateDisciplines`.
* **Qual foi a alteração**: Permitiu o campo `isActive` na atualização manual. Adicionou o conjunto completo de controladores para as chamadas em lote.
* **Por que foi feito**: Estender o backend para possibilitar o arquivamento de disciplinas e o processamento de ações em lote no frontend, além da funcionalidade de IA restrita a Premium.
* **Código Modificado (Diff)**:
```diff
+export async function generateTopicsForDiscipline(req: Request, res: Response) {
+        if (injectedReq.dbUser?.plan !== 'PREMIUM') {
+            return res.status(403).json({ message: "Recurso exclusivo do plano Premium..." });
+        }
+        // ... extração com IA e inserção em transação banco de dados ...
+}
+export async function bulkCreateDisciplines(req: Request, res: Response) { ... }
+export async function bulkDeleteDisciplines(req: Request, res: Response) { ... }
+export async function bulkWeightUpdateDisciplines(req: Request, res: Response) { ... }
+export async function bulkStatusUpdateDisciplines(req: Request, res: Response) { ... }
```

### 2.5 [apps/api/src/features/discipline/discipline.routes.ts](file:///home/igorpeixoto/Vincis-App/apps/api/src/features/discipline/discipline.routes.ts)
* **Linhas Modificadas**: Todo o arquivo (reestruturação de imports e novas rotas).
* **O que foi criado**: Registro das novas rotas de importação, deleção, peso, status em lote e geração de tópicos por IA.
* **Qual foi a alteração**: Registro dos endpoints `/bulk`, `/bulk-delete`, `/bulk-weight`, `/bulk-status` e `/:id/generate-topics`.
* **Por que foi feito**: Mapear as chamadas de API do frontend para os novos métodos criados no controlador.
* **Código Modificado (Diff)**:
```diff
+disciplineRouter.post('/bulk', bulkCreateDisciplines);
+disciplineRouter.post('/bulk-delete', bulkDeleteDisciplines);
+disciplineRouter.post('/bulk-weight', bulkWeightUpdateDisciplines);
+disciplineRouter.post('/bulk-status', bulkStatusUpdateDisciplines);
+disciplineRouter.post('/:id/generate-topics', generateTopicsForDiscipline);
```

### 2.6 [apps/api/src/features/discipline/discipline.schema.ts](file:///home/igorpeixoto/Vincis-App/apps/api/src/features/discipline/discipline.schema.ts)
* **Linhas Modificadas**: Linha 15.
* **O que foi criado**: Propriedade `isActive` como validação opcional no Zod schema de atualização.
* **Qual foi a alteração**: Adicionado `isActive: z.boolean().optional()`.
* **Por que foi feito**: Validar no Express se o JSON enviado no PATCH de disciplinas contém a propriedade de status.
* **Código Modificado (Diff)**:
```diff
 export const updateDisciplineSchema = z.object({
   name: z.string().min(1, "O nome da disciplina não pode ser vazio.").optional(),
   description: z.string().optional(),
   color: z.string().min(1, "A cor não pode ser vazia.").optional(),
-  weight: z.number().optional()
+  weight: z.number().optional(),
+  isActive: z.boolean().optional()
 });
```

### 2.7 [apps/api/src/features/discipline/discipline.service.ts](file:///home/igorpeixoto/Vincis-App/apps/api/src/features/discipline/discipline.service.ts)
* **Linhas Modificadas**: Linha 33 e 37.
* **O que foi criado**: Aceitação do campo `isActive` opcional na atualização do banco.
* **Qual foi a alteração**: Assinatura do método atualizada para incluir `isActive?: boolean`.
* **Por que foi feito**: Integrar com a chamada do Prisma Client.
* **Código Modificado (Diff)**:
```diff
-    async updateDiscipline(id: number, studyPlanId: number, data: { name?: string, color?: string, weight?: number }) {
+    async updateDiscipline(id: number, studyPlanId: number, data: { name?: string, color?: string, weight?: number, isActive?: boolean }) {
```

### 2.8 [apps/api/src/features/edital/edital.controller.ts](file:///home/igorpeixoto/Vincis-App/apps/api/src/features/edital/edital.controller.ts)
* **Linhas Modificadas**: Linhas 3, 49, 94, 125, e criação de 156 a 296.
* **O que foi criado**:
  - Imports de IA, Zod e PDFParse.
  - Função `extractSyllabusText` (filtro e corte de edital).
  - Controlador `extractEdital` (com filtragem e estruturação em lote via IA).
* **Qual foi a alteração**: Mudança da janela de texto do parser de 10.000 para 100.000 caracteres. Conversão consistente de ID do edital usando `parseInt(req.params.id as string)`. Ajuste da instância `new PDFParse` de forma consistente.
* **Por que foi feito**: Mapear a extração automatizada de disciplinas a partir de arquivos PDF anexados na plataforma, sob restrição premium e com a contagem de tokens gastos no processamento.
* **Código Modificado (Diff)**:
```diff
+export const extractEdital = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
+        if (req.dbUser?.plan !== 'PREMIUM') {
+            return res.status(403).json({ error: 'Recurso exclusivo do plano Premium...' });
+        }
+        // ... Etapa 1: Filtrar edital ... Etapa 2: Extrair disciplinas estruturadas ... Inserir no Banco ...
+        // Retorna tokensSpent
+}
```

### 2.9 [apps/api/src/features/edital/edital.routes.ts](file:///home/igorpeixoto/Vincis-App/apps/api/src/features/edital/edital.routes.ts)
* **Linhas Modificadas**: Linhas 8 e 34.
* **O que foi criado**: Rota POST `/:id/extract`.
* **Qual foi a alteração**: Adicionado endpoint para a extração do edital.
* **Por que foi feito**: Disponibilizar o link HTTP para o frontend disparar o processamento do edital.
* **Código Modificado (Diff)**:
```diff
+editalRouter.post('/:id/extract', extractEdital);
```

### 2.10 [apps/api/src/features/focus-session/focus-session.schema.ts](file:///home/igorpeixoto/Vincis-App/apps/api/src/features/focus-session/focus-session.schema.ts)
* **Linhas Modificadas**: Linhas 4 a 14.
* **O que foi criado**: Correção da validação de erros customizados no Zod schema.
* **Qual foi a alteração**: Mudança do parâmetro `required_error` para `message` na validação de campos do schema.
* **Por que foi feito**: Resolver problemas de validação no Zod que ocorriam na criação de sessões de foco devido ao uso da propriedade errada para retornar mensagens amigáveis em erros de tipo/nulos.

### 2.11 [apps/api/src/features/focus-session/focus-session.service.ts](file:///home/igorpeixoto/Vincis-App/apps/api/src/features/focus-session/focus-session.service.ts)
* **Linhas Modificadas**: Linhas 34, 47, 59.
* **O que foi criado**: Adicionado `updatedAt` na criação de sessão e renomeado o relacionamento do Prisma.
* **Qual foi a alteração**: `include: { discipline: { ... } }` alterado para `include: { Discipline: { ... } }`.
* **Por que foi feito**: Ajustar o service ao modelo do banco de dados (Prisma) que define o relacionamento de FocusSession com a tabela Discipline usando a letra maiúscula `Discipline`.

---

## 3. Hooks de Conexão com API (Frontend Vue 3)

### 3.1 [apps/web/src/hooks/useDisciplines.ts](file:///home/igorpeixoto/Vincis-App/apps/web/src/hooks/useDisciplines.ts)
* **Linhas Modificadas**: Linha 11 e novas linhas de 123 a 169.
* **O que foi criado**:
  - Propriedade booleana `isActive` no tipo `Discipline`.
  - Mutação `useBulkCreateDisciplinesMutation`.
  - Mutação `useBulkDeleteDisciplinesMutation`.
  - Mutação `useBulkWeightUpdateDisciplinesMutation`.
  - Mutação `useBulkStatusUpdateDisciplinesMutation`.
  - Mutação `useGenerateTopicsForDisciplineMutation`.
* **Qual foi a alteração**: Exposição de todos os ganchos do Vue Query que lidam com ações em lote e geração de tópicos via IA.
* **Por que foi feito**: Conectar os novos endpoints do backend aos componentes visuais do Vue 3.

### 3.2 [apps/web/src/hooks/useEditais.ts](file:///home/igorpeixoto/Vincis-App/apps/web/src/hooks/useEditais.ts)
* **Linhas Modificadas**: Linha 8 e novas linhas de 57 a 68.
* **O que foi criado**:
  - Propriedade `parsedContent` no tipo `Edital`.
  - Gancho `useExtractEditalMutation`.
* **Qual foi a alteração**: Disponibilizou a chamada de extração de edital que retorna `tokensSpent`, `disciplinesCreated` e `topicsCreated`.
* **Por que foi feito**: Ligar a tela de editais ao endpoint de inteligência artificial.

### 3.3 [apps/web/src/hooks/useFocusSessions.ts](file:///home/igorpeixoto/Vincis-App/apps/web/src/hooks/useFocusSessions.ts)
* **Linhas Modificadas**: Linhas 1-8 e criação das linhas 59-71.
* **O que foi criado**: Gancho `useDisciplineFocusSessionsQuery`.
* **Qual foi a alteração**: Consulta a rota `/focus-sessions/discipline/:id`.
* **Por que foi feito**: Permitir carregar o histórico de sessões de estudo focadas em uma única disciplina.

### 3.4 [apps/web/src/hooks/usePayment.ts](file:///home/igorpeixoto/Vincis-App/apps/web/src/hooks/usePayment.ts)
* **Linhas Modificadas**: Linhas 23-30.
* **O que foi criado**: Objeto `billing` englobando as informações da simulação.
* **Qual foi a alteração**: Alinhou a estrutura da chamada mock de webhook Stripe/Asaas local com o backend do site.
* **Por que foi feito**: Fazer com que o botão de teste de ativação do modo desenvolvedor funcione corretamente, mudando o status para `PREMIUM`.
* **Código Modificado (Diff)**:
```diff
       const response = await api.post('/payments/webhook', {
         event: 'billing.paid',
         data: {
-          status: 'PAID',
-          metadata: { userId }
+          billing: {
+            status: 'PAID',
+            metadata: { userId }
+          }
         }
       })
```

### 3.5 [apps/web/src/hooks/useAiSession.ts](file:///home/igorpeixoto/Vincis-App/apps/web/src/hooks/useAiSession.ts)
* **Linhas Modificadas**: Linha 6.
* **O que foi criado**: Propriedade `editalId` opcional na interface de sessões de IA.
* **Qual foi a alteração**: Adicionado `editalId?: number | null`.
* **Por que foi feito**: Permitir o salvamento das referências de PDF nas conversas de chat do Tutor.

---

## 4. Componentes Frontend (UI e Layout)

### 4.1 [apps/web/src/components/features/disciplines/CreateDisciplineForm.vue](file:///home/igorpeixoto/Vincis-App/apps/web/src/components/features/disciplines/CreateDisciplineForm.vue)
* **Linhas Modificadas**: Linhas 14, 21, 30 e injeção do HTML.
* **O que foi criado**: Textarea para colar o conteúdo programático do edital no ato de criação de nova disciplina.
* **Qual foi a alteração**: Injeção da propriedade `syllabusText` enviada no payload do formulário.
* **Por que foi feito**: Habilitar a geração automática de tópicos imediatamente após a criação manual de uma disciplina.

### 4.2 [apps/web/src/components/features/disciplines/DisciplineCard.vue](file:///home/igorpeixoto/Vincis-App/apps/web/src/components/features/disciplines/DisciplineCard.vue)
* **Linhas Modificadas**: Linhas 4, 11, 21-27, 36, 52.
* **O que foi criado**: Checkbox de seleção na parte superior esquerda do card de disciplina; esmaecimento visual do card caso o status seja arquivado.
* **Qual foi a alteração**: Adicionado checkbox de seleção com emissão do evento `@select` e CSS dinâmico.
* **Por que foi feito**: Viabilizar a seleção em lote de múltiplos cards e destacar visualmente quais matérias estão arquivadas.

### 4.3 [apps/web/src/components/features/disciplines/DisciplineDetails.vue](file:///home/igorpeixoto/Vincis-App/apps/web/src/components/features/disciplines/DisciplineDetails.vue)
* **Linhas Modificadas**: Reestruturação completa do script e layout.
* **O que foi criado**:
  - Abas: Tópicos, Histórico de Foco, Varinha IA.
  - Tela de bloqueio e desfoque visual (overlay) na aba **Varinha IA** se o usuário não for Premium, mostrando botão "Assinar Plano Premium".
* **Qual foi a alteração**: Gaveta lateral de detalhes estendida com suporte a ações de IA sob restrição Premium.
* **Por que foi feito**:
  - Unificar a inteligência de criação automática de tópicos na barra lateral.
  - Exibir o histórico de estudo focado na disciplina.
  - Expor a monetização e o bloqueio estético para estimular a conversão Premium do usuário.
* **Código Modificado (Diff)**:
```diff
+                <!-- Tabs Navigation -->
+                <div class="flex border-b border-outline-variant/20 px-4 bg-surface-container-lowest flex-shrink-0">
+                    <button @click="activeTab = 'topics'">Tópicos</button>
+                    <button @click="activeTab = 'history'">Histórico de Foco</button>
+                    <button @click="activeTab = 'ai'"><i class="pi pi-magic"></i> Varinha IA</button>
+                </div>
+
+                <!-- Premium lock overlay (Varinha IA) -->
+                <div v-if="!plan.isPremium" class="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-surface-container-lowest/80 backdrop-blur-[2px] text-center space-y-4">
+                    <div class="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center"><i class="pi pi-lock"></i></div>
+                    <h4 class="font-bold text-sm">Recurso Premium</h4>
+                    <p class="text-xs">A Varinha IA é exclusiva do plano Premium.</p>
+                    <VButton @click="router.push('/private/plans')">Assinar Plano Premium</VButton>
+                </div>
```

### 4.4 [apps/web/src/components/features/disciplines/DisciplineSettings.vue](file:///home/igorpeixoto/Vincis-App/apps/web/src/components/features/disciplines/DisciplineSettings.vue)
* **Linhas Modificadas**: Linhas 18, 27, 43, 60 e injeção do HTML.
* **O que foi criado**: Botão de toggle Ativa/Arquivada no menu de edição individual.
* **Qual foi a alteração**: Adicionada propriedade reativa `panelIsActive` enviada na chamada de salvamento.
* **Por que foi feito**: Habilitar a mudança manual e individual do status de arquivamento da matéria.

### 4.5 [apps/web/src/components/features/disciplines/DisciplinesHeader.vue](file:///home/igorpeixoto/Vincis-App/apps/web/src/components/features/disciplines/DisciplinesHeader.vue)
* **Linhas Modificadas**: Todo o arquivo.
* **O que foi criado**:
  - Botões adicionais no cabeçalho: Clonar, Exportar e Importar.
  - Abas de status: Ativas / Arquivadas.
  - Toggles de layout: Grade (Bento Grid) e Lista.
* **Qual foi a alteração**: Desenho do painel de controle superior do módulo acadêmico.
* **Por que foi feito**: Integrar as novas opções de visualização, clonagem e tráfego de dados (JSON) das matérias.

### 4.6 [apps/web/src/components/features/planner/PlannerSettingsPanel.vue](file:///home/igorpeixoto/Vincis-App/apps/web/src/components/features/planner/PlannerSettingsPanel.vue)
* **Linhas Modificadas**: Linhas 101 e 106.
* **O que foi criado**: Fallbacks de retorno de string seguro nas funções de cores.
* **Qual foi a alteração**: Adicionado fallback de cor padrão para índices fora de intervalo.
* **Por que foi feito**: Evitar falhas de build/compilação do TypeScript por potenciais retornos indefinidos.

### 4.7 [apps/web/src/components/layout/AITutorDrawer.vue](file:///home/igorpeixoto/Vincis-App/apps/web/src/components/layout/AITutorDrawer.vue)
* **Linhas Modificadas**: Linhas 69, 125-156, e chamadas de chat.
* **O que foi criado**: Mapeamento seguro das propriedades de anexo do edital e propriedade `parts` nas mensagens enviadas ao SDK da Vercel.
* **Qual foi a alteração**: Ajustados campos de edital e adicionada a estrutura de `parts` obrigatória na mensagem inicial.
* **Por que foi feito**: Corrigir bugs de compilação do TypeScript e erros em tempo de execução ao tentar renderizar a interface de chat com o SDK da Vercel.

### 4.8 [apps/web/src/components/layout/AppSidebar.vue](file:///home/igorpeixoto/Vincis-App/apps/web/src/components/layout/AppSidebar.vue)
* **Linhas Modificadas**: Linhas 54 e 63.
* **O que foi criado**: Flag `showPremiumTag` para exibir uma etiqueta de destaque de Premium no menu.
* **Qual foi a alteração**: Adicionou a propriedade visual no item do plano Premium.
* **Por que foi feito**: Identificar e promover as áreas exclusivas aos assinantes da plataforma.

### 4.9 [apps/web/src/components/layout/StudyPlanSwitcher.vue](file:///home/igorpeixoto/Vincis-App/apps/web/src/components/layout/StudyPlanSwitcher.vue)
* **Linhas Modificadas**: Linhas 99 e 107.
* **O que foi criado**: Verificação preventiva `remainingPlans[0]` após excluir um plano ativo.
* **Qual foi a alteração**: Evitar tentar ler uma propriedade de índice indefinido caso não existam outros planos restantes.
* **Por que foi feito**: Correção de bug em tempo de execução que quebrava o switcher visual se o plano atual fosse deletado sem plano alternativo configurado.

---

## 5. Rotas e Roteamento

### 5.1 [apps/web/src/router/index.ts](file:///home/igorpeixoto/Vincis-App/apps/web/src/router/index.ts)
* **Linhas Modificadas**: Linha 96.
* **O que foi criado**: Componente de renderização vazio temporário (`{ render: () => null }`) na rota `/old-ds`.
* **Qual foi a alteração**: Associação do componente nulo à rota.
* **Por que foi feito**: Impedir que o compilador de build falhe acusando rotas sem componente de visualização válido.

---

## 6. Telas Principais (Views)

### 6.1 [apps/web/src/views/DisciplinasView.vue](file:///home/igorpeixoto/Vincis-App/apps/web/src/views/DisciplinasView.vue)
* **Linhas Modificadas**: Todo o arquivo (de 32 linhas para mais de 740 linhas).
* **O que foi criado**:
  - Filtro e pesquisa dinâmica de disciplinas pelo nome.
  - Abas "Ativas" e "Arquivadas".
  - Barra de ações em lote flutuante (mudar peso, arquivar, excluir em lote).
  - Sistema de "Desfazer" (Undo) via toasts temporários de 8 segundos.
  - Modal para importação de JSON e Modal para Clonagem de disciplinas de outros planos.
* **Qual foi a alteração**: Reescrita e reestruturação profunda da tela acadêmica.
* **Por que foi feito**: Habilitar a paridade de recursos acadêmicos avançados e prover melhor experiência de usuário.
* **Código Modificado (Diff)**:
```diff
+        <!-- Floating Bulk Action Bar -->
+        <div v-if="selectedIds.size > 0" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface-container-high/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-outline-variant/30 shadow-2xl flex items-center gap-6 z-50">
+            <span class="text-sm font-label font-bold"> {{ selectedIds.size }} selecionadas </span>
+            <VButton variant="secondary" @click="showBulkWeightModal = true">Alterar Peso</VButton>
+            <VButton variant="secondary" @click="handleBulkArchiveToggle(viewMode !== 'ACTIVE')"> {{ viewMode === 'ACTIVE' ? 'Arquivar' : 'Restaurar' }} </VButton>
+            <VButton variant="error" @click="handleBulkDelete">Excluir</VButton>
+        </div>
```

### 6.2 [apps/web/src/views/EditaisView.vue](file:///home/igorpeixoto/Vincis-App/apps/web/src/views/EditaisView.vue)
* **Linhas Modificadas**: Todo o arquivo.
* **O que foi criado**:
  - Bloqueio e modal de upgrade para usuários não Premium ao clicar em extrair.
  - Modal de Confirmação com aviso de demora e necessidade de checagem manual por parte do usuário (IA sujeita a erros).
  - Execução asíncrona em segundo plano simulada visualmente no frontend (10% a 90%).
  - Card flutuante persistente no canto inferior direito para exibir progresso, tokens consumidos e botões de atalho.
* **Qual foi a alteração**: Integração com a chamada da inteligência artificial de extração de editais em PDF.
* **Por que foi feito**: Atender de forma completa às exigências solicitadas sobre usabilidade, controle de acesso Premium, alertas de falha de mapeamento e contagem de tokens na extração.
* **Código Modificado (Diff)**:
```diff
+    <!-- Container de extrações em segundo plano (Floating bottom-right) -->
+    <div v-if="activeExtractions.length > 0" class="fixed bottom-6 right-6 z-50 flex flex-col gap-4 max-w-sm w-full">
+        <div v-for="job in activeExtractions" :key="job.id" class="bg-surface-container-high/95 rounded-2xl p-5 shadow-2xl">
+            <h4 class="font-bold text-xs text-on-surface truncate">{{ job.title }}</h4>
+            <div class="w-full h-1.5 bg-surface-container-low rounded-full overflow-hidden">
+                <div class="h-full bg-primary" :style="{ width: `${job.progress}%` }"></div>
+            </div>
+            <!-- Warning on success -->
+            <div v-if="job.status === 'success'" class="mt-3 p-2.5 bg-warning/10 text-warning text-[10px]">
+                <strong>Atenção:</strong> Como a extração foi feita por IA, revise atentamente a grade gerada no seu plano de estudo, pois podem ter ocorrido falhas ou omissões.
+            </div>
+        </div>
+    </div>
```

### 6.3 [apps/web/src/views/ErrorLogsView.vue](file:///home/igorpeixoto/Vincis-App/apps/web/src/views/ErrorLogsView.vue)
* **Linhas Modificadas**: Linhas 23 e 57.
* **O que foi criado**: Passagem de ID da disciplina baseada em `computed` reativo.
* **Qual foi a alteração**: Encapsulamento dos IDs de disciplinas em argumentos reativos para a chamada de busca de tópicos (`useTopicsQuery`).
* **Por que foi feito**: Impedir que o frontend quebre ou falhe ao tentar disparar consultas reativas quando o ID da disciplina está nulo ou muda de estado dinamicamente na tela de logs de erros.

### 6.4 [apps/web/src/views/PlansView.vue](file:///home/igorpeixoto/Vincis-App/apps/web/src/views/PlansView.vue)
* **Linhas Modificadas**: Linhas 14 e 151.
* **O que foi criado**: Botão "Ativar Premium (Dev Mode)" que simula localmente a ativação de assinatura via Webhook.
* **Qual foi a alteração**: Injeção da chamada de mutação de simulação de pagamento Stripe/Asaas no frontend.
* **Por que foi feito**: Facilitar os testes e desenvolvimento rápido das funcionalidades premium (Varinha IA, Extração de Editais) sem depender de pagamentos reais.
* **Código Modificado (Diff)**:
```diff
+                <VButton 
+                    v-if="currentPlan !== 'PREMIUM'" 
+                    @click="handleSimulatePayment" 
+                    :disabled="isSimulating"
+                    variant="secondary" 
+                    class="w-full mt-3"
+                >
+                    <i class="pi pi-bolt mr-2 text-sm"></i>
+                    {{ isSimulating ? 'Ativando...' : 'Ativar Premium (Dev Mode)' }}
+                </VButton>
```

### 6.5 [apps/web/src/views/StudyPlansView.vue](file:///home/igorpeixoto/Vincis-App/apps/web/src/views/StudyPlansView.vue)
* **Linhas Modificadas**: Linhas 131-137.
* **O que foi criado**: Correção na flag de desativação do botão de criação de planos de estudo.
* **Qual foi a alteração**: `:disabled="createStudyPlanMutation.isPending.value"` substituído por `:disabled="isCreating"`.
* **Por que foi feito**: Corrigir um bug de compilação/tempo de execução no Vue 3.
