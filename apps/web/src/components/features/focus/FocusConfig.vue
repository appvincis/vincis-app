<script setup lang="ts">
import { VCard } from '@/components/ui'
import FocusHistory from './FocusHistory.vue'

defineProps<{
    disciplines: any[]
    selectedDisciplineId: number | null
    settings: any
}>()

defineEmits<{
    (e: 'update:selectedDisciplineId', val: number): void
    (e: 'start'): void
}>()
</script>

<template>
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        <!-- ─── Área Principal (Disciplinas e Configurações) ─── -->
        <div class="xl:col-span-8 space-y-8 flex flex-col">
            
            <!-- Seleção de Disciplinas -->
            <VCard class="p-8 backdrop-blur-xl bg-surface-container-lowest/90 border border-outline-variant/40 shadow-xl shadow-primary/5 rounded-[2rem]">
                <div class="flex items-center gap-3 mb-8">
                    <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <i class="pi pi-book text-lg"></i>
                    </div>
                    <div>
                        <h3 class="text-xl font-headline font-bold text-on-surface leading-tight">
                            Qual sua meta de agora?
                        </h3>
                        <p class="text-sm font-sans text-on-surface-muted">Selecione uma disciplina para focar.</p>
                    </div>
                </div>

                <div v-if="!disciplines.length"
                    class="text-center py-16 border-2 border-dashed border-outline-variant/30 rounded-2xl bg-surface-container-low/50">
                    <i class="pi pi-folder-open text-5xl text-outline-variant mb-4"></i>
                    <p class="text-on-surface-muted font-medium">Nenhuma disciplina cadastrada neste plano.</p>
                </div>

                <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <button v-for="disc in disciplines" :key="disc.id"
                        @click="$emit('update:selectedDisciplineId', disc.id)" class="discipline-card group"
                        :class="{ 'discipline-card--active': selectedDisciplineId === disc.id }">
                        
                        <!-- Efeito de brilho no topo do card -->
                        <div class="glow-effect" :style="{ background: `linear-gradient(180deg, ${disc.color}40 0%, transparent 100%)` }"></div>

                        <div class="relative z-10 flex flex-col items-start gap-3 w-full">
                            <div class="flex items-center justify-between w-full">
                                <div class="w-8 h-8 rounded-full flex items-center justify-center bg-surface-container-lowest shadow-sm"
                                    :style="{ border: `2px solid ${disc.color}` }">
                                    <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: disc.color }"></div>
                                </div>
                                <i v-if="selectedDisciplineId === disc.id" class="pi pi-check-circle text-lg" :style="{ color: disc.color }"></i>
                            </div>
                            
                            <div class="text-left w-full">
                                <span class="block font-headline font-bold text-base text-on-surface mb-1 truncate">{{ disc.name }}</span>
                                <span v-if="disc.description" class="block text-xs font-sans text-on-surface-muted line-clamp-1">
                                    {{ disc.description }}
                                </span>
                            </div>
                        </div>
                    </button>
                </div>
            </VCard>

            <!-- Configurações do Timer e Botão Start -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                
                <!-- Ajustes de Tempo -->
                <VCard class="p-6 backdrop-blur-xl bg-surface-container-lowest/90 border border-outline-variant/40 rounded-[1.5rem] shadow-lg shadow-black/5">
                    <h3 class="text-sm font-sans font-bold uppercase tracking-widest text-on-surface-muted mb-6 flex items-center gap-2">
                        <i class="pi pi-sliders-h text-primary"></i>
                        Ajustes do Método
                    </h3>
                    
                    <div class="space-y-4">
                        <div class="setting-row">
                            <span class="setting-label">Tempo de Foco</span>
                            <div class="setting-controls">
                                <button class="setting-btn" @click="settings.focusTime = Math.max(1, settings.focusTime - 5)">
                                    <i class="pi pi-minus text-xs"></i>
                                </button>
                                <span class="setting-val">{{ settings.focusTime }} <small>min</small></span>
                                <button class="setting-btn" @click="settings.focusTime = Math.min(120, settings.focusTime + 5)">
                                    <i class="pi pi-plus text-xs"></i>
                                </button>
                            </div>
                        </div>
                        <div class="setting-divider"></div>
                        
                        <div class="setting-row">
                            <span class="setting-label">Pausa Curta</span>
                            <div class="setting-controls">
                                <button class="setting-btn" @click="settings.breakTime = Math.max(1, settings.breakTime - 1)">
                                    <i class="pi pi-minus text-xs"></i>
                                </button>
                                <span class="setting-val">{{ settings.breakTime }} <small>min</small></span>
                                <button class="setting-btn" @click="settings.breakTime = Math.min(30, settings.breakTime + 1)">
                                    <i class="pi pi-plus text-xs"></i>
                                </button>
                            </div>
                        </div>
                        <div class="setting-divider"></div>
                        
                        <div class="setting-row">
                            <span class="setting-label">Pausa Longa</span>
                            <div class="setting-controls">
                                <button class="setting-btn" @click="settings.longBreakTime = Math.max(1, settings.longBreakTime - 5)">
                                    <i class="pi pi-minus text-xs"></i>
                                </button>
                                <span class="setting-val">{{ settings.longBreakTime }} <small>min</small></span>
                                <button class="setting-btn" @click="settings.longBreakTime = Math.min(60, settings.longBreakTime + 5)">
                                    <i class="pi pi-plus text-xs"></i>
                                </button>
                            </div>
                        </div>
                        <div class="setting-divider"></div>
                        
                        <div class="setting-row">
                            <span class="setting-label">Qtd. de Ciclos</span>
                            <div class="setting-controls">
                                <button class="setting-btn" @click="settings.cycles = Math.max(1, settings.cycles - 1)">
                                    <i class="pi pi-minus text-xs"></i>
                                </button>
                                <span class="setting-val">{{ settings.cycles }} <small>x</small></span>
                                <button class="setting-btn" @click="settings.cycles = Math.min(12, settings.cycles + 1)">
                                    <i class="pi pi-plus text-xs"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </VCard>

                <!-- Start Action -->
                <div class="relative w-full group h-full min-h-[160px]">
                    <!-- Aura de brilho atrás do botão (somente se habilitado) -->
                    <div class="absolute -inset-1 bg-gradient-to-r from-primary to-primary-container rounded-[2rem] blur opacity-30 group-hover:opacity-60 transition duration-500"
                         :class="{ 'hidden': !selectedDisciplineId }"></div>
                    
                    <button @click="$emit('start')" :disabled="!selectedDisciplineId" 
                        class="start-button absolute inset-0 w-full h-full rounded-[1.5rem] flex flex-col items-center justify-center gap-3 transition-all duration-300 overflow-hidden"
                        :class="!selectedDisciplineId ? 'bg-surface-container-low text-on-surface-muted cursor-not-allowed opacity-70 border border-outline-variant/30' : 'bg-on-surface text-surface hover:scale-[1.02] shadow-2xl cursor-pointer'">
                        
                        <!-- Efeito de radar no fundo -->
                        <div v-if="selectedDisciplineId" class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0,transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div class="w-16 h-16 rounded-full bg-surface/10 flex items-center justify-center backdrop-blur-sm relative z-10 transition-transform duration-300 group-hover:scale-110 group-active:scale-95"
                             :class="{ 'bg-on-surface-muted/10': !selectedDisciplineId }">
                            <i class="pi pi-play ml-1" :class="!selectedDisciplineId ? 'text-2xl' : 'text-3xl'"></i>
                        </div>
                        
                        <div class="relative z-10 text-center">
                            <span class="block font-headline font-bold text-xl tracking-wide">
                                {{ selectedDisciplineId ? 'Iniciar Foco' : 'Selecione uma matéria' }}
                            </span>
                            <span v-if="selectedDisciplineId" class="block text-xs font-sans opacity-70 mt-1 uppercase tracking-widest">
                                Mergulhe nos estudos
                            </span>
                        </div>
                    </button>
                </div>

            </div>
        </div>

        <!-- ─── Área Lateral (Histórico) ─── -->
        <div class="xl:col-span-4 h-[600px] xl:h-auto">
            <FocusHistory />
        </div>

    </div>
