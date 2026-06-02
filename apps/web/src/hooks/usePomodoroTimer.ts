import { ref, computed, watch, onUnmounted } from 'vue'

export type PomodoroPhase = 'focus' | 'shortBreak' | 'longBreak'

export interface PomodoroSettings {
    focusTime: number      // em minutos
    breakTime: number      // em minutos
    longBreakTime: number  // em minutos
    cycles: number         // número de ciclos antes da pausa longa
}

const STORAGE_KEY = 'vincis-pomodoro-settings'

const DEFAULT_SETTINGS: PomodoroSettings = {
    focusTime: 25,
    breakTime: 5,
    longBreakTime: 15,
    cycles: 4,
}

function loadSettings(): PomodoroSettings {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            const parsed = JSON.parse(stored)
            return { ...DEFAULT_SETTINGS, ...parsed }
        }
    } catch { /* ignore */ }
    return { ...DEFAULT_SETTINGS }
}

function saveSettings(settings: PomodoroSettings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function usePomodoroTimer() {
    // ─── Settings ─────────────────────────────────────────────────────────────────
    const settings = ref<PomodoroSettings>(loadSettings())

    watch(settings, (newSettings) => {
        saveSettings(newSettings)
    }, { deep: true })

    // ─── State ────────────────────────────────────────────────────────────────────
    const isRunning = ref(false)
    const isPaused = ref(false)
    const currentPhase = ref<PomodoroPhase>('focus')
    const currentCycle = ref(1)
    const timeRemaining = ref(settings.value.focusTime * 60) // em segundos
    const sessionStartedAt = ref<Date | null>(null)
    const totalElapsed = ref(0) // tempo total decorrido em segundos

    let intervalId: ReturnType<typeof setInterval> | null = null

    // ─── Computed ─────────────────────────────────────────────────────────────────
    const totalTimeForPhase = computed(() => {
        switch (currentPhase.value) {
            case 'focus': return settings.value.focusTime * 60
            case 'shortBreak': return settings.value.breakTime * 60
            case 'longBreak': return settings.value.longBreakTime * 60
        }
    })

    const progress = computed(() => {
        const total = totalTimeForPhase.value
        if (total === 0) return 0
        return ((total - timeRemaining.value) / total) * 100
    })

    const formattedTime = computed(() => {
        const minutes = Math.floor(timeRemaining.value / 60)
        const seconds = timeRemaining.value % 60
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    })

    const phaseLabel = computed(() => {
        switch (currentPhase.value) {
            case 'focus': return 'Foco'
            case 'shortBreak': return 'Pausa Curta'
            case 'longBreak': return 'Pausa Longa'
        }
    })

    const phaseColor = computed(() => {
        switch (currentPhase.value) {
            case 'focus': return 'var(--color-primary)'
            case 'shortBreak': return '#22c55e'
            case 'longBreak': return '#3b82f6'
        }
    })

    const isSessionComplete = computed(() => {
        return currentCycle.value > settings.value.cycles
    })

    // ─── Notification ─────────────────────────────────────────────────────────────
    function requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission()
        }
    }

    function sendNotification(title: string, body: string) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body,
                icon: '/favicon.png',
                badge: '/favicon.png',
            })
        }

        // Play a short audio beep
        try {
            const audioCtx = new AudioContext()
            const oscillator = audioCtx.createOscillator()
            const gainNode = audioCtx.createGain()
            oscillator.connect(gainNode)
            gainNode.connect(audioCtx.destination)
            oscillator.frequency.value = 800
            oscillator.type = 'sine'
            gainNode.gain.value = 0.3
            oscillator.start()
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5)
            oscillator.stop(audioCtx.currentTime + 0.5)
        } catch { /* audio not supported */ }
    }

    // ─── Phase Transition ─────────────────────────────────────────────────────────
    function transitionToNextPhase() {
        if (currentPhase.value === 'focus') {
            // Acabou um ciclo de foco
            if (currentCycle.value >= settings.value.cycles) {
                // Último ciclo → pausa longa
                currentPhase.value = 'longBreak'
                timeRemaining.value = settings.value.longBreakTime * 60
                sendNotification('Pausa Longa!', `Ótimo trabalho! Descanse ${settings.value.longBreakTime} minutos.`)
            } else {
                // Ciclo intermediário → pausa curta
                currentPhase.value = 'shortBreak'
                timeRemaining.value = settings.value.breakTime * 60
                sendNotification('Pausa Curta!', `Descanse ${settings.value.breakTime} minutos.`)
            }
        } else {
            // Acabou uma pausa → próximo foco
            if (currentPhase.value === 'longBreak') {
                // Acabou a pausa longa → sessão completa
                currentCycle.value = settings.value.cycles + 1
                stopTimer()
                sendNotification('Sessão Completa! 🎉', 'Parabéns! Você completou todos os ciclos.')
                return
            }

            currentCycle.value++
            currentPhase.value = 'focus'
            timeRemaining.value = settings.value.focusTime * 60
            sendNotification('Hora de Focar!', `Ciclo ${currentCycle.value} de ${settings.value.cycles}. Vamos lá!`)
        }
    }

    // ─── Timer Control ────────────────────────────────────────────────────────────
    function tick() {
        if (timeRemaining.value <= 0) {
            transitionToNextPhase()
            return
        }
        timeRemaining.value--
        totalElapsed.value++
    }

    function startTimer() {
        if (intervalId) return
        stopTimer() // reset

        requestNotificationPermission()

        isRunning.value = true
        isPaused.value = false
        currentPhase.value = 'focus'
        currentCycle.value = 1
        timeRemaining.value = settings.value.focusTime * 60
        sessionStartedAt.value = new Date()
        totalElapsed.value = 0

        intervalId = setInterval(tick, 1000)
    }

    function pauseTimer() {
        if (!isRunning.value || isPaused.value) return
        isPaused.value = true
        if (intervalId) {
            clearInterval(intervalId)
            intervalId = null
        }
    }

    function resumeTimer() {
        if (!isRunning.value || !isPaused.value) return
        isPaused.value = false
        intervalId = setInterval(tick, 1000)
    }

    function skipPhase() {
        if (!isRunning.value) return
        transitionToNextPhase()
    }

    function stopTimer() {
        if (intervalId) {
            clearInterval(intervalId)
            intervalId = null
        }
        isRunning.value = false
        isPaused.value = false
    }

    function resetTimer() {
        stopTimer()
        currentPhase.value = 'focus'
        currentCycle.value = 1
        timeRemaining.value = settings.value.focusTime * 60
        sessionStartedAt.value = null
        totalElapsed.value = 0
    }

    // ─── Cleanup ──────────────────────────────────────────────────────────────────
    onUnmounted(() => {
        if (intervalId) {
            clearInterval(intervalId)
            intervalId = null
        }
    })

    return {
        // Settings
        settings,

        // State
        isRunning,
        isPaused,
        currentPhase,
        currentCycle,
        timeRemaining,
        sessionStartedAt,
        totalElapsed,

        // Computed
        totalTimeForPhase,
        progress,
        formattedTime,
        phaseLabel,
        phaseColor,
        isSessionComplete,

        // Actions
        startTimer,
        pauseTimer,
        resumeTimer,
        skipPhase,
        stopTimer,
        resetTimer,
    }
}
