<script setup lang="ts">
import { PRESET_COLORS } from '../../../helpers/disciplineColors'

const model = defineModel<string>({ required: true })
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <label class="text-[10px] font-label font-bold uppercase tracking-[0.15em] text-on-surface-muted">
        Cor da Disciplina
      </label>
      <!-- Live preview -->
      <div class="w-5 h-5 rounded-md ring-2 ring-outline-variant/30 transition-colors duration-150"
        :style="{ backgroundColor: model }" />
    </div>

    <!-- 10 presets + 1 custom slot -->
    <div class="flex gap-2 flex-wrap">
      <button v-for="color in PRESET_COLORS" :key="color" type="button"
        class="w-7 h-7 rounded-lg flex items-center justify-center ring-2 transition-all duration-150 cursor-pointer"
        :class="model === color
          ? 'ring-on-surface scale-110 shadow-md'
          : 'ring-transparent hover:scale-105'" :style="{ backgroundColor: color }" :title="color"
        @click="model = color">
        <i v-if="model === color" class="pi pi-check text-white"
          style="font-size:0.55rem; filter:drop-shadow(0 1px 1px rgba(0,0,0,0.4))" />
      </button>

      <!-- Custom colour slot -->
      <label class="w-7 h-7 rounded-lg border-2 border-dashed border-outline-variant/60
               flex items-center justify-center cursor-pointer relative
               hover:border-primary/60 transition-colors duration-150"
        :class="!PRESET_COLORS.includes(model) ? 'border-solid border-on-surface/40' : ''"
        :style="!PRESET_COLORS.includes(model) ? { backgroundColor: model } : {}" title="Cor personalizada">
        <input type="color" v-model="model" class="sr-only" />
        <i v-if="PRESET_COLORS.includes(model)" class="pi pi-palette text-on-surface-muted" style="font-size:0.6rem" />
        <i v-else class="pi pi-check text-white"
          style="font-size:0.55rem; filter:drop-shadow(0 1px 1px rgba(0,0,0,0.4))" />
      </label>
    </div>

    <!-- Hex readout -->
    <p class="mt-1.5 text-[10px] font-mono text-on-surface-muted">{{ model.toUpperCase() }}</p>
  </div>
</template>
