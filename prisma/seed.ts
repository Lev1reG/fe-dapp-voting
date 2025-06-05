import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.staff.createMany({
    data: [
      { name: "Deren Tanaphan", wallet: "0x7a7545e555B42Bfb86478A3e212F2411050F2E83", attendance: 95 },
      { name: "Benaya Imanuela", wallet: "0x9fb54be31250047343D6cCcB0ad294FA4aBC363B", attendance: 78 }
    ]
  });
  console.log("Seeding done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
