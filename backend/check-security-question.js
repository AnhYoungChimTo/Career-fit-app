const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSecurityQuestion() {
  const user = await prisma.user.findUnique({
    where: { email: 'leminhanhworkingspace@gmail.com' },
    select: {
      email: true,
      securityQuestion: true,
      name: true
    }
  });

  console.log('User details:');
  console.log(JSON.stringify(user, null, 2));

  await prisma.$disconnect();
}

checkSecurityQuestion().catch(console.error);
