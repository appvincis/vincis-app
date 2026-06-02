<script setup lang="ts">
import { computed } from 'vue'
import { useFocusSessionsQuery } from '../../../hooks/useFocusSessions'

const { data: sessionsData, isLoading } = useFocusSessionsQuery()

const recentSessions = computed(() => {
    if (!sessionsData.value) return []
    // Retorna as sessões concluídas ou parciais mais recentes (ordem decrescente de data)
    return [...sessionsData.value]
        .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
        .slice(0, 10) // Mostrar até 10 recentes
})

// Utilitário para formatar tempo (ex: "25 min" ou "1h 30m")
function formatDuration(seconds: number): string {
    if (!seconds) return '0 min'
    const mins = Math.round(seconds / 60)
    if (mins < 60) return `${mins} min`
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
}

// Utilitário para formatar hora do dia (ex: "14:30")
function formatTime(isoString: string): string {
    const d = new Date(isoString)
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

// Utilitário para agrupar datas (Hoje, Ontem, ou "12 de Nov")
function formatRelativeDate(isoString: string): string {
    const d = new Date(isoString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const isSameDay = (d1: Date, d2: Date) =>
        d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear()

    if (isSameDay(d, today)) return 'Hoje'
    if (isSameDay(d, yesterday)) return 'Ontem'

    return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}
</script>

<template>
    <div class="focus-history-container">
        <div class="flex items-center justify-between mb-5">
            <h3 class="text-sm font-headline font-bold text-on-surface flex items-center gap-2">
                <i class="pi pi-history text-primary"></i>
                Histórico Recente
            </h3>
        </div>

        <div class="history-content relative flex flex-col flex-1 min-h-0">
            <div v-if="isLoading" class="flex flex-col items-center justify-center py-8 gap-3 opacity-60">
                <i class="pi pi-spin pi-spinner text-2xl text-primary"></i>
            </div>

            <div v-else-if="recentSessions.length === 0" class="empty-state">
                <div class="empty-icon-wrap">
                    <i class="pi pi-calendar-times text-xl"></i>
                </div>
                <p class="font-sans text-xs font-medium text-on-surface-muted text-center leading-relaxed">
                    Nenhuma sessão concluída.<br>Inicie o foco para registrar seu progresso!
                </p>
            </div>

            <div v-else class="space-y-4 pr-1 custom-scrollbar overflow-y-auto flex-1">
                <div v-for="session in recentSessions" :key="session.id" class="history-item group">
                    <!-- Linha do tempo (espinha dorsal) -->
                    <div class="timeline-line"></div>
                    
                    <!-- Ponto colorido -->
                    <div class="timeline-dot shadow-sm"
                        :style="{ backgroundColor: session.discipline?.color || 'var(--color-primary)' }">
                    </div>

                    <!-- Conteúdo do card -->
                    <div class="history-card">
                        <div class="flex justify-between items-start mb-1">
                            <span class="font-sans text-[11px] font-bold tracking-wider uppercase text-on-surface-muted opacity-80">
                                {{ formatRelativeDate(session.startedAt) }}
                            </span>
                            <span class="font-sans text-[11px] font-bold text-on-surface-muted bg-surface-container py-0.5 px-2 rounded-full">
                                {{ formatTime(session.startedAt) }}
                            </span>
                        </div>
                        
                        <div class="flex items-center gap-2 mt-1">
                            <h4 class="font-sans font-bold text-sm text-on-surface truncate flex-1">
                                {{ session.discipline?.name || 'Disciplina Deletada' }}
                            </h4>
                            
                            <!-- Duração em destaque -->
                            <div class="flex items-center gap-1.5 px-2 py-1 rounded bg-primary/10 text-primary">
                                <i class="pi pi-stopwatch text-[10px]"></i>
                                <span class="font-sans font-bold text-xs">{{ formatDuration(session.duration) }}</span>
                            </div>
                        </div>

                        <div class="flex items-center gap-3 mt-2">
                            <div class="flex items-center gap-1 text-[11px] text-on-surface-muted">
                                <i class="pi pi-sync text-[9px]"></i>
                                <span>{{ session.cyclesCompleted }} ciclos</span>
                            </div>
                            <div v-if="session.isCompleted" class="flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400 font-medium">
                                <i class="pi pi-check-circle text-[10px]"></i>
                                <span>Completo</span>
                            </div>
                            <div v-else class="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                                <i class="pi pi-info-circle text-[10px]"></i>
                                <span>Parcial</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.focus-history-container {
    background: var(--color-surface-container-lowest);
    border: 1px solid var(--color-outline-variant);
    border-radius: 1.5rem;
    padding: 1.5rem;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    gap: 1rem;
    background: var(--color-surface-container-low);
    border-radius: 1rem;
    border: 1px dashed var(--color-outline-variant);
}

.empty-icon-wrap {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--color-primary-container);
    color: var(--color-on-primary-container);
    display: flex;
    align-items: center;
    justify-content: center;
}

/* ── Timeline Styles ── */
.history-content {
    flex: 1;
    min-height: 0;
}

.history-item {
    position: relative;
    padding-left: 24px;
}

.timeline-line {
    position: absolute;
    left: 7px;
    top: 24px;
    bottom: -16px;
    width: 2px;
    background: var(--color-outline-variant);
    opacity: 0.5;
}

/* Esconde a linha no último item */
.history-item:last-child .timeline-line {
    display: none;
}

.timeline-dot {
    position: absolute;
    left: 1px;
    top: 10px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2.5px solid var(--color-surface-container-lowest);
    z-index: 1;
    transition: transform 0.2s ease;
}

.history-item:hover .timeline-dot {
    transform: scale(1.2);
}

.history-card {
    background: var(--color-surface-container-low);
    border: 1px solid transparent;
    border-radius: 1rem;
    padding: 0.875rem 1rem;
    transition: all 0.2s ease;
}

.history-item:hover .history-card {
    background: var(--color-surface-container-lowest);
    border-color: var(--color-outline-variant);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    transform: translateX(4px);
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--color-outline-variant);
    border-radius: 10px;
}
</style>
