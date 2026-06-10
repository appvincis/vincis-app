import { ref, watch } from 'vue'
import { api } from '../lib/axios'
import type { Ref, ComputedRef } from 'vue'

interface DiagnosticResult {
  isEmpty?: boolean
  highlightDiscipline?: string
  retentionRate?: string
  fatigueDiscipline?: string
  recommendationText?: string
}

const STORAGE_KEY = 'vincis_ai_diagnostic_data'

export function useDiagnostic(isPremiumUser: ComputedRef<boolean>) {
  const isGenerating = ref(false)
  const data = ref<DiagnosticResult | null>(null)

  // Load persisted data from localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      data.value = JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to parse stored diagnostic data', e)
  }

  // Auto-persist on change
  watch(data, (newValue) => {
    try {
      if (newValue) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newValue))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    } catch (e) {
      console.error('Failed to save diagnostic data to localStorage', e)
    }
  }, { deep: true })

  async function generate() {
    if (!isPremiumUser.value) return
    isGenerating.value = true
    try {
      const res = await api.get('/ai/diagnostic')
      data.value = res.data
    } catch (error) {
      console.error('Failed to generate diagnostic:', error)
    } finally {
      isGenerating.value = false
    }
  }

  return {
    diagnosticData: data,
    isGeneratingDiagnostic: isGenerating,
    handleGenerateDiagnostic: generate,
  }
}
