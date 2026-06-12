/**
 * Localiza dinamicamente as páginas do Conteúdo Programático para um Cargo específico.
 * @param parsedPages Mapa de páginas do edital
 * @param cargo Nome do cargo
 * @returns String contendo apenas as páginas relevantes (com fallback)
 */
export const locateRoleSyllabusPages = (parsedPages: Record<number, string> | any, cargo: string): string => {
    if (!parsedPages || typeof parsedPages !== 'object') return '';
    const keys = Object.keys(parsedPages).map(Number).sort((a, b) => a - b);
    if (keys.length === 0) return '';

    // Normaliza o nome do cargo para busca
    const normalizedCargo = cargo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const cargoKeywords = normalizedCargo.split(' ').filter(w => w.length > 3);

    let startPage = -1;
    let endPage = -1;
    
    // Procura nas páginas do final para o começo (o Anexo geralmente fica no final)
    for (let i = keys.length - 1; i >= 0; i--) {
        const pageNum = keys[i];
        const text = parsedPages[pageNum] || '';
        const normalizedText = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

        // Heurística de Conteúdo Programático
        const hasSyllabusKeyword = ['conteudo programatico', 'conhecimentos especificos', 'programa das disciplinas'].some(kw => normalizedText.includes(kw));
        
        // Verifica se a página menciona o cargo fortemente
        const hasCargoMatch = cargoKeywords.length > 0 && cargoKeywords.every(kw => normalizedText.includes(kw));

        if (hasSyllabusKeyword && hasCargoMatch) {
            startPage = pageNum;
            // Estima o tamanho do anexo do cargo (geralmente de 1 a 3 páginas)
            endPage = Math.min(pageNum + 3, keys[keys.length - 1]);
            break;
        }
    }

    if (startPage === -1) {
        // Fallback: se não achar a página exata do cargo com as palavras chaves,
        // procura a primeira página que tenha 'conteudo programatico'
        for (const pageNum of keys) {
            const text = parsedPages[pageNum] || '';
            const normalizedText = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            if (['conteudo programatico', 'conhecimentos especificos'].some(kw => normalizedText.includes(kw))) {
                startPage = pageNum;
                endPage = Math.min(pageNum + 15, keys[keys.length - 1]); // Pega um bloco maior para o LLM fatiar
                break;
            }
        }
    }

    if (startPage === -1) {
        // Fallback final: junta tudo se o edital for pequeno ou pega a metade final
        if (keys.length <= 20) {
            startPage = keys[0];
            endPage = keys[keys.length - 1];
        } else {
            startPage = Math.floor(keys.length / 2);
            endPage = keys[keys.length - 1];
        }
    }

    let chunk = '';
    for (let p = startPage; p <= endPage; p++) {
        if (parsedPages[p]) {
            chunk += `\n--- PÁGINA ${p} ---\n${parsedPages[p]}`;
        }
    }

    return chunk;
};
