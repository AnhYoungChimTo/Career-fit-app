"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const marketing_careers_seed_1 = require("../../prisma/seeds/marketing-careers.seed");
const international_relations_careers_seed_1 = require("../../prisma/seeds/international-relations-careers.seed");
const finance_careers_seed_1 = require("../../prisma/seeds/finance-careers.seed");
const law_careers_seed_1 = require("../../prisma/seeds/law-careers.seed");
const prisma = new client_1.PrismaClient();
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
    await (0, marketing_careers_seed_1.seedMarketingCareers)();
    console.log('');
    // Seed international relations careers
    console.log('🌍 Seeding International Relations Careers...');
    await (0, international_relations_careers_seed_1.seedInternationalRelationsCareers)();
    console.log('');
    // Seed finance careers
    console.log('💰 Seeding Finance & Banking Careers...');
    await (0, finance_careers_seed_1.seedFinanceCareers)();
    console.log('');
    // Seed law & legal careers
    console.log('⚖️ Seeding Law & Legal Careers...');
    await (0, law_careers_seed_1.seedLawCareers)();
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
