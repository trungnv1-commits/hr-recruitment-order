export interface EmailTemplateData {
  recipientName: string;
  orderId: string;
  positionName: string;
  level: string;
  quantity: number;
  ventureName: string;
  recruitmentType: "NEW" | "REPLACEMENT";
  hcCheckResult?: "WITHIN_HC" | "OVER_HC" | "SKIPPED";
  reason?: string;
  comment?: string;
}

const NOTIFICATION_SUBJECTS: Record<string, string> = {
  APPROVAL_REQUEST: "Có order tuyển dụng mới cần duyệt",
  HC_OVER_ALERT: "Order vượt định biên HC cần duyệt",
  ORDER_APPROVED: "Order tuyển dụng đã được duyệt",
  REJECTION_NOTICE: "Order tuyển dụng bị từ chối",
  ORDER_CANCELLED: "Order tuyển dụng đã bị hủy",
};

function getHcCheckLabel(result: string): string {
  switch (result) {
    case "WITHIN_HC":
      return "Trong định biên";
    case "OVER_HC":
      return "Vượt định biên";
    case "SKIPPED":
      return "Bỏ qua";
    default:
      return result;
  }
}

function getHcCheckColor(result: string): string {
  switch (result) {
    case "WITHIN_HC":
      return "#16a34a";
    case "OVER_HC":
      return "#dc2626";
    case "SKIPPED":
      return "#6b7280";
    default:
      return "#6b7280";
  }
}

function getRecruitmentTypeLabel(type: string): string {
  return type === "NEW" ? "Tuyển mới" : "Thay thế";
}

function getNotificationBody(type: string, data: EmailTemplateData): string {
  switch (type) {
    case "APPROVAL_REQUEST":
      return `Xin chào <strong>${data.recipientName}</strong>,<br/><br/>Bạn có một order tuyển dụng mới cần duyệt. Vui lòng xem chi tiết bên dưới và thực hiện phê duyệt.`;
    case "HC_OVER_ALERT":
      return `Xin chào <strong>${data.recipientName}</strong>,<br/><br/>Một order tuyển dụng <span style="color:#dc2626;font-weight:bold;">vượt định biên HC</span> cần sự phê duyệt của bạn. Vui lòng xem xét và xử lý.`;
    case "ORDER_APPROVED":
      return `Xin chào <strong>${data.recipientName}</strong>,<br/><br/>Order tuyển dụng của bạn đã được <span style="color:#16a34a;font-weight:bold;">phê duyệt thành công</span>. Bộ phận tuyển dụng sẽ bắt đầu xử lý.`;
    case "REJECTION_NOTICE":
      return `Xin chào <strong>${data.recipientName}</strong>,<br/><br/>Order tuyển dụng của bạn đã bị <span style="color:#dc2626;font-weight:bold;">từ chối</span>.${data.reason ? `<br/><br/><strong>Lý do:</strong> ${data.reason}` : ""}`;
    case "ORDER_CANCELLED":
      return `Xin chào <strong>${data.recipientName}</strong>,<br/><br/>Order tuyển dụng đã bị <span style="color:#dc2626;font-weight:bold;">hủy</span>.${data.reason ? `<br/><br/><strong>Lý do:</strong> ${data.reason}` : ""}`;
    default:
      return `Xin chào <strong>${data.recipientName}</strong>,<br/><br/>Bạn có thông báo mới liên quan đến order tuyển dụng.`;
  }
}

function getCtaLabel(type: string): string {
  switch (type) {
    case "APPROVAL_REQUEST":
    case "HC_OVER_ALERT":
      return "Xem &amp; Phê duyệt";
    case "ORDER_APPROVED":
      return "Xem Order";
    case "REJECTION_NOTICE":
      return "Xem Chi tiết";
    case "ORDER_CANCELLED":
      return "Xem Chi tiết";
    default:
      return "Xem Order";
  }
}