</template>

<style scoped>
/* ─── Discipline Cards ─── */
.discipline-card {
    position: relative;
    background: var(--color-surface-container-low);
    border: 1px solid var(--color-outline-variant);
    padding: 1.25rem;
    border-radius: 1.25rem;
    transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
    cursor: pointer;
    overflow: hidden;
}

.discipline-card .glow-effect {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 100px;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
}

.discipline-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.04);
    border-color: var(--color-outline);
    background: var(--color-surface-container);
}

.discipline-card:hover .glow-effect {
    opacity: 0.5;
}

.discipline-card--active {
    background: var(--color-surface-container-lowest);
    border-color: var(--color-primary);
    box-shadow: 0 8px 32px color-mix(in srgb, var(--color-primary) 12%, transparent);
}

.discipline-card--active .glow-effect {
    opacity: 1;
}

.discipline-card--active:hover {
    transform: translateY(-2px);
}

/* ─── Settings Row ─── */
.setting-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem 0;
}

.setting-divider {
    height: 1px;
    background: var(--color-outline-variant);
    opacity: 0.3;
}

.setting-label {
    font-family: var(--font-family-sans);
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--color-on-surface);
}

.setting-controls {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    background: var(--color-surface-container);
    border-radius: 1rem;
    padding: 0.25rem;
    border: 1px solid var(--color-outline-variant);
}

.setting-btn {
    width: 36px;
    height: 36px;
    border-radius: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-on-surface-variant);
    transition: all 0.2s ease;
    cursor: pointer;
    background: transparent;
}

.setting-btn:hover {
    background: var(--color-surface-container-highest);
    color: var(--color-on-surface);
    transform: scale(1.05);
}

.setting-btn:active {
    transform: scale(0.95);
}

.setting-val {
    min-width: 60px;
    text-align: center;
    font-family: var(--font-family-sans);
    font-size: 1rem;
    font-weight: 800;
    color: var(--color-on-surface);
    font-variant-numeric: tabular-nums;
}

.setting-val small {
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--color-on-surface-muted);
    margin-left: 2px;
}
</style>
