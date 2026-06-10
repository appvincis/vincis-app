export interface SyllabusSegment {
    name: string;
    rawText: string;
    topics?: string[];
    order: number;
    cargo?: string | null;
}

/**
 * Heurística para verificar se o nome extraído é de fato um candidato a disciplina
 */
const isLikelyDisciplineName = (name: string): boolean => {
    const cleaned = name.trim().toLowerCase();
    
    // Lista de palavras-chave comuns de disciplinas em concursos brasileiros
    const keywords = [
        'português', 'portuguesa', 'ingles', 'inglês', 'espanhol', 'raciocínio', 'raciocinio', 'lógico', 'logico',
        'matemática', 'matematica', 'estatística', 'estatistica', 'informática', 'informatica', 'computação', 'computacao',
        'tecnologia', 'dados', 'direito', 'contabilidade', 'administração', 'administracao', 'pública', 'publica', 'geral',
        'constitucional', 'administrativo', 'tributário', 'tributario', 'previdenciário', 'previdenciario', 'financeiro',
        'orçamentário', 'orcamentario', 'auditoria', 'legislação', 'legislacao', 'história', 'historia', 'geografia',
        'física', 'fisica', 'química', 'quimica', 'biologia', 'ciências', 'ciencias', 'redação', 'redacao', 'atualidades',
        'ética', 'etica', 'conhecimentos', 'específicos', 'especificos', 'gerais', 'básicos', 'basicos', 'economia',
        'finanças', 'financas', 'comércio', 'comercio', 'aduaneira', 'aduaneiro', 'sociologia', 'filosofia', 'criminologia',
        'arquivologia', 'geopolítica', 'geopolitica', 'segurança', 'seguranca', 'trânsito', 'transito'
    ];
    
    const words = cleaned.split(/[\s\-\/\&,\(\)]+/);
    if (words.some(w => keywords.includes(w))) {
        return true;
    }
    
    // Aceita também prefixos numerados claros
    if (/^(?:\d+|[IVXLC]+)[\.\-\)]/.test(name.trim())) {
        return true;
    }

    return false;
};

/**
 * Tenta extrair tópicos do bloco de texto por regex (sem IA).
 * Retorna string[] se encontrar padrões claros de listas, ou null caso contrário.
 */
export function tryParseTopics(rawText: string): string[] | null {
    const trimmed = rawText.trim();
    if (!trimmed) return null;

    // Padrão A: Itens numerados em linha ou quebra de linha (ex: "1. Crase 2. Regência" ou "1. Crase\n2. Regência")
    const splitRegex = /(?:\s|^)(?:\d+|[IVXLC]+)[\.\-\)]\s+/g;
    const parts = trimmed.split(splitRegex).map(p => p.trim()).filter(p => p.length > 2);
    
    if (parts.length >= 3 && splitRegex.test(trimmed)) {
        return parts.map(p => p.replace(/[;\.,\s]+$/, '').trim());
    }

    // Padrão B: Lista com marcadores (ex: "• Crase\n• Regência")
    const lines = trimmed.split('\n').map(l => l.trim());
    const bulletParts: string[] = [];
    for (const line of lines) {
        const bulletMatch = line.match(/^[•\-\*\u2013\u2014]\s*(.+)$/);
        if (bulletMatch) {
            bulletParts.push(bulletMatch[1].trim());
        }
    }
    if (bulletParts.length >= 3) {
        return bulletParts.map(p => p.replace(/[;\.,\s]+$/, '').trim());
    }

    // Padrão C: Separados por ponto-e-vírgula em bloco único (ex: "Crase; Regência nominal; Concordância verbal")
    if (trimmed.includes(';') && (trimmed.match(/;/g) || []).length >= 3) {
        const semiParts = trimmed.split(';').map(p => p.trim()).filter(p => p.length > 2);
        if (semiParts.length >= 3) {
            return semiParts.map(p => p.replace(/[\.\s]+$/, '').trim());
        }
    }

    return null;
}

/**
 * Segmenta o conteúdo de texto do edital em blocos baseados em disciplinas.
 */
