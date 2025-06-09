const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../lib/auth');

const prisma = new PrismaClient();

async function main() {
  try {
    // Create test analyst
    const analyst = await prisma.analyst.create({
      data: {
        name: 'Test Analyst',
        email: 'analyst@test.com',
        password: hashPassword('test123'),
      },
    });

    console.log('Created test analyst:', analyst);
  } catch (error) {
    console.error('Error creating analyst:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
