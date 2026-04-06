"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Send,
  CheckCircle,
  XCircle,
  Ban,
  Clock,
  ExternalLink,
  AlertTriangle,
  User,
  Building2,
  Calendar,
  Hash,
  FileText,
  Briefcase,
} from "lucide-react";
import toast from "react-hot-toast";
import { STATUS_CONFIG, HC_CHECK_CONFIG, ROLE_LABELS } from "@/lib/menu-config";

interface UserInfo {
  userId: string;
  email: string;
  role: string;
  fullName: string;
  ventureId: string | null;
}

interface ApprovalRecord {
  id: string;
  approverId: string;
  approvalLevel: string;
  decision: string;
  comment: string | null;
  decidedAt: string | null;
  createdAt: string;
  approver: { id: string; fullName: string; email: string; role: string };
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
  jdAttachmentUrl: string | null;
  cancelledAt: string | null;
  cancelledBy: string | null;
  cancelledReason: string | null;
  createdAt: string;
  updatedAt: string;
  hiringManagerId: string;
  hiringManager: { id: string; fullName: string; email: string };
  venture: { id: string; name: string; code: string };
  approvalRecords: ApprovalRecord[];
  canceller?: { id: string; fullName: string; email: string } | null;
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [approveComment, setApproveComment] = useState("");
  const [rejectComment, setRejectComment] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user);
        else router.push("/login");
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        setOrder(await res.json());
      } else {
        toast.error("Không thể tải thông tin order");
        router.push("/orders");
      }
    } catch {
      toast.error("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { if (user) fetchOrder(); }, [user, fetchOrder]);

  const handleSubmit = async () => {
    if (!confirm("Bạn có chắc muốn gửi duyệt order này?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${id}/submit`, { method: "POST" });
      if (res.ok) { toast.success("Đã gửi duyệt thành công!"); fetchOrder(); }
      else { const d = await res.json(); toast.error(d.error || "Gửi duyệt thất bại"); }
    } catch { toast.error("Lỗi kết nối server"); }
    finally { setActionLoading(false); }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${id}/approve`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: approveComment || null }),
      });
      if (res.ok) { toast.success("Đã duyệt thành công!"); setShowApproveForm(false); setApproveComment(""); fetchOrder(); }
      else { const d = await res.json(); toast.error(d.error || "Duyệt thất bại"); }
    } catch { toast.error("Lỗi kết nối server"); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!rejectComment.trim()) { toast.error("Vui lòng nhập lý do từ chối"); return; }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${id}/reject`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: rejectComment }),
      });
      if (res.ok) { toast.success("Đã từ chối order"); setShowRejectForm(false); setRejectComment(""); fetchOrder(); }
      else { const d = await res.json(); toast.error(d.error || "Từ chối thất bại"); }
    } catch { toast.error("Lỗi kết nối server"); }
    finally { setActionLoading(false); }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) { toast.error("Vui lòng nhập lý do hủy"); return; }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${id}/cancel`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason }),
      });
      if (res.ok) { toast.success("Đã hủy order"); setShowCancelForm(false); setCancelReason(""); fetchOrder(); }
      else { const d = await res.json(); toast.error(d.error || "Hủy thất bại"); }
    } catch { toast.error("Lỗi kết nối server"); }
    finally { setActionLoading(false); }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const isHM = user?.role === "HIRING_MANAGER" && user?.userId === order?.hiringManagerId;
  const isCEO = user?.role === "CEO_VENTURE" || user?.role === "CEO_GROUP";
  const hasPendingRecord = isCEO && order?.approvalRecords.some((r) => r.approverId === user?.userId && r.decision === "PENDING");

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
          {[...Array(6)].map((_, i) => (<div key={i} className="flex gap-4"><div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /><div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></div>))}
        </div>
      </div>
    );
  }

  if (!order || !user) return null;

  const statusInfo = STATUS_CONFIG[order.status] || { label: order.status, color: "text-slate-600", bg: "bg-slate-100" };
  const hcInfo = order.hcCheckResult ? HC_CHECK_CONFIG[order.hcCheckResult] : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button onClick={() => router.push("/orders")} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 text-sm cursor-pointer transition-colors">
        <ArrowLeft className="w-4 h-4" />Quay lại danh sách
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{order.positionName}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Level: {order.level}</p>
              </div>
              <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${statusInfo.bg} ${statusInfo.color}`}>{statusInfo.label}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3"><div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"><Briefcase className="w-4 h-4 text-blue-600" /></div><div><p className="text-xs text-slate-500 dark:text-slate-400">Loại tuyển</p><p className="text-sm font-medium text-slate-900 dark:text-white">{order.recruitmentType === "NEW" ? "Tuyển mới" : "Thay thế"}</p></div></div>
              <div className="flex items-center gap-3"><div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center"><Hash className="w-4 h-4 text-emerald-600" /></div><div><p className="text-xs text-slate-500 dark:text-slate-400">Số lượng</p><p className="text-sm font-medium text-slate-900 dark:text-white">{order.quantity}</p></div></div>
              <div className="flex items-center gap-3"><div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center"><User className="w-4 h-4 text-amber-600" /></div><div><p className="text-xs text-slate-500 dark:text-slate-400">Người tạo</p><p className="text-sm font-medium text-slate-900 dark:text-white">{order.hiringManager.fullName}</p></div></div>
              <div className="flex items-center gap-3"><div className="w-9 h-9 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center"><Building2 className="w-4 h-4 text-purple-600" /></div><div><p className="text-xs text-slate-500 dark:text-slate-400">Venture</p><p className="text-sm font-medium text-slate-900 dark:text-white">{order.venture.name}</p></div></div>
              <div className="flex items-center gap-3"><div className="w-9 h-9 bg-slate-50 dark:bg-slate-700 rounded-lg flex items-center justify-center"><Calendar className="w-4 h-4 text-slate-600 dark:text-slate-400" /></div><div><p className="text-xs text-slate-500 dark:text-slate-400">Ngày tạo</p><p className="text-sm font-medium text-slate-900 dark:text-white">{formatDate(order.createdAt)}</p></div></div>
              {order.jdAttachmentUrl && (<div className="flex items-center gap-3"><div className="w-9 h-9 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center"><FileText className="w-4 h-4 text-indigo-600" /></div><div><p className="text-xs text-slate-500 dark:text-slate-400">JD</p><a href={order.jdAttachmentUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">Xem JD <ExternalLink className="w-3 h-3" /></a></div></div>)}
            </div>
            <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-700"><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Lý do tuyển</p><p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{order.reason}</p></div>
            {hcInfo && (
              <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">HC Check</p>
                <div className={`inline-flex items-center gap-1.5 text-sm font-medium ${hcInfo.color}`}><span>{hcInfo.icon}</span>{hcInfo.label}</div>
                {order.hcOverReason && (<div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl"><div className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" /><p className="text-sm text-amber-700 dark:text-amber-400">{order.hcOverReason}</p></div></div>)}
              </div>
            )}
          </div>

          {order.status === "CANCELLED" && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-red-200 dark:border-red-800 p-6">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0"><Ban className="w-4 h-4 text-red-600" /></div>
                <div>
                  <h3 className="text-sm font-semibold text-red-900 dark:text-red-300">Order đã bị hủy</h3>
                  {order.canceller && <p className="text-sm text-red-700 dark:text-red-400 mt-1">Bởi: {order.canceller.fullName}</p>}
                  {order.cancelledAt && <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">Lúc: {formatDate(order.cancelledAt)}</p>}
                  {order.cancelledReason && <p className="text-sm text-red-700 dark:text-red-400 mt-2 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">{order.cancelledReason}</p>}
                </div>
              </div>
            </div>
          )}

          {showApproveForm && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Duyệt Order</h3>
              <textarea value={approveComment} onChange={(e) => setApproveComment(e.target.value)} placeholder="Nhận xét (không bắt buộc)..." rows={3} className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 resize-none mb-3" />
              <div className="flex gap-3">
                <button onClick={handleApprove} disabled={actionLoading} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium rounded-xl cursor-pointer transition-colors">{actionLoading ? "Đang xử lý..." : "Xác nhận duyệt"}</button>
                <button onClick={() => { setShowApproveForm(false); setApproveComment(""); }} className="px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl cursor-pointer transition-colors">Hủy</button>
              </div>
            </div>
          )}
          {showRejectForm && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-red-200 dark:border-red-800 p-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Từ chối Order</h3>
              <textarea value={rejectComment} onChange={(e) => setRejectComment(e.target.value)} placeholder="Lý do từ chối (bắt buộc)..." rows={3} className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 resize-none mb-3" />
              <div className="flex gap-3">
                <button onClick={handleReject} disabled={actionLoading} className="px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-xl cursor-pointer transition-colors">{actionLoading ? "Đang xử lý..." : "Xác nhận từ chối"}</button>
                <button onClick={() => { setShowRejectForm(false); setRejectComment(""); }} className="px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl cursor-pointer transition-colors">Hủy</button>
              </div>
            </div>
          )}
          {showCancelForm && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-red-200 dark:border-red-800 p-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Hủy Order</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Bạn đang hủy order <strong>{order.positionName}</strong> ({order.level}, SL: {order.quantity})</p>
              <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Lý do hủy (bắt buộc)..." rows={3} className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 resize-none mb-3" />
              <div className="flex gap-3">
                <button onClick={handleCancel} disabled={actionLoading} className="px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-xl cursor-pointer transition-colors">{actionLoading ? "Đang xử lý..." : "Xác nhận hủy"}</button>
                <button onClick={() => { setShowCancelForm(false); setCancelReason(""); }} className="px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl cursor-pointer transition-colors">Quay lại</button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Lịch sử duyệt</h3>
            {order.approvalRecords.length === 0 ? (<p className="text-sm text-slate-400 dark:text-slate-500">Chưa có thông tin duyệt</p>) : (
              <div className="space-y-4">
                {order.approvalRecords.map((record, index) => {
                  const isLast = index === order.approvalRecords.length - 1;
                  const levelInfo = ROLE_LABELS[record.approvalLevel] || { label: record.approvalLevel, color: "text-slate-700", bg: "bg-slate-50" };
                  let decisionIcon; let decisionColor; let decisionLabel;
                  switch (record.decision) {
                    case "APPROVED": decisionIcon = <CheckCircle className="w-5 h-5 text-emerald-500" />; decisionColor = "text-emerald-600"; decisionLabel = "Đã duyệt"; break;
                    case "REJECTED": decisionIcon = <XCircle className="w-5 h-5 text-red-500" />; decisionColor = "text-red-600"; decisionLabel = "Từ chối"; break;
                    case "CANCELLED": decisionIcon = <Ban className="w-5 h-5 text-slate-400" />; decisionColor = "text-slate-500"; decisionLabel = "Đã hủy"; break;
                    default: decisionIcon = <Clock className="w-5 h-5 text-amber-500" />; decisionColor = "text-amber-600"; decisionLabel = "Chờ duyệt";
                  }
                  return (
                    <div key={record.id} className="relative">
                      {!isLast && <div className="absolute left-[9px] top-8 w-0.5 h-[calc(100%+0.5rem)] bg-slate-200 dark:bg-slate-600" />}
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">{decisionIcon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{record.approver.fullName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${levelInfo.bg} ${levelInfo.color}`}>{levelInfo.label}</span>
                            <span className={`text-xs font-medium ${decisionColor}`}>{decisionLabel}</span>
                          </div>
                          {record.comment && <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">{record.comment}</p>}
                          {record.decidedAt && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{formatDate(record.decidedAt)}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {!showApproveForm && !showRejectForm && !showCancelForm && (
            <div className="mt-4 space-y-2">
              {isHM && order.status === "DRAFT" && (<>
                <button onClick={() => router.push(`/orders/${id}/edit`)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl cursor-pointer transition-colors"><Pencil className="w-4 h-4" />Chỉnh sửa</button>
                <button onClick={handleSubmit} disabled={actionLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl cursor-pointer transition-colors"><Send className="w-4 h-4" />Gửi duyệt</button>
                <button onClick={() => setShowCancelForm(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 font-medium rounded-xl cursor-pointer transition-colors"><Ban className="w-4 h-4" />Hủy order</button>
              </>)}
              {isHM && order.status === "PENDING_APPROVAL" && (
                <button onClick={() => setShowCancelForm(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 font-medium rounded-xl cursor-pointer transition-colors"><Ban className="w-4 h-4" />Hủy order</button>
              )}
              {isHM && order.status === "REJECTED" && (
                <button onClick={() => router.push(`/orders/${id}/edit`)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl cursor-pointer transition-colors"><Pencil className="w-4 h-4" />Chỉnh sửa & Gửi lại</button>
              )}
              {hasPendingRecord && order.status === "PENDING_APPROVAL" && (<>
                <button onClick={() => { setShowApproveForm(true); setShowRejectForm(false); }} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl cursor-pointer transition-colors"><CheckCircle className="w-4 h-4" />Duyệt</button>
                <button onClick={() => { setShowRejectForm(true); setShowApproveForm(false); }} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl cursor-pointer transition-colors"><XCircle className="w-4 h-4" />Từ chối</button>
              </>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
