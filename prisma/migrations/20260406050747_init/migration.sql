-- CreateTable
CREATE TABLE "ventures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "venture_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_venture_id_fkey" FOREIGN KEY ("venture_id") REFERENCES "ventures" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "recruitment_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hiring_manager_id" TEXT NOT NULL,
    "venture_id" TEXT NOT NULL,
    "position_name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "recruitment_type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "jd_attachment_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "hc_check_result" TEXT,
    "hc_over_reason" TEXT,
    "plan_year" INTEGER,
    "cancelled_at" DATETIME,
    "cancelled_by" TEXT,
    "cancelled_reason" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "recruitment_orders_hiring_manager_id_fkey" FOREIGN KEY ("hiring_manager_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "recruitment_orders_cancelled_by_fkey" FOREIGN KEY ("cancelled_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "recruitment_orders_venture_id_fkey" FOREIGN KEY ("venture_id") REFERENCES "ventures" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "approval_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "approver_id" TEXT NOT NULL,
    "approval_level" TEXT NOT NULL,
    "decision" TEXT NOT NULL DEFAULT 'PENDING',
    "comment" TEXT,
    "decided_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "approval_records_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "recruitment_orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "approval_records_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "headcount_plans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "venture_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "department" TEXT,
    "position_name" TEXT,
    "planned_hc" INTEGER NOT NULL,
    "used_hc" INTEGER NOT NULL DEFAULT 0,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "headcount_plans_venture_id_fkey" FOREIGN KEY ("venture_id") REFERENCES "ventures" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "job_descriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "venture_id" TEXT NOT NULL,
    "order_id" TEXT,
    "position_name" TEXT NOT NULL,
    "level" TEXT,
    "jd_content" TEXT,
    "candidate_profile" TEXT,
    "file_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "job_descriptions_venture_id_fkey" FOREIGN KEY ("venture_id") REFERENCES "ventures" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "job_descriptions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "recruitment_orders" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "notification_type" TEXT NOT NULL,
    "content" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" DATETIME,
    CONSTRAINT "notifications_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "recruitment_orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ventures_code_key" ON "ventures"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "job_descriptions_order_id_key" ON "job_descriptions"("order_id");
