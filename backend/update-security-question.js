const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function updateSecurityQuestion() {
  const email = 'leminhanhworkingspace@gmail.com';
  const newQuestion = 'What city were you born in?';
  const newAnswer = 'hanoi';

  // Hash the new security answer
  const securityAnswerHash = await bcrypt.hash(newAnswer.toLowerCase().trim(), 10);

  // Update the user
  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      securityQuestion: newQuestion,
      securityAnswerHash: securityAnswerHash,
    },
    select: {
      email: true,
      securityQuestion: true,
      name: true,
    },
  });

  console.log('✅ Security question updated successfully!');
  console.log(JSON.stringify(updatedUser, null, 2));

  await prisma.$disconnect();
}

updateSecurityQuestion().catch(console.error);
