import { PrismaClient } from "../src/generated/prisma/client.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.notification.deleteMany();
  await prisma.approvalRecord.deleteMany();
  await prisma.jobDescription.deleteMany();
  await prisma.headcountPlan.deleteMany();
  await prisma.recruitmentOrder.deleteMany();
  await prisma.user.deleteMany();
  await prisma.venture.deleteMany();

  const venture = await prisma.venture.create({
    data: { id: "v-001", name: "Apero", code: "APERO" },
  });
  console.log("✅ Venture:", venture.name);

  const passwordHash = await bcrypt.hash("test123", 10);

  const users = await Promise.all([
    prisma.user.create({
      data: { id: "u-001", email: "HM@apero.vn", passwordHash, fullName: "Hiring Manager", role: "HIRING_MANAGER", ventureId: venture.id },
    }),
    prisma.user.create({
      data: { id: "u-002", email: "CEOVen@apero.vn", passwordHash, fullName: "CEO Venture", role: "CEO_VENTURE", ventureId: venture.id },
    }),
    prisma.user.create({
      data: { id: "u-003", email: "CEOGroup@apero.vn", passwordHash, fullName: "CEO Group", role: "CEO_GROUP", ventureId: null },
    }),
    prisma.user.create({
      data: { id: "u-004", email: "HR@apero.vn", passwordHash, fullName: "HR Officer", role: "HR", ventureId: venture.id },
    }),
  ]);
  console.log(`✅ ${users.length} users created`);

  await Promise.all([
    prisma.headcountPlan.create({ data: { ventureId: venture.id, year: 2026, department: "Engineering", positionName: "Backend Developer", plannedHc: 5, usedHc: 3 } }),
    prisma.headcountPlan.create({ data: { ventureId: venture.id, year: 2026, department: "Engineering", positionName: "Frontend Developer", plannedHc: 4, usedHc: 2 } }),
    prisma.headcountPlan.create({ data: { ventureId: venture.id, year: 2026, department: "Design", positionName: "UI/UX Designer", plannedHc: 2, usedHc: 1 } }),
    prisma.headcountPlan.create({ data: { ventureId: venture.id, year: 2026, department: "Product", positionName: "Product Manager", plannedHc: 2, usedHc: 2 } }),
  ]);
  console.log("✅ 4 headcount plans created");

  console.log("\n🎉 Seed completed!");
  console.log("\n📋 Test accounts:");
  console.log("  HM@apero.vn       / test123  (Hiring Manager)");
  console.log("  CEOVen@apero.vn   / test123  (CEO Venture)");
  console.log("  CEOGroup@apero.vn / test123  (CEO Group)");
  console.log("  HR@apero.vn       / test123  (HR Officer)");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
