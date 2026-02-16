import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetPassword() {
  const newPassword = 'Kobmentality0@';
  const passwordHash = await bcrypt.hash(newPassword, 10);
  
  const user = await prisma.user.update({
    where: { email: 'leminhanhworkingspace@gmail.com' },
    data: { passwordHash }
  });
  
  console.log('✅ Password updated successfully for:', user.email);
  console.log('New password: Kobmentality0@');
  await prisma.$disconnect();
}

resetPassword();
