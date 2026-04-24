import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { api } from '../lib/axios'

export const useStudyPlanStore = defineStore('study-plan', () => {
    const activePlanId = ref<number | null>(null)
    const activePlanName = ref<string | null>(null)

    const hasActivePlan = computed(() => activePlanId.value !== null)

    async function selectPlan(planId: number, planName: string) {
        await api.post('/study-plans/select', { studyPlanId: planId })
        activePlanId.value = planId
        activePlanName.value = planName
    }

    function clearPlan() {
        activePlanId.value = null
        activePlanName.value = null
    }

    return { activePlanId, activePlanName, hasActivePlan, selectPlan, clearPlan }
}, { persist: true })
