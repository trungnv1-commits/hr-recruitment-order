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
        toast.error("Kh\u00f4ng th\u1ec3 t\u1ea3i th\u00f4ng tin order");
        router.push("/orders");
      }
    } catch {
      toast.error("L\u1ed7i k\u1ebft n\u1ed1i server");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { if (user) fetchOrder(); }, [user, fetchOrder]);

  const handleSubmit = async () => {
    if (!confirm("B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n g\u1eedi duy\u1ec7t order n\u00e0y?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${id}/submit`, { method: "POST" });
      if (res.ok) { toast.success("\u0110\u00e3 g\u1eedi duy\u1ec7t th\u00e0nh c\u00f4ng!"); fetchOrder(); }
      else { const d = await res.json(); toast.error(d.error || "G\u1eedi duy\u1ec7t th\u1ea5t b\u1ea1i"); }
    } catch { toast.error("L\u1ed7i k\u1ebft n\u1ed1i server"); }
    finally { setActionLoading(false); }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${id}/approve`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: approveComment || null }),
      });
      if (res.ok) { toast.success("\u0110\u00e3 duy\u1ec7t th\u00e0nh c\u00f4ng!"); setShowApproveForm(false); setApproveComment(""); fetchOrder(); }
      else { const d = await res.json(); toast.error(d.error || "Duy\u1ec7t th\u1ea5t b\u1ea1i"); }
    } catch { toast.error("L\u1ed7i k\u1ebft n\u1ed1i server"); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!rejectComment.trim()) { toast.error("Vui l\u00f2ng nh\u1eadp l\u00fd do t\u1eeb ch\u1ed1i"); return; }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${id}/reject`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: rejectComment }),
      });
      if (res.ok) { toast.success("\u0110\u00e3 t\u1eeb ch\u1ed1i order"); setShowRejectForm(false); setRejectComment(""); fetchOrder(); }
      else { const d = await res.json(); toast.error(d.error || "T\u1eeb ch\u1ed1i th\u1ea5t b\u1ea1i"); }
    } catch { toast.error("L\u1ed7i k\u1ebft n\u1ed1i server"); }
    finally { setActionLoading(false); }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) { toast.error("Vui l\u00f2ng nh\u1eadp l\u00fd do h\u1ee7y"); return; }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${id}/cancel`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason }),
      });
      if (res.ok) { toast.success("\u0110\u00e3 h\u1ee7y order"); setShowCancelForm(false); setCancelReason(""); fetchOrder(); }
      else { const d = await res.json(); toast.error(d.error || "H\u1ee7y th\u1ea5t b\u1ea1i"); }
    } catch { toast.error("L\u1ed7i k\u1ebft n\u1ed1i server"); }
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
        <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          {[...Array(6)].map((_, i) => (<div key={i} className="flex gap-4"><div className="h-5 w-24 bg-slate-200 rounded animate-pulse" /><div className="h-5 w-48 bg-slate-200 rounded animate-pulse" /></div>))}
        </div>
      </div>
    );
  }

  if (!order || !user) return null;

  const statusInfo = STATUS_CONFIG[order.status] || { label: order.status, color: "text-slate-600", bg: "bg-slate-100" };
  const hcInfo = order.hcCheckResult ? HC_CHECK_CONFIG[order.hcCheckResult] : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button onClick={() => router.push("/orders")} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm cursor-pointer transition-colors">
        <ArrowLeft className="w-4 h-4" />Quay l\u1ea1i danh s\u00e1ch
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{order.positionName}</h2>
                <p className="text-sm text-slate-500 mt-1">Level: {order.level}</p>
              </div>
              <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${statusInfo.bg} ${statusInfo.color}`}>{statusInfo.label}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3"><div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center"><Briefcase className="w-4 h-4 text-blue-600" /></div><div><p className="text-xs text-slate-500">Lo\u1ea1i tuy\u1ec3n</p><p className="text-sm font-medium text-slate-900">{order.recruitmentType === "NEW" ? "Tuy\u1ec3n m\u1edbi" : "Thay th\u1ebf"}</p></div></div>
              <div className="flex items-center gap-3"><div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center"><Hash className="w-4 h-4 text-emerald-600" /></div><div><p className="text-xs text-slate-500">S\u1ed1 l\u01b0\u1ee3ng</p><p className="text-sm font-medium text-slate-900">{order.quantity}</p></div></div>
              <div className="flex items-center gap-3"><div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center"><User className="w-4 h-4 text-amber-600" /></div><div><p className="text-xs text-slate-500">Ng\u01b0\u1eddi t\u1ea1o</p><p className="text-sm font-medium text-slate-900">{order.hiringManager.fullName}</p></div></div>
              <div className="flex items-center gap-3"><div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center"><Building2 className="w-4 h-4 text-purple-600" /></div><div><p className="text-xs text-slate-500">Venture</p><p className="text-sm font-medium text-slate-900">{order.venture.name}</p></div></div>
              <div className="flex items-center gap-3"><div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center"><Calendar className="w-4 h-4 text-slate-600" /></div><div><p className="text-xs text-slate-500">Ng\u00e0y t\u1ea1o</p><p className="text-sm font-medium text-slate-900">{formatDate(order.createdAt)}</p></div></div>
              {order.jdAttachmentUrl && (<div className="flex items-center gap-3"><div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center"><FileText className="w-4 h-4 text-indigo-600" /></div><div><p className="text-xs text-slate-500">JD</p><a href={order.jdAttachmentUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">Xem JD <ExternalLink className="w-3 h-3" /></a></div></div>)}
            </div>
            <div className="mt-5 pt-5 border-t border-slate-100"><p className="text-xs text-slate-500 mb-1">L\u00fd do tuy\u1ec3n</p><p className="text-sm text-slate-700 whitespace-pre-wrap">{order.reason}</p></div>
            {hcInfo && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-2">HC Check</p>
                <div className={`inline-flex items-center gap-1.5 text-sm font-medium ${hcInfo.color}`}><span>{hcInfo.icon}</span>{hcInfo.label}</div>
                {order.hcOverReason && (<div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl"><div className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" /><p className="text-sm text-amber-700">{order.hcOverReason}</p></div></div>)}
              </div>
            )}
          </div>

          {order.status === "CANCELLED" && (
            <div className="bg-white rounded-2xl border border-red-200 p-6">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0"><Ban className="w-4 h-4 text-red-600" /></div>
                <div>
                  <h3 className="text-sm font-semibold text-red-900">Order \u0111\u00e3 b\u1ecb h\u1ee7y</h3>
                  {order.canceller && <p className="text-sm text-red-700 mt-1">B\u1edfi: {order.canceller.fullName}</p>}
                  {order.cancelledAt && <p className="text-sm text-red-600 mt-0.5">L\u00fac: {formatDate(order.cancelledAt)}</p>}
                  {order.cancelledReason && <p className="text-sm text-red-700 mt-2 p-3 bg-red-50 rounded-lg">{order.cancelledReason}</p>}
                </div>
              </div>
            </div>
          )}

          {showApproveForm && (
            <div className="bg-white rounded-2xl border border-emerald-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Duy\u1ec7t Order</h3>
              <textarea value={approveComment} onChange={(e) => setApproveComment(e.target.value)} placeholder="Nh\u1eadn x\u00e9t (kh\u00f4ng b\u1eaft bu\u1ed9c)..." rows={3} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 resize-none mb-3" />
              <div className="flex gap-3">
                <button onClick={handleApprove} disabled={actionLoading} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium rounded-xl cursor-pointer transition-colors">{actionLoading ? "\u0110ang x\u1eed l\u00fd..." : "X\u00e1c nh\u1eadn duy\u1ec7t"}</button>
                <button onClick={() => { setShowApproveForm(false); setApproveComment(""); }} className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl cursor-pointer transition-colors">H\u1ee7y</button>
              </div>
            </div>
          )}
          {showRejectForm && (
            <div className="bg-white rounded-2xl border border-red-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">T\u1eeb ch\u1ed1i Order</h3>
              <textarea value={rejectComment} onChange={(e) => setRejectComment(e.target.value)} placeholder="L\u00fd do t\u1eeb ch\u1ed1i (b\u1eaft bu\u1ed9c)..." rows={3} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 resize-none mb-3" />
              <div className="flex gap-3">
                <button onClick={handleReject} disabled={actionLoading} className="px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-xl cursor-pointer transition-colors">{actionLoading ? "\u0110ang x\u1eed l\u00fd..." : "X\u00e1c nh\u1eadn t\u1eeb ch\u1ed1i"}</button>
                <button onClick={() => { setShowRejectForm(false); setRejectComment(""); }} className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl cursor-pointer transition-colors">H\u1ee7y</button>
              </div>
            </div>
          )}
          {showCancelForm && (
            <div className="bg-white rounded-2xl border border-red-200 p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">H\u1ee7y Order</h3>
              <p className="text-sm text-slate-500 mb-3">B\u1ea1n \u0111ang h\u1ee7y order <strong>{order.positionName}</strong> ({order.level}, SL: {order.quantity})</p>
              <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="L\u00fd do h\u1ee7y (b\u1eaft bu\u1ed9c)..." rows={3} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 resize-none mb-3" />
              <div className="flex gap-3">
                <button onClick={handleCancel} disabled={actionLoading} className="px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-xl cursor-pointer transition-colors">{actionLoading ? "\u0110ang x\u1eed l\u00fd..." : "X\u00e1c nh\u1eadn h\u1ee7y"}</button>
                <button onClick={() => { setShowCancelForm(false); setCancelReason(""); }} className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl cursor-pointer transition-colors">Quay l\u1ea1i</button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">L\u1ecbch s\u1eed duy\u1ec7t</h3>
            {order.approvalRecords.length === 0 ? (<p className="text-sm text-slate-400">Ch\u01b0a c\u00f3 th\u00f4ng tin duy\u1ec7t</p>) : (
              <div className="space-y-4">
                {order.approvalRecords.map((record, index) => {
                  const isLast = index === order.approvalRecords.length - 1;
                  const levelInfo = ROLE_LABELS[record.approvalLevel] || { label: record.approvalLevel, color: "text-slate-700", bg: "bg-slate-50" };
                  let decisionIcon; let decisionColor; let decisionLabel;
                  switch (record.decision) {
                    case "APPROVED": decisionIcon = <CheckCircle className="w-5 h-5 text-emerald-500" />; decisionColor = "text-emerald-600"; decisionLabel = "\u0110\u00e3 duy\u1ec7t"; break;
                    case "REJECTED": decisionIcon = <XCircle className="w-5 h-5 text-red-500" />; decisionColor = "text-red-600"; decisionLabel = "T\u1eeb ch\u1ed1i"; break;
                    case "CANCELLED": decisionIcon = <Ban className="w-5 h-5 text-slate-400" />; decisionColor = "text-slate-500"; decisionLabel = "\u0110\u00e3 h\u1ee7y"; break;
                    default: decisionIcon = <Clock className="w-5 h-5 text-amber-500" />; decisionColor = "text-amber-600"; decisionLabel = "Ch\u1edd duy\u1ec7t";
                  }
                  return (
                    <div key={record.id} className="relative">
                      {!isLast && <div className="absolute left-[9px] top-8 w-0.5 h-[calc(100%+0.5rem)] bg-slate-200" />}
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">{decisionIcon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">{record.approver.fullName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${levelInfo.bg} ${levelInfo.color}`}>{levelInfo.label}</span>
                            <span className={`text-xs font-medium ${decisionColor}`}>{decisionLabel}</span>
                          </div>
                          {record.comment && <p className="text-xs text-slate-600 mt-1.5 p-2 bg-slate-50 rounded-lg">{record.comment}</p>}
                          {record.decidedAt && <p className="text-xs text-slate-400 mt-1">{formatDate(record.decidedAt)}</p>}
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
                <button onClick={() => router.push(`/orders/${id}/edit`)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl cursor-pointer transition-colors"><Pencil className="w-4 h-4" />Ch\u1ec9nh s\u1eeda</button>
                <button onClick={handleSubmit} disabled={actionLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl cursor-pointer transition-colors"><Send className="w-4 h-4" />G\u1eedi duy\u1ec7t</button>
                <button onClick={() => setShowCancelForm(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-medium rounded-xl cursor-pointer transition-colors"><Ban className="w-4 h-4" />H\u1ee7y order</button>
              </>)}
              {isHM && order.status === "PENDING_APPROVAL" && (
                <button onClick={() => setShowCancelForm(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-medium rounded-xl cursor-pointer transition-colors"><Ban className="w-4 h-4" />H\u1ee7y order</button>
              )}
              {isHM && order.status === "REJECTED" && (
                <button onClick={() => router.push(`/orders/${id}/edit`)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl cursor-pointer transition-colors"><Pencil className="w-4 h-4" />Ch\u1ec9nh s\u1eeda & G\u1eedi l\u1ea1i</button>
              )}
              {hasPendingRecord && order.status === "PENDING_APPROVAL" && (<>
                <button onClick={() => { setShowApproveForm(true); setShowRejectForm(false); }} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl cursor-pointer transition-colors"><CheckCircle className="w-4 h-4" />Duy\u1ec7t</button>
                <button onClick={() => { setShowRejectForm(true); setShowApproveForm(false); }} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl cursor-pointer transition-colors"><XCircle className="w-4 h-4" />T\u1eeb ch\u1ed1i</button>
              </>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
