// scripts/seed-admin.ts
import { prisma } from "@/lib/prisma";
async function main() {
  await prisma.user.upsert({
    where: { email: "onefirstech@gmail.com" },
    update: { role: "SUPERADMIN" },
    create: {
      fullName: "Super Admin",
      email: "onefirstech@gmail.com",
      passwordHash: "Teamibikunle01?", // you can ignore if you rely solely on Supabase Auth
      role: "SUPERADMIN",
    },
  });
}
main();
