import { LayoutDashboard, FileText, CheckSquare, BookOpen, BarChart3, PieChart, Bell } from "lucide-react";

export interface MenuItem {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  badge?: string; // "notifications" | "approvals" for dynamic badges
}

export const MENU_ITEMS: MenuItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["HIRING_MANAGER", "CEO_VENTURE", "CEO_GROUP", "HR"] },
  { key: "orders", label: "Orders", href: "/orders", icon: FileText, roles: ["HIRING_MANAGER", "CEO_VENTURE", "CEO_GROUP", "HR"] },
  { key: "approvals", label: "Approvals", href: "/approvals", icon: CheckSquare, roles: ["CEO_VENTURE", "CEO_GROUP"], badge: "approvals" },
  { key: "jd-repository", label: "JD Repository", href: "/jd-repository", icon: BookOpen, roles: ["HIRING_MANAGER", "HR"] },
  { key: "headcount-plans", label: "HC Plans", href: "/headcount-plans", icon: BarChart3, roles: ["HR", "CEO_VENTURE", "CEO_GROUP"] },
  { key: "reports", label: "Reports", href: "/reports", icon: PieChart, roles: ["HR"] },
  { key: "notifications", label: "Notifications", href: "/notifications", icon: Bell, roles: ["HIRING_MANAGER", "CEO_VENTURE", "CEO_GROUP", "HR"], badge: "notifications" },
];

export const ROLE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  HIRING_MANAGER: { label: "Hiring Manager", color: "text-blue-700", bg: "bg-blue-50" },
  CEO_VENTURE: { label: "CEO Venture", color: "text-emerald-700", bg: "bg-emerald-50" },
  CEO_GROUP: { label: "CEO Group", color: "text-purple-700", bg: "bg-purple-50" },
  HR: { label: "HR Officer", color: "text-amber-700", bg: "bg-amber-50" },
};

export const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT: { label: "Nháp", color: "text-slate-600", bg: "bg-slate-100" },
  PENDING_HC_CHECK: { label: "Đang kiểm HC", color: "text-blue-600", bg: "bg-blue-50" },
  PENDING_APPROVAL: { label: "Chờ duyệt", color: "text-amber-600", bg: "bg-amber-50" },
  APPROVED: { label: "Đã duyệt", color: "text-emerald-600", bg: "bg-emerald-50" },
  REJECTED: { label: "Từ chối", color: "text-red-600", bg: "bg-red-50" },
  CANCELLED: { label: "Đã hủy", color: "text-slate-500", bg: "bg-slate-50" },
};

export const HC_CHECK_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  WITHIN_HC: { label: "Trong HC", icon: "✅", color: "text-emerald-600" },
  OVER_HC: { label: "Vượt HC", icon: "⚠️", color: "text-red-600" },
  SKIPPED: { label: "Bỏ qua", icon: "⏭", color: "text-slate-500" },
};
