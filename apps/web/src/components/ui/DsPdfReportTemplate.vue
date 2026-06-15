<script setup lang="ts">
import type { PdfReportData } from '../../hooks/useExportPdf'

defineProps<{
  data: PdfReportData
}>()
</script>

<template>
  <div style="position: fixed; left: 0; top: 0; z-index: -9999; opacity: 0; pointer-events: none; width: 700px; padding: 20px;">
    <div id="pdf-report-template" class="p-8 font-sans"
      style="width: 700px; background-color: #ffffff; color: #1e293b;">

      <!-- Header -->
      <div class="border-b pb-6 mb-6" style="border-color: #e2e8f0;">
        <h1 class="text-3xl font-headline font-bold" style="color: #0f172a;">Resumo de Desempenho</h1>
        <p class="text-sm mt-1" style="color: #64748b;">Gerado em: {{ new Date().toLocaleString('pt-BR') }}</p>
      </div>

      <div class="space-y-8">
        <!-- Dados Gerais -->
        <section>
          <h2 class="text-xl font-headline font-bold mb-4 border-l-4 pl-3 flex items-center gap-2"
            style="color: #1e293b; border-color: #6366f1;">
            Dados Gerais
          </h2>
          <div class="grid grid-cols-3 gap-4">
            <div class="p-4 rounded-lg border" style="background-color: #f8fafc; border-color: #e2e8f0;">
              <p class="text-xs font-bold uppercase tracking-wider" style="color: #64748b;">Tempo de Estudo</p>
              <p class="text-3xl font-headline font-bold mt-2" style="color: #4f46e5;">
                {{ data.totalStudyHours }}<span class="text-lg">h</span>
              </p>
            </div>
            <div class="p-4 rounded-lg border" style="background-color: #f8fafc; border-color: #e2e8f0;">
              <p class="text-xs font-bold uppercase tracking-wider" style="color: #64748b;">Sessões Foco</p>
              <p class="text-3xl font-headline font-bold mt-2" style="color: #0f172a;">{{ data.totalSessions }}</p>
              <p class="text-xs mt-1 font-semibold" style="color: #64748b;">
                {{ data.completedSessions }} completas ({{ data.completionRate }}%)
              </p>
            </div>
            <div class="p-4 rounded-lg border" style="background-color: #f8fafc; border-color: #e2e8f0;">
              <p class="text-xs font-bold uppercase tracking-wider" style="color: #64748b;">Erros Registrados</p>
              <p class="text-3xl font-headline font-bold mt-2" style="color: #ef4444;">{{ data.totalErrors }}</p>
            </div>
          </div>
        </section>

        <!-- Último Dia Ativo -->
        <section>
          <h2 class="text-xl font-headline font-bold mb-4 border-l-4 pl-3"
            style="color: #1e293b; border-color: #6366f1;">
            Último Dia Ativo
          </h2>
          <div class="p-4 rounded-lg border" style="background-color: #f8fafc; border-color: #e2e8f0;">
            <p class="text-base font-body font-medium" style="color: #334155;">{{ data.lastDayStats }}</p>
          </div>
        </section>

        <!-- Disciplinas e Tópicos Estudados -->
        <section v-if="data.disciplinesList && data.disciplinesList.length > 0">
          <h2 class="text-xl font-headline font-bold mb-4 border-l-4 pl-3"
            style="color: #1e293b; border-color: #6366f1;">
            Disciplinas e Tópicos Estudados
          </h2>
          <div class="space-y-4">
            <div v-for="disc in data.disciplinesList" :key="disc.name"
              class="p-4 rounded-lg border"
              style="background-color: #f8fafc; border-color: #e2e8f0;">
              
              <!-- Cabeçalho da Disciplina -->
              <div class="flex justify-between items-start mb-3 pb-2 border-b" style="border-color: #e2e8f0;">
                <div>
                  <h3 class="text-base font-headline font-bold" style="color: #0f172a;">{{ disc.name }}</h3>
                  <p class="text-xs mt-0.5" style="color: #64748b;">
                    {{ disc.sessionsCount }} sessões • {{ disc.hours }}h de estudo
                  </p>
                </div>
                <div v-if="disc.questionsDone > 0" class="text-right">
                  <span class="text-xs font-bold block" style="color: #0f172a;">Acurácia: {{ disc.accuracy }}%</span>
                  <span class="text-[10px]" style="color: #64748b;">{{ disc.questionsCorrect }}/{{ disc.questionsDone }} questões</span>
                </div>
              </div>

              <!-- Tópicos -->
              <div class="grid grid-cols-2 gap-4 text-[11px] leading-relaxed">
                <!-- Tópicos Concluídos -->
                <div>
                  <p class="font-bold mb-1.5 flex items-center gap-1.5" style="color: #16a34a;">
                    <i class="pi pi-check-circle" style="font-size: 8px;"></i>
                    Estudados ou Concluídos ({{ disc.completedTopics.length }})
                  </p>
                  <ul v-if="disc.completedTopics.length > 0" class="list-disc pl-4 space-y-0.5" style="color: #334155;">
                    <li v-for="topic in disc.completedTopics" :key="topic">{{ topic }}</li>
                  </ul>
                  <p v-else class="italic text-[10px]" style="color: #94a3b8;">Nenhum tópico estudado ou concluído.</p>
                </div>

                <!-- Tópicos Pendentes -->
                <div>
                  <p class="font-bold mb-1.5 flex items-center gap-1.5" style="color: #f59e0b;">
                    <i class="pi pi-clock" style="font-size: 8px;"></i>
                    Não Estudados ({{ disc.pendingTopics.length }})
                  </p>
                  <ul v-if="disc.pendingTopics.length > 0" class="list-disc pl-4 space-y-0.5" style="color: #334155;">
                    <li v-for="topic in disc.pendingTopics" :key="topic">{{ topic }}</li>
                  </ul>
                  <p v-else class="italic text-[10px] font-bold" style="color: #16a34a;">Todos os tópicos estudados! 🎉</p>
                </div>
              </div>

            </div>
          </div>
        </section>

        <!-- Top 3 Erros -->
        <section>
          <h2 class="text-xl font-headline font-bold mb-4 border-l-4 pl-3"
            style="color: #1e293b; border-color: #ef4444;">
            Top 3 Erros Mais Comuns
          </h2>
          <div class="space-y-3">
            <div v-for="(mistake, idx) in data.topMistakes" :key="idx"
              class="flex justify-between items-center p-4 rounded-lg border"
              style="background-color: #fef2f2; border-color: #fee2e2;">
              <span class="font-bold text-base" style="color: #0f172a;">{{ Number(idx) + 1 }}. {{ mistake[0] }}</span>
              <span class="font-bold px-3 py-1 rounded-full text-sm"
                style="color: #dc2626; background-color: #fee2e2;">{{ mistake[1] }} registros</span>
            </div>
            <div v-if="!data.topMistakes || data.topMistakes.length === 0"
              class="p-4 text-center text-sm italic" style="color: #64748b;">
              Nenhum erro registrado. Ótimo trabalho!
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
