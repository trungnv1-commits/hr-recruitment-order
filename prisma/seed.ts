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

  // ===================== JD TEMPLATES =====================
  const jdTemplates = await Promise.all([
    prisma.jobDescription.create({ data: {
      ventureId: "v-001", positionName: "Backend Developer", level: "Mid",
      jdContent: "## Mô tả công việc\n- Thiết kế và phát triển các API RESTful, microservices\n- Tối ưu hiệu năng database (PostgreSQL, Redis)\n- Viết unit test, integration test\n- Code review và mentoring junior developers\n- Làm việc với team Agile/Scrum\n\n## Yêu cầu\n- 2+ năm kinh nghiệm Backend (Node.js/Go/Java)\n- Thành thạo SQL, NoSQL databases\n- Hiểu biết về Docker, CI/CD\n- Tiếng Anh đọc hiểu tài liệu kỹ thuật",
      candidateProfile: "Kỹ sư phần mềm có kinh nghiệm Backend, đam mê công nghệ, khả năng làm việc nhóm tốt"
    }}),
    prisma.jobDescription.create({ data: {
      ventureId: "v-001", positionName: "Frontend Developer", level: "Mid",
      jdContent: "## Mô tả công việc\n- Phát triển giao diện web với React/Next.js\n- Implement responsive design, cross-browser compatibility\n- Tích hợp API RESTful, GraphQL\n- Tối ưu performance (Core Web Vitals)\n- Viết component test với Jest/Testing Library\n\n## Yêu cầu\n- 2+ năm kinh nghiệm Frontend (React/Vue/Angular)\n- Thành thạo TypeScript, HTML5, CSS3\n- Kinh nghiệm với Tailwind CSS hoặc styled-components\n- Hiểu biết về UX/UI principles",
      candidateProfile: "Developer có mắt thẩm mỹ, đam mê tạo ra sản phẩm đẹp và dễ sử dụng"
    }}),
    prisma.jobDescription.create({ data: {
      ventureId: "v-001", positionName: "Mobile Developer", level: "Mid",
      jdContent: "## Mô tả công việc\n- Phát triển ứng dụng mobile cho iOS và Android\n- Sử dụng React Native hoặc Flutter\n- Tích hợp Push Notification, In-App Purchase\n- Tối ưu hiệu năng và trải nghiệm người dùng\n- Publish app lên App Store và Google Play\n\n## Yêu cầu\n- 2+ năm kinh nghiệm Mobile Development\n- Thành thạo React Native hoặc Flutter\n- Hiểu biết về native iOS/Android\n- Kinh nghiệm với Firebase, Analytics",
      candidateProfile: "Mobile developer có portfolio ứng dụng đã publish trên store"
    }}),
    prisma.jobDescription.create({ data: {
      ventureId: "v-001", positionName: "QA Engineer", level: "Mid",
      jdContent: "## Mô tả công việc\n- Thiết kế test plan và test cases\n- Thực hiện manual testing và automation testing\n- Viết automated test scripts (Selenium/Cypress/Playwright)\n- Báo cáo bug và theo dõi fix\n- Tham gia sprint planning và review\n\n## Yêu cầu\n- 2+ năm kinh nghiệm QA/Testing\n- Kinh nghiệm automation testing\n- Hiểu biết về API testing (Postman/REST)\n- Kỹ năng phân tích và attention to detail",
      candidateProfile: "QA Engineer cẩn thận, tỉ mỉ, có khả năng viết automation test"
    }}),
    prisma.jobDescription.create({ data: {
      ventureId: "v-001", positionName: "Product Manager", level: "Senior",
      jdContent: "## Mô tả công việc\n- Xây dựng product roadmap và strategy\n- Phân tích user research, market trends\n- Viết PRD (Product Requirements Document)\n- Làm việc chặt chẽ với Design và Engineering\n- Theo dõi product metrics (DAU, retention, revenue)\n- Quản lý backlog và prioritization\n\n## Yêu cầu\n- 3+ năm kinh nghiệm Product Management\n- Kinh nghiệm trong lĩnh vực mobile app/game\n- Kỹ năng data analysis (SQL, BI tools)\n- Communication skills xuất sắc",
      candidateProfile: "Product thinker có tư duy chiến lược, am hiểu thị trường mobile/game"
    }}),
    prisma.jobDescription.create({ data: {
      ventureId: "v-001", positionName: "UI/UX Designer", level: "Mid",
      jdContent: "## Mô tả công việc\n- Thiết kế giao diện (UI) cho web và mobile app\n- Thực hiện user research và usability testing\n- Tạo wireframes, mockups, prototypes (Figma)\n- Xây dựng design system và style guide\n- Collaborate với Product và Development team\n\n## Yêu cầu\n- 2+ năm kinh nghiệm UI/UX Design\n- Thành thạo Figma, Adobe Creative Suite\n- Portfolio thể hiện case studies\n- Hiểu biết về Design Thinking, Human-Centered Design",
      candidateProfile: "Designer sáng tạo, có eye for detail và đam mê user experience"
    }}),
    prisma.jobDescription.create({ data: {
      ventureId: "v-001", positionName: "DevOps Engineer", level: "Senior",
      jdContent: "## Mô tả công việc\n- Quản lý hạ tầng cloud (AWS/GCP)\n- Thiết kế và maintain CI/CD pipelines\n- Container orchestration (Docker, Kubernetes)\n- Monitoring và alerting (Grafana, Prometheus)\n- Security hardening và compliance\n- Tối ưu chi phí infrastructure\n\n## Yêu cầu\n- 3+ năm kinh nghiệm DevOps/SRE\n- Thành thạo Terraform, Ansible\n- Kinh nghiệm Kubernetes production\n- Linux administration skills",
      candidateProfile: "DevOps engineer với kinh nghiệm quản lý hạ tầng quy mô lớn"
    }}),
    prisma.jobDescription.create({ data: {
      ventureId: "v-002", positionName: "Data Engineer", level: "Mid",
      jdContent: "## Mô tả công việc\n- Xây dựng data pipeline (ETL/ELT)\n- Thiết kế data warehouse và data lake\n- Xử lý big data với Spark, Airflow\n- Tối ưu query performance\n- Đảm bảo data quality và governance\n\n## Yêu cầu\n- 2+ năm kinh nghiệm Data Engineering\n- Thành thạo Python, SQL\n- Kinh nghiệm BigQuery/Redshift/Snowflake\n- Hiểu biết về data modeling",
      candidateProfile: "Data engineer am hiểu advertising data, có kinh nghiệm xử lý large-scale data"
    }}),
    prisma.jobDescription.create({ data: {
      ventureId: "v-003", positionName: "ML Engineer", level: "Senior",
      jdContent: "## Mô tả công việc\n- Phát triển và deploy ML models to production\n- Fine-tune LLMs và NLP models\n- Xây dựng ML pipeline (training, evaluation, serving)\n- A/B testing và model monitoring\n- Research và implement state-of-the-art papers\n\n## Yêu cầu\n- 3+ năm kinh nghiệm ML/AI\n- Thành thạo Python, PyTorch/TensorFlow\n- Kinh nghiệm MLOps (MLflow, Kubeflow)\n- Publications hoặc contributions to open-source ML",
      candidateProfile: "ML Engineer với background research mạnh, đam mê AI/ML cutting-edge"
    }}),
    prisma.jobDescription.create({ data: {
      ventureId: "v-003", positionName: "Data Scientist", level: "Mid",
      jdContent: "## Mô tả công việc\n- Phân tích dữ liệu và xây dựng predictive models\n- Thực hiện A/B testing và statistical analysis\n- Tạo dashboards và reports cho stakeholders\n- Feature engineering và model optimization\n- Collaborate với Product team cho data-driven decisions\n\n## Yêu cầu\n- 2+ năm kinh nghiệm Data Science\n- Thành thạo Python (pandas, scikit-learn)\n- Kỹ năng SQL và visualization (Tableau/PowerBI)\n- Background Statistics/Mathematics",
      candidateProfile: "Data Scientist với khả năng storytelling bằng data, tư duy analytical mạnh"
    }}),
  ]);
  console.log("✅ " + jdTemplates.length + " JD templates created");

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
