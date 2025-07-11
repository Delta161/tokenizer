const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.project.createMany({
    data: [
      {
        title: 'Belgrade Smart Lofts',
        location: 'Belgrade, Serbia',
        issuer: 'SmartDev',
        network: 'Ethereum Sepolia',
        type: 'Residential',
        tokenPrice: 1.0,
        tokensAvailable: 7000,
        totalTokens: 10000,
        fundedPercent: 70,
        status: 'Funding Open',
        launchDate: new Date('2025-06-01'),
        description: 'A premium smart loft complex in Belgrade.',
        tokenAddress: '0xabc123...',
        imageUrl: '/images/belgrade-loft.jpg',
      },
      // add more if needed
    ],
  });
}

main()
  .then(() => {
    console.log('Database seeded');
    prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
