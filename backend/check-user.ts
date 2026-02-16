import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.user.findUnique({
    where: { email: 'leminhanhworkingspace@gmail.com' },
    select: {
      id: true,
      email: true,
      name: true,
      securityQuestion: true,
      createdAt: true,
    }
  });
  
  console.log('User found:', JSON.stringify(user, null, 2));
  await prisma.$disconnect();
}

checkUser();
