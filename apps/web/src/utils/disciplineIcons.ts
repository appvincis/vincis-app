const DISCIPLINE_ICONS: Record<string, string> = {
  'matemática': 'pi-calculator',
  'português': 'pi-book',
  'redação': 'pi-pencil',
  'história': 'pi-globe',
  'geografia': 'pi-map',
  'física': 'pi-atom',
  'química': 'pi-flask',
  'biologia': 'pi-dna',
  'inglês': 'pi-language',
  'informática': 'pi-desktop',
  'direito': 'pi-scale',
  'administração': 'pi-chart-bar',
  'contabilidade': 'pi-calculator',
}

export function getIconForDiscipline(name?: string): string {
  if (!name) return 'pi-clock'
  const lower = name.toLowerCase()
  for (const [key, icon] of Object.entries(DISCIPLINE_ICONS)) {
    if (lower.includes(key)) return icon
  }
  return 'pi-clock'
}
