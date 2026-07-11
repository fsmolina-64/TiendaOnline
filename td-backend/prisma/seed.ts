import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.warehouse.findFirst();
  if (existing) {
    console.log('Ya existe una bodega registrada, saltando seed.');
    return;
  }

  await prisma.warehouse.create({
    data: {
      name: 'Bodega Principal',
      address: 'Av. de las Américas y Cornelio Merchán, Cuenca, Ecuador',
      latitude: -2.8947,
      longitude: -79.0193,
      isActive: true,
    },
  });

  console.log('✓ Bodega principal creada en Cuenca.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
