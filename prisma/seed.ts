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

  // ===================== VENTURES =====================
  const ventures = await Promise.all([
    prisma.venture.create({ data: { id: "v-001", name: "Apero Games", code: "APG" } }),
    prisma.venture.create({ data: { id: "v-002", name: "Apero Ads", code: "APA" } }),
    prisma.venture.create({ data: { id: "v-003", name: "Apero AI", code: "APAI" } }),
  ]);
  console.log("✅ 3 ventures created");

  const passwordHash = await bcrypt.hash("test123", 10);

  // ===================== USERS =====================
  const users = await Promise.all([
    // Apero Games
    prisma.user.create({ data: { id: "u-001", email: "HM@apero.vn", passwordHash, fullName: "Nguyen Van Trung", role: "HIRING_MANAGER", ventureId: "v-001" } }),
    prisma.user.create({ data: { id: "u-002", email: "CEOVen@apero.vn", passwordHash, fullName: "Le Minh Duc", role: "CEO_VENTURE", ventureId: "v-001" } }),
    // Group level
    prisma.user.create({ data: { id: "u-003", email: "CEOGroup@apero.vn", passwordHash, fullName: "Tran Quoc Anh", role: "CEO_GROUP", ventureId: null } }),
    prisma.user.create({ data: { id: "u-004", email: "HR@apero.vn", passwordHash, fullName: "Pham Thu Hien", role: "HR", ventureId: "v-001" } }),
  ]);
  console.log("✅ " + users.length + " users created");

  // ===================== HEADCOUNT PLANS =====================
  const hcPlans = await Promise.all([
    // === Apero Games - Engineering ===
    prisma.headcountPlan.create({ data: { ventureId: "v-001", year: 2026, department: "Engineering", positionName: "Backend Developer", plannedHc: 8, usedHc: 5 } }),
    prisma.headcountPlan.create({ data: { ventureId: "v-001", year: 2026, department: "Engineering", positionName: "Frontend Developer", plannedHc: 6, usedHc: 4 } }),
    prisma.headcountPlan.create({ data: { ventureId: "v-001", year: 2026, department: "Engineering", positionName: "Mobile Developer", plannedHc: 5, usedHc: 3 } }),
    prisma.headcountPlan.create({ data: { ventureId: "v-001", year: 2026, department: "Engineering", positionName: "QA Engineer", plannedHc: 4, usedHc: 2 } }),
    prisma.headcountPlan.create({ data: { ventureId: "v-001", year: 2026, department: "Engineering", positionName: "DevOps Engineer", plannedHc: 2, usedHc: 2 } }),
    // === Apero Games - Product ===
    prisma.headcountPlan.create({ data: { ventureId: "v-001", year: 2026, department: "Product", positionName: "Product Manager", plannedHc: 3, usedHc: 2 } }),
    prisma.headcountPlan.create({ data: { ventureId: "v-001", year: 2026, department: "Product", positionName: "Product Designer", plannedHc: 2, usedHc: 1 } }),
    prisma.headcountPlan.create({ data: { ventureId: "v-001", year: 2026, department: "Product", positionName: "UI/UX Designer", plannedHc: 3, usedHc: 2 } }),
    // === Apero Games - Marketing ===
    prisma.headcountPlan.create({ data: { ventureId: "v-001", year: 2026, department: "Marketing", positionName: "Marketing Manager", plannedHc: 2, usedHc: 1 } }),
    prisma.headcountPlan.create({ data: { ventureId: "v-001", year: 2026, department: "Marketing", positionName: "Content Creator", plannedHc: 3, usedHc: 1 } }),
    // === Apero Games - Operations ===
    prisma.headcountPlan.create({ data: { ventureId: "v-001", year: 2026, department: "Operations", positionName: "HR Specialist", plannedHc: 2, usedHc: 1 } }),
    prisma.headcountPlan.create({ data: { ventureId: "v-001", year: 2026, department: "Operations", positionName: "Accountant", plannedHc: 2, usedHc: 2 } }),

    // === Apero Ads ===
    prisma.headcountPlan.create({ data: { ventureId: "v-002", year: 2026, department: "Engineering", positionName: "Backend Developer", plannedHc: 5, usedHc: 3 } }),
    prisma.headcountPlan.create({ data: { ventureId: "v-002", year: 2026, department: "Engineering", positionName: "Frontend Developer", plannedHc: 4, usedHc: 2 } }),
    prisma.headcountPlan.create({ data: { ventureId: "v-002", year: 2026, department: "Engineering", positionName: "Data Engineer", plannedHc: 3, usedHc: 1 } }),
    prisma.headcountPlan.create({ data: { ventureId: "v-002", year: 2026, department: "Sales", positionName: "Account Manager", plannedHc: 4, usedHc: 3 } }),
    prisma.headcountPlan.create({ data: { ventureId: "v-002", year: 2026, department: "Sales", positionName: "Sales Executive", plannedHc: 3, usedHc: 1 } }),

    // === Apero AI ===
    prisma.headcountPlan.create({ data: { ventureId: "v-003", year: 2026, department: "AI Research", positionName: "ML Engineer", plannedHc: 6, usedHc: 2 } }),
    prisma.headcountPlan.create({ data: { ventureId: "v-003", year: 2026, department: "AI Research", positionName: "Data Scientist", plannedHc: 4, usedHc: 1 } }),
    prisma.headcountPlan.create({ data: { ventureId: "v-003", year: 2026, department: "Engineering", positionName: "Backend Developer", plannedHc: 4, usedHc: 2 } }),
    prisma.headcountPlan.create({ data: { ventureId: "v-003", year: 2026, department: "Engineering", positionName: "Frontend Developer", plannedHc: 3, usedHc: 1 } }),
    prisma.headcountPlan.create({ data: { ventureId: "v-003", year: 2026, department: "Product", positionName: "Product Manager", plannedHc: 2, usedHc: 1 } }),
  ]);
  console.log("✅ " + hcPlans.length + " headcount plans created");

  // ===================== SUMMARY =====================
  const totalPlanned = hcPlans.reduce((sum, p) => sum + p.plannedHc, 0);
  const totalUsed = hcPlans.reduce((sum, p) => sum + p.usedHc, 0);
  console.log("📊 HC Summary: Planned=" + totalPlanned + ", Used=" + totalUsed + ", Available=" + (totalPlanned - totalUsed));

  console.log("🎉 Seed completed!");
  console.log("📋 Test accounts:");
  console.log("  HM@apero.vn       / test123  (Hiring Manager - Apero Games)");
  console.log("  CEOVen@apero.vn   / test123  (CEO Venture - Apero Games)");
  console.log("  CEOGroup@apero.vn / test123  (CEO Group)");
  console.log("  HR@apero.vn       / test123  (HR Officer)");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
