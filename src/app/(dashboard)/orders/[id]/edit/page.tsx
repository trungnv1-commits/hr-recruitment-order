"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save, Send, ArrowLeft, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface UserInfo {
  userId: string;
  email: string;
  role: string;
  fullName: string;
  ventureId: string | null;
}

interface ApprovalRecord {
  id: string;
  decision: string;
  comment: string | null;
  decidedAt: string | null;
  approver: { fullName: string };
}

interface Order {
  id: string;
  positionName: string;
  level: string;
  quantity: number;
  recruitmentType: string;
  reason: string;
  status: string;
  jdAttachmentUrl: string | null;
  hiringManagerId: string;
  approvalRecords: ApprovalRecord[];
}

const LEVELS = [
  { value: "Junior", label: "Junior" },
  { value: "Mid", label: "Mid" },
  { value: "Senior", label: "Senior" },
  { value: "Lead", label: "Lead" },
  { value: "Manager", label: "Manager" },
];

export default function EditOrderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [recruitmentType, setRecruitmentType] = useState<"NEW" | "REPLACEMENT">("NEW");
  const [positionName, setPositionName] = useState("");
  const [level, setLevel] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [jdUrl, setJdUrl] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          if (data.user.role !== "HIRING_MANAGER") {
            toast.error("Chỉ Hiring Manager mới được chỉnh sửa order");
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

  const fetchOrder = useCallback(async () => {
    if (!id || !user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.hiringManagerId !== user.userId) {
          toast.error("Bạn không có quyền chỉnh sửa order này");
          router.push("/orders");
          return;
        }
        if (!["DRAFT", "REJECTED"].includes(data.status)) {
          toast.error("Chỉ có thể chỉnh sửa order ở trạng thái Nháp hoặc Từ chối");
          router.push(`/orders/${id}`);
          return;
        }
        setOrder(data);
        setRecruitmentType(data.recruitmentType);
        setPositionName(data.positionName);
        setLevel(data.level);
        setQuantity(data.quantity);
        setReason(data.reason);
        setJdUrl(data.jdAttachmentUrl || "");
      } else {
        toast.error("Không thể tải thông tin order");
        router.push("/orders");
      }
    } catch {
      toast.error("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  }, [id, user, router]);

  useEffect(() => { if (user) fetchOrder(); }, [user, fetchOrder]);

  const validateForm = (): boolean => {
    if (!positionName.trim()) { toast.error("Vui lòng nhập tên vị trí"); return false; }
    if (!level) { toast.error("Vui lòng chọn level"); return false; }
    if (quantity < 1) { toast.error("Số lượng phải lớn hơn 0"); return false; }
    if (!reason.trim()) { toast.error("Vui lòng nhập lý do tuyển dụng"); return false; }
    return true;
  };

  const updateOrder = async () => {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ positionName, level, quantity, recruitmentType, reason, jdAttachmentUrl: jdUrl || null }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Cập nhật thất bại");
    }
    return res.json();
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await updateOrder();
      toast.success("Cập nhật thành công!");
      router.push(`/orders/${id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi cập nhật");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAndResubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await updateOrder();
      const submitRes = await fetch(`/api/orders/${id}/submit`, { method: "POST" });
      if (!submitRes.ok) {
        const data = await submitRes.json();
        throw new Error(data.error || "Gửi duyệt thất bại");
      }
      toast.success("Cập nhật và gửi duyệt thành công!");
      router.push(`/orders/${id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi gửi duyệt");
    } finally {
      setSubmitting(false);
    }
  };

  const rejectionRecord = order?.approvalRecords.find((r) => r.decision === "REJECTED");

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
              <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!user || !order) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => router.push(`/orders/${id}`)} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 text-sm cursor-pointer transition-colors">
        <ArrowLeft className="w-4 h-4" />Quay lại chi tiết order
      </button>

      {order.status === "REJECTED" && rejectionRecord && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-red-900 dark:text-red-300">Order bị từ chối</h3>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">Bởi: {rejectionRecord.approver.fullName}</p>
              {rejectionRecord.comment && <p className="text-sm text-red-700 dark:text-red-400 mt-1 font-medium">{rejectionRecord.comment}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Chỉnh sửa Order</h2>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Loại tuyển <span className="text-red-500">*</span></label>
            <div className="flex gap-4">
              <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${recruitmentType === "NEW" ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"}`}>
                <input type="radio" name="recruitmentType" value="NEW" checked={recruitmentType === "NEW"} onChange={() => setRecruitmentType("NEW")} className="w-4 h-4 text-blue-600 accent-blue-600" />
                <div><div className="text-sm font-medium text-slate-900 dark:text-white">Tuyển mới (NEW)</div><div className="text-xs text-slate-500 dark:text-slate-400">Vị trí mới trong kế hoạch</div></div>
              </label>
              <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${recruitmentType === "REPLACEMENT" ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30" : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"}`}>
                <input type="radio" name="recruitmentType" value="REPLACEMENT" checked={recruitmentType === "REPLACEMENT"} onChange={() => setRecruitmentType("REPLACEMENT")} className="w-4 h-4 text-blue-600 accent-blue-600" />
                <div><div className="text-sm font-medium text-slate-900 dark:text-white">Thay thế (REPLACEMENT)</div><div className="text-xs text-slate-500 dark:text-slate-400">Thay thế nhân sự nghỉ việc</div></div>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="positionName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Vị trí <span className="text-red-500">*</span></label>
            <input id="positionName" type="text" value={positionName} onChange={(e) => setPositionName(e.target.value)} placeholder="VD: Backend Developer, Product Manager..." className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500" />
          </div>

          <div>
            <label htmlFor="level" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Level <span className="text-red-500">*</span></label>
            <select id="level" value={level} onChange={(e) => setLevel(e.target.value)} className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 cursor-pointer">
              <option value="">-- Chọn level --</option>
              {LEVELS.map((l) => (<option key={l.value} value={l.value}>{l.label}</option>))}
            </select>
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Số lượng <span className="text-red-500">*</span></label>
            <input id="quantity" type="number" min={1} value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 hover:border-slate-300 focus:border-blue-500" />
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Lý do tuyển <span className="text-red-500">*</span></label>
            <textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Mô tả lý do cần tuyển dụng..." rows={4} className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 resize-none" />
          </div>

          <div>
            <label htmlFor="jdUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">JD URL <span className="text-slate-400 dark:text-slate-500 text-xs font-normal">(không bắt buộc)</span></label>
            <input id="jdUrl" type="text" value={jdUrl} onChange={(e) => setJdUrl(e.target.value)} placeholder="https://..." className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
          <button onClick={handleSave} disabled={submitting} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl cursor-pointer disabled:cursor-not-allowed transition-colors">
            {submitting ? <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" /> : <><Save className="w-5 h-5" />Lưu</>}
          </button>
          <button onClick={handleSaveAndResubmit} disabled={submitting} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl cursor-pointer disabled:cursor-not-allowed transition-colors">
            {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className="w-5 h-5" />Lưu & Gửi lại</>}
          </button>
        </div>

        <div className="text-center mt-4">
          <button onClick={() => router.push(`/orders/${id}`)} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer transition-colors">Hủy bỏ</button>
        </div>
      </div>
    </div>
  );
}
