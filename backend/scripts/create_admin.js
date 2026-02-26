#!/usr/bin/env node
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const argv = require('minimist')(process.argv.slice(2));
  const email = argv.email || argv.e;
  const password = argv.password || argv.p || 'ChangeMe123!';
  const name = argv.name || 'Administrator';

  if (!email) {
    console.error('Usage: node scripts/create_admin.js --email admin@example.com [--password secret] [--name "Admin"]');
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('User already exists:', existing.id);
    process.exit(0);
  }

  const SALT_ROUNDS = 12;
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('Admin user created:');
  console.log({ id: user.id, email: user.email, name: user.name });
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
