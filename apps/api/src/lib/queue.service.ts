import { PgBoss } from 'pg-boss';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error('DATABASE_URL é obrigatória no .env para inicializar o pg-boss.');
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
        console.log('[Queue] Fila pg-boss pronta e escutando.');
    } catch (err) {
        console.error('[Queue] Falha ao inicializar pg-boss:', err);
        throw err;
    }
}
