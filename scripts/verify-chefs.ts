import { prisma } from "../lib/prisma";

async function main() {
  const result = await prisma.dashboardUser.updateMany({
    where: { role: "CHEF", isVerified: false },
    data: { isVerified: true },
  });
  console.log(`✅ Updated ${result.count} chef(s) to isVerified: true`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
