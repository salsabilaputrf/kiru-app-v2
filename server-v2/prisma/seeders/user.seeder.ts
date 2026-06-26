import { prisma } from '../../src/lib/prisma';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

async function main() {
  console.log('Data user awal Kiru App v2...');

  // Buat branch utama terlebih dahulu jika belum ada
  const mainBranch = await prisma.branch.upsert({
    where:  { id: 1 },
    update: {},
    create: { name: 'Cabang Utama', address: 'Bandung, Jawa Barat' },
  });

  // Owner — akses penuh ke semua cabang (branchId: null)
  await prisma.user.upsert({
    where:  { username: 'owner12345' },
    update: {},
    create: {
      username: 'owner12345',
      password: await bcrypt.hash('SuperAdmin@321', SALT_ROUNDS),
      role:     'owner',
      branchId: null,
    },
  });

  // Admin — hanya akses ke Cabang Utama
  await prisma.user.upsert({
    where:  { username: 'budi.santoso' },
    update: {},
    create: {
      username: 'budi.santoso',
      password: await bcrypt.hash('Admin@1234', SALT_ROUNDS),
      role:     'admin',
      branchId: mainBranch.id,
    },
  });

  // Kasir — hanya akses ke Cabang Utama
  await prisma.user.upsert({
    where:  { username: 'dewi.rahayu' },
    update: {},
    create: {
      username: 'dewi.rahayu',
      password: await bcrypt.hash('Kasir@1234', SALT_ROUNDS),
      role:     'kasir',
      branchId: mainBranch.id,
    },
  });

  console.log('Seeding selesai. Akun berikut sudah tersedia:');
  console.table([
    { username: 'owner12345',  role: 'owner', branch: 'Semua cabang' },
    { username: 'budi.santoso', role: 'admin', branch: 'Cabang Utama' },
    { username: 'dewi.rahayu', role: 'kasir', branch: 'Cabang Utama' },
  ]);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });