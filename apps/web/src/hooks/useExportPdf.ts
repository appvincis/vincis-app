import { ref, nextTick } from 'vue'
import type { Ref } from 'vue'
// @ts-ignore
import html2pdf from 'html2pdf.js'
import type { FocusSession } from './useFocusSessions'

export interface PdfReportData {
  totalStudyHours: string
  totalSessions: number
  completedSessions: number
  completionRate: number
  totalErrors: number
  lastDayStats: string
  topMistakes: [string, number][]
}

const PDF_OPTIONS: any = {
  margin: 15,
  filename: 'Resumo_Desempenho_Vincis.pdf',
  image: { type: 'png', quality: 0.98 },
  html2canvas: { scale: 2, useCORS: true },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
}

export function useExportPdf(
  focusSessions: Ref<FocusSession[] | undefined>,
  errorLogs: Ref<any[] | undefined>,
) {
  const isExporting = ref(false)
  const pdfData = ref<PdfReportData>({
    totalStudyHours: '0',
    totalSessions: 0,
    completedSessions: 0,
    completionRate: 0,
    totalErrors: 0,
    lastDayStats: 'Nenhum estudo registrado.',
    topMistakes: [],
  })

  function buildPdfData() {
    const sessions = focusSessions.value || []
    const errors = errorLogs.value || []

    const totalStudySeconds = sessions.reduce((acc, s) => acc + (s.duration ?? 0), 0)
    const totalSessions = sessions.length
    const completedSessions = sessions.filter(s => s.isCompleted).length

    pdfData.value.totalStudyHours = (totalStudySeconds / 3600).toFixed(1)
    pdfData.value.totalSessions = totalSessions
    pdfData.value.completedSessions = completedSessions
    pdfData.value.completionRate = totalSessions
      ? Math.round((completedSessions / totalSessions) * 100)
      : 0
    pdfData.value.totalErrors = errors.length

    // Last day stats
    pdfData.value.lastDayStats = 'Nenhum estudo registrado.'
    if (sessions.length > 0) {
      const sorted = [...sessions].sort(
        (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
      )
      const lastDate = sorted[0]!.startedAt.slice(0, 10)
      const lastDaySessions = sessions.filter(s => s.startedAt.startsWith(lastDate))
      const lastDaySeconds = lastDaySessions.reduce((acc, s) => acc + (s.duration ?? 0), 0)

      const hrs = Math.floor(lastDaySeconds / 3600)
      const mins = Math.floor((lastDaySeconds % 3600) / 60)
      const timeStr = hrs > 0 ? `${hrs}h e ${mins}min` : `${mins}min`
      const [year, month, day] = lastDate.split('-')
      pdfData.value.lastDayStats = `${day}/${month}/${year}: ${timeStr} de estudo em ${lastDaySessions.length} sessões.`
    }

    // Top 3 mistakes
    const diagMap = new Map<string, number>()
    for (const e of errors) {
      const key = e.diagnostico || 'Sem diagnóstico'
      diagMap.set(key, (diagMap.get(key) ?? 0) + 1)
    }
    pdfData.value.topMistakes = Array.from(diagMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
  }

  async function exportPdf() {
    if (isExporting.value) return
    isExporting.value = true

    try {
      buildPdfData()
      await nextTick()

      const element = document.getElementById('pdf-report-template')
      if (!element) return

      await html2pdf().from(element).set(PDF_OPTIONS).save()
    } catch (error) {
      console.error('Failed to generate PDF:', error)
    } finally {
      isExporting.value = false
    }
  }

  return {
    isExporting,
    pdfData,
    handleExportSummary: exportPdf,
  }
}