export function segmentByDiscipline(syllabusText: string, cargo?: string | null): SyllabusSegment[] {
    if (!syllabusText) return [];
    
    const lines = syllabusText.split('\n');
    const segments: SyllabusSegment[] = [];
    let currentSegment: SyllabusSegment | null = null;
    let order = 1;

    // Detecta cabeçalhos e rodapés de páginas do parser PDF para ignorá-los
    const isHeaderOrFooterLine = (line: string): boolean => {
        const trimmed = line.trim();
        if (/^--\s+\d+\s+of\s+\d+\s+--$/i.test(trimmed)) return true;
        if (/^\d+$/i.test(trimmed)) return true;
        if (/MINISTÉRIO DA/i.test(trimmed)) return true;
        if (/SECRETARIA ESPECIAL/i.test(trimmed)) return true;
        if (/RECEITA FEDERAL DO BRASIL/i.test(trimmed)) return true;
        if (/EDITAL\s+–\s+Nº/i.test(trimmed)) return true;
        if (/CONTEÚDO PROGRAMÁTICO/i.test(trimmed)) return true;
        return false;
    };

    const getDisciplineHeader = (line: string): string | null => {
        const trimmed = line.trim();
        if (trimmed.length < 4) return null;
        if (isHeaderOrFooterLine(trimmed)) return null;

        // Padrão 1: "Nome da Disciplina: Conteúdo..." (começa com maiúscula, sem número na primeira parte)
        const colonMatch = trimmed.match(/^([A-ZÁÉÍÓÚÀÂÊÔÃÕÇ][^:\d\n]{3,49}):\s*(.*)$/);
        if (colonMatch) {
            const candidateName = colonMatch[1].trim();
            const ignoreList = ['observação', 'observações', 'atenção', 'importante', 'nota', 'cargo', 'cargos', 'módulo', 'módulos', 'anexo', 'anexos', 'vagas', 'quadro', 'tabela'];
            if (!ignoreList.includes(candidateName.toLowerCase()) && isLikelyDisciplineName(candidateName)) {
                return candidateName;
            }
        }

        // Padrões que exigem linha curta (títulos isolados)
        if (trimmed.length <= 80) {
            // Padrão 2: Linha inteira em caixa alta
            const isUppercase = /^[A-ZÁÉÍÓÚÀÂÊÔÃÕÇ\s\-\/\&,\(\)]{4,60}$/.test(trimmed);
            if (isUppercase) {
                const ignoreList = [
                    'CONHECIMENTOS BÁSICOS', 
                    'CONHECIMENTOS GERAIS', 
                    'CONHECIMENTOS ESPECÍFICOS',
                    'MÓDULO I',
                    'MÓDULO II',
                    'MÓDULO III',
                    'AUDITOR-FISCAL',
                    'ANALISTA-TRIBUTÁRIO',
                    'DA PROVA OBJETIVA',
                    'DA PROVA DISCURSIVA'
                ];
                if (ignoreList.some(item => trimmed.includes(item))) {
                    return null;
                }
                if (isLikelyDisciplineName(trimmed)) {
                    return trimmed;
                }
            }

            // Padrão 3: Título numerado isolado ("1. Língua Portuguesa")
            const numberedMatch = trimmed.match(/^(?:\d+|[IVXLC]+)[\.\-\)]\s*([A-ZÁÉÍÓÚÀÂÊÔÃÕÇ][a-záéíóúàâêôãõçA-ZÁÉÍÓÚÀÂÊÔÃÕÇ\s\-\/]{3,50})\s*$/);
            if (numberedMatch) {
                const candidate = numberedMatch[1].trim();
                if (isLikelyDisciplineName(candidate)) {
                    return candidate;
                }
            }
        }

        return null;
    };

    for (const line of lines) {
        if (isHeaderOrFooterLine(line)) {
            continue;
        }

        const headerName = getDisciplineHeader(line);
        if (headerName) {
            if (currentSegment) {
                segments.push(currentSegment);
            }
            
            let initialText = '';
            const colonIndex = line.indexOf(':');
            // Se foi Padrão 1, removemos o nome do cabeçalho da carga inicial de texto
            if (colonIndex !== -1 && !/^[A-ZÁÉÍÓÚÀÂÊÔÃÕÇ\s\-\/\&,\(\)]{4,60}$/.test(line.trim())) {
                initialText = line.substring(colonIndex + 1).trim();
            }

            currentSegment = {
                name: headerName,
                rawText: initialText,
                order: order++,
                cargo: cargo ?? null
            };
        } else {
            if (currentSegment) {
                if (currentSegment.rawText) {
                    currentSegment.rawText += '\n' + line;
                } else {
                    currentSegment.rawText = line;
                }
            }
        }
    }

    if (currentSegment) {
        segments.push(currentSegment);
    }

    return segments.map(seg => {
        // Junta linhas quebradas do PDF em um parágrafo único contínuo
        seg.rawText = seg.rawText
            .split('\n')
            .map(l => l.trim())
            .filter(l => l.length > 0 && !isHeaderOrFooterLine(l))
            .join(' ');
        
        return seg;
    }).filter(seg => seg.rawText.length > 10);
}
