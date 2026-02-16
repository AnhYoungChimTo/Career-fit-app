import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function countCareers() {
  const total = await prisma.career.count();
  console.log(`\n📊 Total careers in database: ${total}\n`);

  await prisma.$disconnect();
}

countCareers();
