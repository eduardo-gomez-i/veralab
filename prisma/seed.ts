import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const dentistaPassword = await bcrypt.hash('demo123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  const dentista = await prisma.user.upsert({
    where: { username: 'dentista' },
    update: {},
    create: {
      username: 'dentista',
      password: dentistaPassword,
      role: 'dentista',
      name: 'Dr. Juan Pérez',
    },
  });

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      role: 'admin',
      name: 'Administrador del Sistema',
    },
  });

  console.log({ dentista, admin });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
