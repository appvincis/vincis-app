import { PgBoss } from 'pg-boss';

// Utiliza DIRECT_URL (conexão direta na porta 5432) pois o pg-boss precisa de suporte
// a Advisory Locks e LISTEN/NOTIFY, os quais falham via pooler do PgBouncer (DATABASE_URL na porta 6543)
const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error('DIRECT_URL ou DATABASE_URL é obrigatória no .env para inicializar o pg-boss.');
}

// Inicializar o pg-boss apontando para o banco do Postgres
export const boss = new PgBoss({
    connectionString: databaseUrl,
    max: 2, // Limitar conexões pool dedicadas ao pg-boss para evitar esgotar o Postgres
});

boss.on('error', (error: any) => {
    console.error('[Queue Engine Error]', error);
});

export async function initQueue() {
    try {
        console.log('[Queue] Inicializando fila pg-boss...');
        await boss.start();
        
        // Garantir que a fila existirá antes do worker tentar consumi-la ou jobs serem inseridos
        await boss.createQueue('edital-extraction');
        
        console.log('[Queue] Fila pg-boss pronta e escutando.');
    } catch (err) {
        console.error('[Queue] Falha ao inicializar pg-boss:', err);
        throw err;
    }
}
