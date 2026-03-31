import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está configurado. Define DATABASE_URL antes de ejecutar el seed.')
  }

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
    if (e && typeof e === 'object' && 'code' in e && (e as any).code === 'P2021') {
      console.error('No existen las tablas en la base de datos. Ejecuta primero: prisma migrate deploy');
    }
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
