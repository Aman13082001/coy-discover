import { PrismaClient } from "@prisma/client";
import { seedDatabase } from "./seed-lib";

const prisma = new PrismaClient();

seedDatabase(prisma)
  .then(async () => {
    const [profiles, swipes, matches] = await Promise.all([
      prisma.profile.count(),
      prisma.swipe.count(),
      prisma.match.count(),
    ]);
    console.log(`Seeded ${profiles} profiles, ${swipes} swipes, ${matches} matches.`);
  })
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
