function levenshteinDistance(s1: string, s2: string): number {
    if (s1.length < s2.length) {
        const temp = s1; s1 = s2; s2 = temp;
    }
    const len1 = s1.length;
    const len2 = s2.length;
    if (len2 === 0) return len1;

    let prevRow = Array(len2 + 1);
    let currRow = Array(len2 + 1);

    for (let i = 0; i <= len2; i++) {
        prevRow[i] = i;
    }

    for (let i = 1; i <= len1; i++) {
        currRow[0] = i;
        for (let j = 1; j <= len2; j++) {
            const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
            currRow[j] = Math.min(
                prevRow[j] + 1, // deletion
                currRow[j - 1] + 1, // insertion
                prevRow[j - 1] + indicator // substitution
            );
        }
        // Reaproveitar referências de array
        const temp = prevRow;
        prevRow = currRow;
        currRow = temp;
    }
    return prevRow[len2];
}

function getSimilarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    if (longer.length === 0) return 1.0;
    return (longer.length - levenshteinDistance(s1, s2)) / longer.length;
}

function normalizeText(text: string): string {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ');
}

export function validateExtractedTopics(
    topics: string[],
    originalText: string,
    disciplineName: string
): { valid: string[]; dropped: string[]; warnings: string[] } {
    const valid: string[] = [];
    const dropped: string[] = [];
    const warnings: string[] = [];

    if (!topics || topics.length === 0) {
        return { valid, dropped, warnings };
    }

    const normalizedOriginal = normalizeText(originalText);

    for (let topic of topics) {
        topic = topic.trim();
        if (topic.length < 3) {
            dropped.push(`${topic} (muito curto)`);
            continue;
        }
        if (topic.length > 1500) {
            dropped.push(`${topic.substring(0, 30)}... (muito longo, provável parágrafo corrido)`);
            continue;
        }

        // 1. Verificar se o tópico está contido no texto ou se a maior parte de suas palavras significativas está
        const normalizedTopic = normalizeText(topic);
        
        // Remove numeração inicial para a busca de palavras-chave, e.g. "1. Crase" -> "crase"
        const cleanTopicForSearch = normalizedTopic.replace(/^(?:\d+|[ivxlc]+)[\s\.\-\)]+/, '').trim();
        const topicWords = cleanTopicForSearch.split(/\s+/).filter(w => w.length > 3);
        
        if (topicWords.length > 0) {
            let matches = 0;
            for (const word of topicWords) {
                if (normalizedOriginal.includes(word)) {
                    matches++;
                }
            }
            const matchRatio = matches / topicWords.length;
            // Se menos de 50% das palavras significativas existirem no texto bruto, consideramos alucinação
            if (matchRatio < 0.5) {
                dropped.push(`${topic} (falha na validação de origem - suspeita de alucinação: ${Math.round(matchRatio * 100)}% de match)`);
                continue;
            }
        }

        // 2. Deduplicação fuzzy contra itens já aceitos
        let isDuplicate = false;
        for (const accepted of valid) {
            const similarity = getSimilarity(normalizedTopic, normalizeText(accepted));
            if (similarity > 0.85) {
                isDuplicate = true;
                dropped.push(`${topic} (duplicata de "${accepted}" - similaridade: ${Math.round(similarity * 100)}%)`);
                break;
            }
        }

        if (!isDuplicate) {
            valid.push(topic);
        }
    }

    // 3. Validação de contagem
    // Estimativa simples de tópicos no rawText: contagem de delimitadores comuns
    const estimatedCount = (originalText.match(/(?:\s|^)(?:\d+|[IVXLC]+)[\.\-\)]\s+/g) || []).length || 
                           (originalText.match(/^[•\-\*\u2013\u2014]/gm) || []).length ||
                           (originalText.match(/;/g) || []).length;
    
    if (estimatedCount > 3 && Math.abs(valid.length - estimatedCount) > Math.max(5, estimatedCount * 0.5)) {
        warnings.push(`Divergência na contagem de tópicos para a matéria "${disciplineName}": estimado ${estimatedCount}, extraído ${valid.length}`);
    }

    return { valid, dropped, warnings };
}
