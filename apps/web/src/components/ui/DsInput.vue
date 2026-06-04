<!-- components/ui/DsInput.vue -->
<script setup>
import { computed } from 'vue'
import InputText from 'primevue/inputtext'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:modelValue'])

const iconClass = computed(() => {
  if (!props.icon) return '';
  if (props.icon.startsWith('pi-') || props.icon.startsWith('pi ')) {
    return props.icon;
  }
  const mapping = {
    'user': 'pi-user',
    'person': 'pi-user',
    'mail': 'pi-envelope',
    'lock': 'pi-lock',
    'subject': 'pi-file',
    'edit_note': 'pi-pencil',
    'notes': 'pi-align-left'
  };
  return mapping[props.icon] || `pi-${props.icon}`;
})
</script>

<template>
  <div class="ds-input-group" :class="{ 'ds-input-group--disabled': disabled }">
    <label v-if="label" class="ds-input-label">
      {{ label }}
      <span v-if="required" class="ds-input-label__required">*</span>
    </label>
    
    <div class="ds-input-wrapper">
      <i v-if="icon" class="ds-input-icon pi" :class="iconClass"></i>
      <InputText 
        :type="type"
        :modelValue="modelValue"
        @update:modelValue="$emit('update:modelValue', $event)"
        :placeholder="placeholder"
        :disabled="disabled"
        class="ds-input-field"
        :class="{ 'ds-input-field--has-icon': icon }"
        v-bind="$attrs"
      />
    </div>
  </div>
</template>

<style scoped>
.ds-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.ds-input-label {
  font-family: var(--ds-font-sans);
  font-size: 0.625rem;
  font-weight: 700;
  color: var(--on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 0.15em;
}

.ds-input-label__required {
  color: var(--error);
  margin-left: 0.125rem;
}

.ds-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.ds-input-icon {
  position: absolute;
  left: 0.875rem;
  font-size: 1.25rem;
  color: var(--outline);
  pointer-events: none;
  z-index: 1;
}

.ds-input-field {
  width: 100% !important;
}

.ds-input-field--has-icon {
  padding-left: 2.75rem !important;
}

.ds-input-group--disabled {
  opacity: 0.6;
}
</style>