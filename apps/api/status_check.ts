import 'dotenv/config';
import { prisma } from './src/lib/prisma.js';

async function main() {
  const edital = await prisma.edital.findUnique({
    where: { id: 16 },
    select: {
      id: true,
      title: true,
      extractionStatus: true,
      extractionError: true,
      cargo: true
    }
  });
  console.log("Edital status:", edital);

  try {
    const job = await prisma.$queryRawUnsafe(`
      SELECT id, name, state, started_on, completed_on, output 
      FROM pgboss.job 
      WHERE id = '1f529af7-309c-4e2d-a345-14927d1b7d97'
    `);
    console.log("Job status:", JSON.stringify(job, null, 2));
  } catch (err) {
    console.error("Error querying job:", err);
  }
}

await main();
process.exit(0);
