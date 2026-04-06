"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Eye,
  Pencil,
  Send,
  Search,
  ChevronLeft,
  ChevronRight,
  FileX,
} from "lucide-react";
import toast from "react-hot-toast";
import { STATUS_CONFIG, HC_CHECK_CONFIG } from "@/lib/menu-config";

interface UserInfo {
  userId: string;
  email: string;
  role: string;
  fullName: string;
  ventureId: string | null;
}

interface Order {
  id: string;
  positionName: string;
  level: string;
  quantity: number;
  recruitmentType: string;
  reason: string;
  status: string;
  hcCheckResult: string | null;
  hcOverReason: string | null;
  createdAt: string;
  hiringManagerId: string;
  hiringManager: { id: string; fullName: string; email: string };
  venture: { id: string; name: string; code: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "DRAFT", label: "Nháp" },
  { value: "PENDING_HC_CHECK", label: "Đang kiểm HC" },
  { value: "PENDING_APPROVAL", label: "Chờ duyệt" },
  { value: "APPROVED", label: "Đã duyệt" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "CANCELLED", label: "Đã hủy" },
];

export default function OrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      });
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      params.set("page", page.toString());
      params.set("limit", "20");

      const res = await fetch(`/api/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setPagination(data.pagination || null);
      }
    } catch {
      toast.error("Không thể tải danh sách orders");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSubmit = async (orderId: string) => {
    if (!confirm("Bạn có chắc muốn gửi duyệt order này?")) return;

    try {
      const res = await fetch(`/api/orders/${orderId}/submit`, {
        method: "POST",
      });

      if (res.ok) {
        toast.success("Đã gửi duyệt thành công!");
        fetchOrders();
      } else {
        const data = await res.json();
        toast.error(data.error || "Gửi duyệt thất bại");
      }
    } catch {
      toast.error("Lỗi kết nối server");
    }
  };

  // Filter orders by search query (client-side)
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      order.positionName.toLowerCase().includes(q) ||
      order.level.toLowerCase().includes(q) ||
      order.hiringManager.fullName.toLowerCase().includes(q) ||
      order.venture.name.toLowerCase().includes(q)
    );
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Orders</h2>
          <p className="text-slate-500 text-sm mt-1">
            {pagination ? `Tổng cộng ${pagination.total} orders` : "Loading..."}
          </p>
        </div>
        {user?.role === "HIRING_MANAGER" && (
          <button
            onClick={() => router.push("/orders/new")}
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl cursor-pointer transition-colors"
          >
            <Plus className="w-5 h-5" />
            Tạo order mới
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo vị trí, level, người tạo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 hover:border-slate-300 focus:border-blue-500 cursor-pointer"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-5 w-8 bg-slate-200 rounded animate-pulse" />
                  <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
                  <div className="h-5 w-16 bg-slate-200 rounded animate-pulse" />
                  <div className="h-5 w-10 bg-slate-200 rounded animate-pulse" />
                  <div className="h-5 w-20 bg-slate-200 rounded animate-pulse" />
                  <div className="h-5 w-20 bg-slate-200 rounded animate-pulse" />
                  <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <FileX className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">Chưa có order nào</h3>
            <p className="text-slate-500 text-sm">
              {user?.role === "HIRING_MANAGER"
                ? "Hãy tạo order tuyển dụng đầu tiên của bạn"
                : "Chưa có order nào phù hợp với bộ lọc"}
            </p>
            {user?.role === "HIRING_MANAGER" && (
              <button
                onClick={() => router.push("/orders/new")}
                className="mt-4 flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl cursor-pointer mx-auto transition-colors"
              >
                <Plus className="w-5 h-5" />
                Tạo order mới
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Vị trí</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Level</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">SL</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Loại</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">HC Check</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Ngày tạo</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order, index) => {
                  const statusInfo = STATUS_CONFIG[order.status] || {
                    label: order.status,
                    color: "text-slate-600",
                    bg: "bg-slate-100",
                  };
                  const hcInfo = order.hcCheckResult
                    ? HC_CHECK_CONFIG[order.hcCheckResult]
                    : null;

                  const rowNumber = ((pagination?.page || 1) - 1) * 20 + index + 1;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-slate-500">{rowNumber}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-slate-900">{order.positionName}</div>
                        <div className="text-xs text-slate-500">{order.hiringManager.fullName}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{order.level}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 text-center">{order.quantity}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${
                          order.recruitmentType === "NEW"
                            ? "bg-blue-50 text-blue-700"
                            : "bg-orange-50 text-orange-700"
                        }`}>
                          {order.recruitmentType === "NEW" ? "Mới" : "Thay thế"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {hcInfo ? (
                          <span className={`inline-flex items-center gap-1 text-xs font-medium ${hcInfo.color}`}>
                            <span>{hcInfo.icon}</span>
                            {hcInfo.label}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">--</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => router.push(`/orders/${order.id}`)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {user?.role === "HIRING_MANAGER" &&
                            user.userId === order.hiringManagerId && (
                              <>
                                {(order.status === "DRAFT" || order.status === "REJECTED") && (
                                  <button
                                    onClick={() => router.push(`/orders/${order.id}/edit`)}
                                    className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer transition-colors"
                                    title="Chỉnh sửa"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                )}
                                {order.status === "DRAFT" && (
                                  <button
                                    onClick={() => handleSubmit(order.id)}
                                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors"
                                    title="Gửi duyệt"
                                  >
                                    <Send className="w-4 h-4" />
                                  </button>
                                )}
                              </>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Trang {pagination.page} / {pagination.totalPages} ({pagination.total} kết quả)
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
