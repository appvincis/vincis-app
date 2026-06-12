import { z } from 'zod';
import { generateObjectWithFallback, TIMEOUT_SIMPLE_MS } from './edital.controller.js';

/**
 * Analisa as primeiras páginas de um edital para extrair a lista de cargos oferecidos.
 * @param parsedPages Mapa de número de página para texto extraído
 * @returns Array com os nomes dos cargos encontrados
 */
export async function extractCargosFromPages(parsedPages: Record<number, string> | any): Promise<string[]> {
    if (!parsedPages || typeof parsedPages !== 'object') {
        return [];
    }

    // Pegar as primeiras 15 páginas ou menos
    let textChunk = '';
    const keys = Object.keys(parsedPages).map(Number).sort((a, b) => a - b);
    
    // Filtra para as primeiras 15 páginas
    const firstPages = keys.slice(0, 15);
    for (const pageNum of firstPages) {
        if (parsedPages[pageNum]) {
            textChunk += `\n--- PÁGINA ${pageNum} ---\n${parsedPages[pageNum]}`;
        }
    }

    if (!textChunk.trim()) {
        return [];
    }

    try {
        const result = await generateObjectWithFallback({
            schema: z.object({
                cargos: z.array(z.string()).describe("Lista de nomes de cargos, especialidades ou postos oferecidos no edital. Retorne apenas o nome limpo.")
            }),
            system: `Você é um especialista em análise de editais de concursos públicos.
Sua tarefa é ler as primeiras páginas de um edital e extrair EXATAMENTE quais são os cargos, empregos ou especialidades oferecidos.
Retorne um array com o nome de cada cargo. Não invente cargos que não estão listados.
Se não encontrar nenhum cargo, retorne um array vazio.`,
            prompt: `Extraia a lista de cargos do trecho do edital abaixo:\n\n${textChunk}`,
            temperature: 0.1,
            timeoutMs: TIMEOUT_SIMPLE_MS
        });

        const obj = result.object as { cargos: string[] };
        return obj.cargos || [];
    } catch (error) {
        console.error('Erro ao extrair cargos nas primeiras páginas:', error);
        return [];
    }
}
