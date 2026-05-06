<script setup lang="ts">
import { ref } from 'vue'
import { VCard, VButton, VInput } from '../../ui'
import { PRESET_COLORS } from '../../../helpers/disciplineColors'

const newName = ref('')
const newColor = ref('#6366f1')
const newWeight = ref<number>(1.0)
const isCreating = ref(false)

const props = defineProps(['showCreateForm'])
const emit = defineEmits(['create-discipline', 'cancel-create'])

function handleCreateDiscipline() {
    emit('create-discipline', {
        name: newName.value.trim(),
        color: newColor.value,
        weight: newWeight.value
    })

    newName.value = ''
    newColor.value = '#6366f1'
    newWeight.value = 1.0
}

</script>

<template>
    <!-- Create Form -->
    <Transition name="slide-down">
        <VCard v-if="showCreateForm" class="p-6 mb-6 border border-outline-variant/20">
            <h3 class="text-base font-serif font-bold text-on-surface mb-4">Nova Disciplina</h3>
            <div class="flex flex-col gap-4">
                <VInput v-model="newName" label="Nome" placeholder="Ex: Direito Constitucional..." icon="subject" />

                <!-- Color Picker -->
                <div>
                    <p class="text-xs mb-3 font-bold uppercase tracking-widest text-secondary">Cor</p>
                    <div class="flex gap-2 flex-wrap">
                        <button v-for="color in PRESET_COLORS" :key="color" class="color-swatch"
                            :class="{ 'color-swatch--active': newColor === color }" :style="{ background: color }"
                            @click="newColor = color" />
                    </div>
                </div>

                <!-- Weight Slider -->
                <div>
                    <div class="flex justify-between items-center mb-2">
                        <p class="text-xs font-bold uppercase tracking-widest text-secondary">Peso / Importância</p>
                        <span class="weight-badge" :style="{ background: newColor }">{{ newWeight.toFixed(1)
                            }}</span>
                    </div>
                    <input type="range" v-model.number="newWeight" min="0.5" max="5" step="0.5" class="weight-slider" />
                    <div class="flex justify-between text-xs text-secondary mt-1">
                        <span>Baixo</span><span>Alto</span>
                    </div>
                </div>

                <div class="flex gap-3 justify-end pt-2">
                    <VButton variant="secondary" @click="emit('cancel-create')">Cancelar</VButton>
                    <VButton variant="primary" :disabled="isCreating || !newName.trim()"
                        @click="handleCreateDiscipline">
                        {{ isCreating ? 'Criando...' : 'Criar Disciplina' }}
                    </VButton>
                </div>
            </div>
        </VCard>
    </Transition>

</template>

<style scoped>
/* Color Swatches */
.color-swatch {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    transition: transform 0.15s, border-color 0.15s;
}

.color-swatch:hover {
    transform: scale(1.15);
}

.color-swatch--active {
    border-color: var(--on-surface);
    transform: scale(1.15);
}

/* Weight editor */
.weight-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 700;
    color: #fff;
    border-radius: 999px;
    padding: 0.1rem 0.5rem;
    min-width: 2rem;
    line-height: 1.4;
}

.weight-slider {
    width: 100%;
    accent-color: var(--primary);
    cursor: pointer;
}

/* Slide-down transition */
.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.25s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
    opacity: 0;
    transform: translateY(-12px);
}
</style>