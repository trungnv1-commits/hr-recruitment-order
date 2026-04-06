import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { getEmailTemplate, EmailTemplateData } from "@/lib/email-templates";

let emailWarningLogged = false;

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export function isEmailConfigured(): boolean {
  return !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

export async function sendNotificationEmail(
  recipientId: string,
  notificationType: string,
  templateData: EmailTemplateData
): Promise<void> {
  try {
    if (!isEmailConfigured()) {
      if (!emailWarningLogged) {
        console.warn(
          "[Email] GMAIL_USER or GMAIL_APP_PASSWORD not configured. Email notifications are disabled."
        );
        emailWarningLogged = true;
      }
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { email: true, fullName: true },
    });

    if (!user || !user.email) {
      console.warn(
        `[Email] Recipient ${recipientId} not found or has no email address.`
      );
      return;
    }

    const { subject, html } = getEmailTemplate(notificationType, templateData);

    const testOverride = process.env.EMAIL_TEST_MODE === "true" ? process.env.GMAIL_USER : null;
    const toEmail = testOverride || user.email;

    await transporter.sendMail({
      from: `"Apero HR" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: testOverride ? `[To: ${user.email}] ${subject}` : subject,
      html,
    });

    console.log(
      `[Email] Sent ${notificationType} email to ${user.email} for order ${templateData.orderId}`
    );
  } catch (error) {
    console.error(
      `[Email] Failed to send ${notificationType} email to recipient ${recipientId}:`,
      error instanceof Error ? error.message : error
    );
  }
}
