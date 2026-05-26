<script setup lang="ts">
import { ref, watch } from 'vue'
import { PRESET_COLORS } from '../../../helpers/disciplineColors'

const props = defineProps<{
    showCreateForm: boolean
    isCreating: boolean
}>()

const emit = defineEmits(['create-discipline', 'cancel-create'])

const newName = ref('')
const newDescription = ref('')
const newColor = ref(PRESET_COLORS[0])
const newWeight = ref(3)

watch(() => props.showCreateForm, (val) => {
    if (!val) {
        newName.value = ''
        newDescription.value = ''
        newColor.value = PRESET_COLORS[0]
        newWeight.value = 4
    }
})

function handleCreate() {
    emit('create-discipline', {
        name: newName.value.trim(),
        description: newDescription.value.trim() || undefined,
        color: newColor.value,
        weight: newWeight.value,
    })
}

function handleCancel() {
    emit('cancel-create')
}

</script>

<template>
    <Teleport to="body">
        <Transition name="modal">
            <div
                v-if="showCreateForm"
                class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                @mousedown.self="handleCancel"
            >
                <!-- Backdrop -->
                <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @mousedown="handleCancel" />

                <!-- Modal -->
                <div class="relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                    <!-- Header -->
                    <div class="flex items-center justify-between px-6 pt-6 pb-4">
                        <h2 class="text-xl font-headline font-bold text-on-surface">Nova Disciplina</h2>
                        <button
                            @click="handleCancel"
                            class="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-muted hover:bg-surface-container transition-colors cursor-pointer"
                        >
                            <i class="pi pi-times text-sm"></i>
                        </button>
                    </div>

                    <!-- Body -->
                    <div class="px-6 pb-6 space-y-5">
                        <!-- Name -->
                        <div>
                            <label class="block text-[10px] font-label font-bold uppercase tracking-[0.15em] text-on-surface-muted mb-2">
                                Nome da Disciplina
                            </label>
                            <input
                                v-model="newName"
                                type="text"
                                placeholder="Ex: Projeto Arquitetônico V"
                                class="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface-container-low text-on-surface text-sm font-sans placeholder:text-on-surface-muted/50 focus:outline-none focus:border-primary/50 transition-colors"
                                @keyup.enter="handleCreate"
                                autofocus
                            />
                        </div>

                        <!-- Description -->
                        <div>
                            <label class="block text-[10px] font-label font-bold uppercase tracking-[0.15em] text-on-surface-muted mb-2">
                                Descrição
                            </label>
                            <textarea
                                v-model="newDescription"
                                placeholder="Breve resumo dos objetivos da disciplina..."
                                rows="3"
                                class="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface-container-low text-on-surface text-sm font-sans placeholder:text-on-surface-muted/50 focus:outline-none focus:border-primary/50 transition-colors resize-none"
                            />
                        </div>

                        <!-- Weight slider -->
                        <div>
                            <div class="flex items-center justify-between mb-3">
                                <label class="text-[10px] font-label font-bold uppercase tracking-[0.15em] text-on-surface-muted">
                                    Importância na Grade (Peso)
                                </label>
                                <span class="text-xs font-label font-bold text-primary">Peso {{ newWeight }}</span>
                            </div>
                            <input
                                type="range"
                                v-model.number="newWeight"
                                min="1"
                                max="5"
                                step="1"
                                class="w-full accent-primary cursor-pointer"
                            />
                            <div class="flex justify-between text-[10px] font-label text-on-surface-muted mt-1.5">
                                <span>1</span>
                                <span>2</span>
                                <span>3</span>
                                <span>4</span>
                                <span>5</span>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex gap-3 pt-1">
                            <button
                                @click="handleCancel"
                                class="flex-1 py-3 rounded-xl border border-outline-variant/40 text-sm font-label font-bold text-on-surface-muted hover:bg-surface-container transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                @click="handleCreate"
                                :disabled="isCreating || !newName.trim()"
                                class="flex-1 py-3 rounded-xl bg-primary text-on-primary text-sm font-label font-bold hover:bg-primary-hover transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {{ isCreating ? 'Criando...' : 'Criar Disciplina' }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.2s ease;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
    transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
    transform: translateY(12px);
    opacity: 0;
}
</style>
