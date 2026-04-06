"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Clock, CheckCircle2, XCircle, Plus, AlertTriangle, TrendingUp, CalendarDays } from "lucide-react";

interface UserInfo {
  userId: string;
  email: string;
  role: string;
  fullName: string;
  ventureId: string | null;
}

interface OrderSummary {
  total: number;
  DRAFT: number;
  PENDING_HC_CHECK: number;
  PENDING_APPROVAL: number;
  APPROVED: number;
  REJECTED: number;
  CANCELLED: number;
  overHC: number;
  thisMonth: number;
  approvedToday: number;
}

interface StatCard {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/orders?summary=true").then((r) => r.json()),
    ])
      .then(([userData, summaryData]) => {
        if (userData.user) {
          setUser(userData.user);
        }
        if (summaryData) {
          setSummary(summaryData);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !user) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-3" />
              <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = getStatsForRole(user.role, summary);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Chào mừng, {user.fullName}!
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Tổng quan hoạt động tuyển dụng của bạn
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</span>
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Thao tác nhanh</h3>
        <div className="flex flex-wrap gap-3">
          {user.role === "HIRING_MANAGER" && (
            <button
              onClick={() => router.push("/orders/new")}
              className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl cursor-pointer transition-colors"
            >
              <Plus className="w-5 h-5" />
              Tạo Order mới
            </button>
          )}
          <button
            onClick={() => router.push("/orders")}
            className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl cursor-pointer transition-colors"
          >
            <FileText className="w-5 h-5" />
            Xem tất cả Orders
          </button>
          {(user.role === "CEO_VENTURE" || user.role === "CEO_GROUP") && (
            <button
              onClick={() => router.push("/approvals")}
              className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl cursor-pointer transition-colors"
            >
              <CheckCircle2 className="w-5 h-5" />
              Duyệt Orders
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function getStatsForRole(role: string, summary: OrderSummary | null): StatCard[] {
  const s = summary || {
    total: 0,
    DRAFT: 0,
    PENDING_HC_CHECK: 0,
    PENDING_APPROVAL: 0,
    APPROVED: 0,
    REJECTED: 0,
    CANCELLED: 0,
    overHC: 0,
    thisMonth: 0,
    approvedToday: 0,
  };

  switch (role) {
    case "HIRING_MANAGER":
      return [
        { title: "My Orders", value: s.total, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Pending Approval", value: s.PENDING_APPROVAL, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
        { title: "Approved", value: s.APPROVED, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
        { title: "Rejected", value: s.REJECTED, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
      ];
    case "CEO_VENTURE":
    case "CEO_GROUP":
      return [
        { title: "Pending My Approval", value: s.PENDING_APPROVAL, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
        { title: "Approved Today", value: s.approvedToday, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
        { title: "Total Orders", value: s.total, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Rejected", value: s.REJECTED, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
      ];
    case "HR":
      return [
        { title: "Total Orders", value: s.total, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Approved", value: s.APPROVED, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
        { title: "Over HC", value: s.overHC, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
        { title: "This Month", value: s.thisMonth, icon: CalendarDays, color: "text-purple-600", bg: "bg-purple-50" },
      ];
    default:
      return [
        { title: "Total Orders", value: s.total, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Pending", value: s.PENDING_APPROVAL, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
        { title: "Approved", value: s.APPROVED, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
        { title: "Rejected", value: s.REJECTED, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
      ];
  }
}
