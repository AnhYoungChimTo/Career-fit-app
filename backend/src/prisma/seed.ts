import { PrismaClient } from '@prisma/client';
import { seedMarketingCareers } from '../../prisma/seeds/marketing-careers.seed';
import { seedInternationalRelationsCareers } from '../../prisma/seeds/international-relations-careers.seed';
import { seedFinanceCareers } from '../../prisma/seeds/finance-careers.seed';
import { seedLawCareers } from '../../prisma/seeds/law-careers.seed';
import { seedSalesCareers } from '../../prisma/seeds/sales-careers.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  console.log('');

  // Option to clear existing careers (uncomment if needed)
  // const clearExisting = process.argv.includes('--clear');
  // if (clearExisting) {
  //   await prisma.career.deleteMany();
  //   console.log('✨ Cleared existing careers\n');
  // }

  // Seed marketing careers
  console.log('📊 Seeding Marketing Careers...');
  await seedMarketingCareers();

  console.log('');

  // Seed international relations careers
  console.log('🌍 Seeding International Relations Careers...');
  await seedInternationalRelationsCareers();

  console.log('');

  // Seed finance careers
  console.log('💰 Seeding Finance & Banking Careers...');
  await seedFinanceCareers();

  console.log('');

  // Seed law & legal careers
  console.log('⚖️ Seeding Law & Legal Careers...');
  await seedLawCareers();

  console.log('');

  // Seed sales careers
  console.log('💼 Seeding Sales Careers...');
  await seedSalesCareers();

  console.log('');
  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
