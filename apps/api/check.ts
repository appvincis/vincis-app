import 'dotenv/config';
import { prisma } from './src/lib/prisma.js';

async function main() {
  const editais = await prisma.edital.findMany({ select: { id: true, title: true, parsedContent: true } });
  console.log(editais.map(e => ({ id: e.id, title: e.title, hasContent: !!e.parsedContent, contentLen: e.parsedContent?.length })));
}
await main();
process.exit(0);
