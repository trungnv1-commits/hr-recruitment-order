"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock, AlertTriangle, FileX, User } from "lucide-react";
import toast from "react-hot-toast";
import { STATUS_CONFIG, HC_CHECK_CONFIG } from "@/lib/menu-config";

interface UserInfo {
  userId: string;
  email: string;
  role: string;
  fullName: string;
  ventureId: string | null;
}

interface ApprovalItem {
  id: string;
  orderId: string;
  approverId: string;
  approvalLevel: string;
  decision: string;
  comment: string | null;
  decidedAt: string | null;
  createdAt: string;
  order: {
    id: string;
    positionName: string;
    level: string;
    quantity: number;
    recruitmentType: string;
    status: string;
    hcCheckResult: string | null;
    createdAt: string;
    hiringManager: { id: string; fullName: string; email: string };
    venture: { id: string; name: string; code: string };
  };
  approver: { id: string; fullName: string; email: string; role: string };
}

export default function ApprovalsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");
  const [inlineAction, setInlineAction] = useState<{ id: string; type: "approve" | "reject" } | null>(null);
  const [inlineComment, setInlineComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          if (data.user.role !== "CEO_VENTURE" && data.user.role !== "CEO_GROUP") {
            router.push("/orders");
            return;
          }
          setUser(data.user);
        } else {
          router.push("/login");
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    try {
      const status = activeTab === "pending" ? "PENDING" : "all";
      const res = await fetch(`/api/approvals?status=${status}`);
      if (res.ok) {
        const data = await res.json();
        if (activeTab === "completed") {
          setApprovals((data.approvals || []).filter((a: ApprovalItem) => a.decision !== "PENDING"));
        } else {
          setApprovals(data.approvals || []);
        }
      }
    } catch {
      toast.error("Lỗi tải danh sách duyệt");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { if (user) fetchApprovals(); }, [user, fetchApprovals]);

  const handleInlineApprove = async (orderId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: inlineComment || null }),
      });
      if (res.ok) {
        toast.success("Đã duyệt thành công!");
        setInlineAction(null);
        setInlineComment("");
        fetchApprovals();
      } else {
        const d = await res.json();
        toast.error(d.error || "Duyệt thất bại");
      }
    } catch {
      toast.error("Lỗi kết nối server");
    } finally {
      setActionLoading(false);
    }
  };

  const handleInlineReject = async (orderId: string) => {
    if (!inlineComment.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: inlineComment }),
      });
      if (res.ok) {
        toast.success("Đã từ chối order");
        setInlineAction(null);
        setInlineComment("");
        fetchApprovals();
      } else {
        const d = await res.json();
        toast.error(d.error || "Từ chối thất bại");
      }
    } catch {
      toast.error("Lỗi kết nối server");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Approvals</h2>
        <p className="text-slate-500 text-sm mt-1">Quản lý yêu cầu duyệt order tuyển dụng</p>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button onClick={() => setActiveTab("pending")} className={`px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${activeTab === "pending" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          Chờ duyệt
        </button>
        <button onClick={() => setActiveTab("completed")} className={`px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors ${activeTab === "completed" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
          Đã xử lý
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : approvals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <FileX className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">
            {activeTab === "pending" ? "Không có yêu cầu chờ duyệt" : "Chưa có yêu cầu đã xử lý"}
          </h3>
          <p className="text-slate-500 text-sm">
            {activeTab === "pending" ? "Tất cả yêu cầu đã được xử lý" : "Chưa có lịch sử duyệt"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {approvals.map((approval) => {
            const hcInfo = approval.order.hcCheckResult ? HC_CHECK_CONFIG[approval.order.hcCheckResult] : null;
            const statusInfo = STATUS_CONFIG[approval.order.status] || { label: approval.order.status, color: "text-slate-600", bg: "bg-slate-100" };
            const isInlineTarget = inlineAction?.id === approval.id;

            return (
              <div key={approval.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
                <div className="cursor-pointer" onClick={() => router.push(`/orders/${approval.order.id}`)}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{approval.order.positionName}</h3>
                      <p className="text-xs text-slate-500">{approval.order.level} &middot; SL: {approval.order.quantity}</p>
                    </div>
                    <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${statusInfo.bg} ${statusInfo.color}`}>{statusInfo.label}</span>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <User className="w-3.5 h-3.5" />{approval.order.hiringManager.fullName}
                    </div>
                    <p className="text-xs text-slate-500">{approval.order.venture.name} &middot; {formatDate(approval.order.createdAt)}</p>
                    {hcInfo && (
                      <div className={`inline-flex items-center gap-1 text-xs font-medium ${hcInfo.color}`}>
                        <span>{hcInfo.icon}</span>{hcInfo.label}
                      </div>
                    )}
                  </div>
                </div>

                {activeTab === "pending" && !isInlineTarget && (
                  <div className="flex gap-2 pt-3 border-t border-slate-100">
                    <button onClick={(e) => { e.stopPropagation(); setInlineAction({ id: approval.id, type: "approve" }); setInlineComment(""); }} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg cursor-pointer transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" />Duyệt
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setInlineAction({ id: approval.id, type: "reject" }); setInlineComment(""); }} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg cursor-pointer transition-colors">
                      <XCircle className="w-3.5 h-3.5" />Từ chối
                    </button>
                  </div>
                )}

                {isInlineTarget && (
                  <div className="pt-3 border-t border-slate-100 space-y-2" onClick={(e) => e.stopPropagation()}>
                    <textarea
                      value={inlineComment}
                      onChange={(e) => setInlineComment(e.target.value)}
                      placeholder={inlineAction.type === "reject" ? "Lý do từ chối (bắt buộc)..." : "Nhận xét (không bắt buộc)..."}
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => inlineAction.type === "approve" ? handleInlineApprove(approval.order.id) : handleInlineReject(approval.order.id)}
                        disabled={actionLoading}
                        className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg cursor-pointer transition-colors text-white ${inlineAction.type === "approve" ? "bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400" : "bg-red-600 hover:bg-red-700 disabled:bg-red-400"}`}
                      >
                        {actionLoading ? "Đang xử lý..." : inlineAction.type === "approve" ? "Xác nhận duyệt" : "Xác nhận từ chối"}
                      </button>
                      <button onClick={() => { setInlineAction(null); setInlineComment(""); }} className="px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                        Hủy
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "completed" && (
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {approval.decision === "APPROVED" && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                      {approval.decision === "REJECTED" && <XCircle className="w-4 h-4 text-red-500" />}
                      {approval.decision === "CANCELLED" && <AlertTriangle className="w-4 h-4 text-slate-400" />}
                      <span className={`text-xs font-medium ${approval.decision === "APPROVED" ? "text-emerald-600" : approval.decision === "REJECTED" ? "text-red-600" : "text-slate-500"}`}>
                        {approval.decision === "APPROVED" ? "Đã duyệt" : approval.decision === "REJECTED" ? "Từ chối" : "Đã hủy"}
                      </span>
                      {approval.decidedAt && <span className="text-xs text-slate-400">{formatDate(approval.decidedAt)}</span>}
                    </div>
                    {approval.comment && <p className="text-xs text-slate-600 mt-1 p-2 bg-slate-50 rounded-lg">{approval.comment}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
