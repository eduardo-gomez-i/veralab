import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está configurado. Define DATABASE_URL antes de ejecutar el seed.')
  }

  const adminUsername = process.env.SEED_ADMIN_USERNAME || 'admin';
  const adminName = process.env.SEED_ADMIN_NAME || 'Administrador del Sistema';
  const adminPasswordPlain = process.env.SEED_ADMIN_PASSWORD;
  const minPasswordLengthRaw = process.env.SEED_ADMIN_PASSWORD_MIN_LENGTH ?? '12';
  const minPasswordLength = Number.isFinite(Number(minPasswordLengthRaw))
    ? Math.max(0, Math.trunc(Number(minPasswordLengthRaw)))
    : 12;

  if (!adminPasswordPlain || adminPasswordPlain.length < minPasswordLength) {
    throw new Error(
      `SEED_ADMIN_PASSWORD es requerido y debe tener al menos ${minPasswordLength} caracteres para crear el admin.`
    );
  }

  const adminPassword = await bcrypt.hash(adminPasswordPlain, 10);
  const admin = await prisma.user.upsert({
    where: { username: adminUsername },
    update: {
      name: adminName,
      password: adminPassword,
    },
    create: {
      username: adminUsername,
      password: adminPassword,
      role: 'admin',
      name: adminName,
    },
  });

  console.log({
    admin: {
      id: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role,
    },
  });
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