export function getEmailTemplate(
  type: string,
  data: EmailTemplateData
): { subject: string; html: string } {
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const orderUrl = `${appUrl}/orders/${data.orderId}`;
  const subject = NOTIFICATION_SUBJECTS[type] || "Thông báo tuyển dụng";
  const body = getNotificationBody(type, data);
  const ctaLabel = getCtaLabel(type);

  const hcCheckHtml = data.hcCheckResult
    ? `
                        <tr>
                          <td style="padding:8px 12px;font-size:14px;color:#6b7280;border-bottom:1px solid #e5e7eb;width:160px;">Kiểm tra HC</td>
                          <td style="padding:8px 12px;font-size:14px;border-bottom:1px solid #e5e7eb;">
                            <span style="display:inline-block;padding:2px 10px;border-radius:9999px;font-size:13px;font-weight:600;color:#fff;background-color:${getHcCheckColor(data.hcCheckResult)};">
                              ${getHcCheckLabel(data.hcCheckResult)}
                            </span>
                          </td>
                        </tr>`
    : "";

  const commentHtml = data.comment
    ? `
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:16px;">
                      <tr>
                        <td style="padding:12px 16px;background-color:#fef3c7;border-left:4px solid #f59e0b;border-radius:4px;font-size:14px;color:#92400e;">
                          <strong>Ghi chú:</strong> ${data.comment}
                        </td>
                      </tr>
                    </table>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f4f6;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb,#4f46e5);padding:32px 40px;border-radius:12px 12px 0 0;text-align:center;">
              <h1 style="margin:0;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">Apero HR</h1>
              <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.85);font-weight:400;">Hệ thống quản lý tuyển dụng</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:32px 40px;">
              <!-- Notification text -->
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#374151;">
                ${body}
              </p>
              <!-- Order info card -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
                <tr>
                  <td style="padding:16px;background-color:#f3f4f6;border-bottom:1px solid #e5e7eb;">
                    <strong style="font-size:15px;color:#1f2937;">Thông tin Order #${data.orderId.slice(-8).toUpperCase()}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:8px 12px;font-size:14px;color:#6b7280;border-bottom:1px solid #e5e7eb;width:160px;">Vị trí</td>
                        <td style="padding:8px 12px;font-size:14px;color:#1f2937;font-weight:600;border-bottom:1px solid #e5e7eb;">${data.positionName}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 12px;font-size:14px;color:#6b7280;border-bottom:1px solid #e5e7eb;width:160px;">Cấp bậc</td>
                        <td style="padding:8px 12px;font-size:14px;color:#1f2937;border-bottom:1px solid #e5e7eb;">${data.level}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 12px;font-size:14px;color:#6b7280;border-bottom:1px solid #e5e7eb;width:160px;">Số lượng</td>
                        <td style="padding:8px 12px;font-size:14px;color:#1f2937;border-bottom:1px solid #e5e7eb;">${data.quantity}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 12px;font-size:14px;color:#6b7280;border-bottom:1px solid #e5e7eb;width:160px;">Công ty/Venture</td>
                        <td style="padding:8px 12px;font-size:14px;color:#1f2937;border-bottom:1px solid #e5e7eb;">${data.ventureName}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 12px;font-size:14px;color:#6b7280;border-bottom:1px solid #e5e7eb;width:160px;">Loại tuyển dụng</td>
                        <td style="padding:8px 12px;font-size:14px;color:#1f2937;border-bottom:1px solid #e5e7eb;">
                          <span style="display:inline-block;padding:2px 10px;border-radius:9999px;font-size:13px;font-weight:600;color:#fff;background-color:${data.recruitmentType === "NEW" ? "#2563eb" : "#7c3aed"};">
                            ${getRecruitmentTypeLabel(data.recruitmentType)}
                          </span>
                        </td>
                      </tr>${hcCheckHtml}
                    </table>
                  </td>
                </tr>
              </table>${commentHtml}
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
                <tr>
                  <td align="center">
                    <a href="${orderUrl}" target="_blank" style="display:inline-block;padding:14px 36px;background-color:#2563eb;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;border-radius:8px;letter-spacing:0.3px;">
                      ${ctaLabel}
                    </a>
                  </td>
                </tr>
              </table>
              <!-- Fallback link -->
              <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;text-align:center;">
                Nếu nút không hoạt động, vui lòng truy cập:<br/>
                <a href="${orderUrl}" style="color:#2563eb;text-decoration:underline;">${orderUrl}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:24px 40px;border-radius:0 0 12px 12px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;font-size:13px;color:#9ca3af;">&copy; 2026 Apero &middot; HR Recruitment Order v1.0</p>
              <p style="margin:8px 0 0;font-size:12px;color:#d1d5db;">Email này được gửi tự động. Vui lòng không trả lời trực tiếp.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}
