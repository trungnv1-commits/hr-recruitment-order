"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckSquare,
  XCircle,
  CheckCircle,
  Ban,
  Clock,
  Bell,
  CheckCheck,
} from "lucide-react";
import toast from "react-hot-toast";

interface NotificationItem {
  id: string;
  orderId: string;
  notificationType: string;
  content: string | null;
  isRead: boolean;
  sentAt: string | null;
  order?: { id: string; positionName: string; status: string } | null;
}

const NOTIF_ICONS: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  HC_OVER_ALERT: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
  APPROVAL_REQUEST: { icon: CheckSquare, color: "text-blue-600", bg: "bg-blue-50" },
  REJECTION_NOTICE: { icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
  ORDER_APPROVED: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  ORDER_CANCELLED: { icon: Ban, color: "text-slate-600", bg: "bg-slate-100" },
  APPROVAL_REMINDER: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
};

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?page=${page}&limit=20`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setTotal(data.total || 0);
      }
    } catch {
      toast.error("Lỗi tải thông báo");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const handleMarkRead = async (notifId: string, orderId: string) => {
    try {
      await fetch(`/api/notifications/${notifId}/read`, { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => n.id === notifId ? { ...n, isRead: true } : n));
      router.push(`/orders/${orderId}`);
    } catch {
      router.push(`/orders/${orderId}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.isRead);
      await Promise.all(
        unread.map((n) => fetch(`/api/notifications/${n.id}/read`, { method: "PATCH" }))
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("Đã đánh dấu tất cả đã đọc");
    } catch {
      toast.error("Lỗi đánh dấu đã đọc");
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Thông báo</h2>
          <p className="text-slate-500 text-sm mt-1">{total} thông báo</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl cursor-pointer text-sm transition-colors">
            <CheckCheck className="w-4 h-4" />Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3">
              <div className="w-9 h-9 bg-slate-200 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-1/4 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">Chưa có thông báo</h3>
          <p className="text-slate-500 text-sm">Bạn sẽ nhận được thông báo khi có cập nhật về order</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const config = NOTIF_ICONS[notif.notificationType] || NOTIF_ICONS.APPROVAL_REMINDER;
            const Icon = config.icon;

            return (
              <div
                key={notif.id}
                onClick={() => handleMarkRead(notif.id, notif.orderId)}
                className={`bg-white rounded-xl border p-4 flex items-start gap-3 cursor-pointer transition-colors hover:bg-slate-50 ${!notif.isRead ? "border-blue-200 bg-blue-50/30" : "border-slate-200"}`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notif.isRead ? "font-semibold text-slate-900" : "text-slate-700"}`}>
                    {notif.content || "Thông báo mới"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {notif.sentAt ? getRelativeTime(notif.sentAt) : ""}
                  </p>
                </div>
                {!notif.isRead && (
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                )}
              </div>
            );
          })}

          {total > 20 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Trang trước
              </button>
              <span className="text-sm text-slate-500">Trang {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={notifications.length < 20}
                className="px-4 py-2 text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Trang sau
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
