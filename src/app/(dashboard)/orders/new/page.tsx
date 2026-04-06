"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Send, ArrowLeft, BookOpen, ChevronDown, X, Search, Eye } from "lucide-react";
import toast from "react-hot-toast";

interface UserInfo {
  userId: string;
  email: string;
  role: string;
  fullName: string;
  ventureId: string | null;
}

interface Venture {
  id: string;
  name: string;
  code: string;
}

interface JDTemplate {
  id: string;
  ventureId: string;
  positionName: string;
  level: string | null;
  jdContent: string | null;
  candidateProfile: string | null;
  venture: Venture;
}

const LEVELS = [
  { value: "Junior", label: "Junior" },
  { value: "Mid", label: "Mid" },
  { value: "Senior", label: "Senior" },
  { value: "Lead", label: "Lead" },
  { value: "Manager", label: "Manager" },
];

export default function NewOrderPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [recruitmentType, setRecruitmentType] = useState<"NEW" | "REPLACEMENT">("NEW");
  const [positionName, setPositionName] = useState("");
  const [level, setLevel] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [jdUrl, setJdUrl] = useState("");

  // JD Template state
  const [jdTemplates, setJdTemplates] = useState<JDTemplate[]>([]);
  const [selectedJdId, setSelectedJdId] = useState<string | null>(null);
  const [selectedJdTemplate, setSelectedJdTemplate] = useState<JDTemplate | null>(null);
  const [jdSearchQuery, setJdSearchQuery] = useState("");
  const [showJdDropdown, setShowJdDropdown] = useState(false);
  const [showJdPreview, setShowJdPreview] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          if (data.user.role !== "HIRING_MANAGER") {
            toast.error("Chỉ Hiring Manager mới được tạo order");
            router.push("/orders");
            return;
          }
          setUser(data.user);
        } else {
          router.push("/login");
        }
      })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  // Fetch JD templates
  useEffect(() => {
    fetch("/api/jd-templates")
      .then((r) => r.json())
      .then((data) => {
        setJdTemplates(data.templates || []);
      })
      .catch(() => {});
  }, []);

  const filteredJdTemplates = jdTemplates.filter((t) =>
    t.positionName.toLowerCase().includes(jdSearchQuery.toLowerCase())
  );

  const handleSelectJdTemplate = (template: JDTemplate) => {
    setSelectedJdId(template.id);
    setSelectedJdTemplate(template);
    setPositionName(template.positionName);
    if (template.level) {
      setLevel(template.level);
    }
    setShowJdDropdown(false);
    setJdSearchQuery("");
  };

  const handleClearJdTemplate = () => {
    setSelectedJdId(null);
    setSelectedJdTemplate(null);
    setShowJdDropdown(false);
    setJdSearchQuery("");
  };

  const validateForm = (): boolean => {
    if (!positionName.trim()) {
      toast.error("Vui lòng nhập tên vị trí");
      return false;
    }
    if (!level) {
      toast.error("Vui lòng chọn level");
      return false;
    }
    if (quantity < 1) {
      toast.error("Số lượng phải lớn hơn 0");
      return false;
    }
    if (!reason.trim()) {
      toast.error("Vui lòng nhập lý do tuyển dụng");
      return false;
    }
    return true;
  };

  const createOrder = async () => {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        positionName,
        level,
        quantity,
        recruitmentType,
        reason,
        jdAttachmentUrl: jdUrl || null,
        jdTemplateId: selectedJdId || null,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Tạo order thất bại");
    }

    return res.json();
  };

  const handleSaveDraft = async () => {
    if (!validateForm()) return;
    setSubmitting(true);

    try {
      await createOrder();
      toast.success("Đã lưu nháp thành công!");
      router.push("/orders");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi tạo order");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAndSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);

    try {
      const order = await createOrder();

      // Submit for approval
      const submitRes = await fetch(`/api/orders/${order.id}/submit`, {
        method: "POST",
      });

      if (!submitRes.ok) {
        const data = await submitRes.json();
        throw new Error(data.error || "Gửi duyệt thất bại");
      }

      toast.success("Đã tạo và gửi duyệt thành công!");
      router.push(`/orders/${order.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Lỗi gửi duyệt");
    } finally {
      setSubmitting(false);
    }
  };

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

  if (!user || user.role !== "HIRING_MANAGER") return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push("/orders")}
        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 text-sm cursor-pointer transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại danh sách
      </button>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Tạo Order Tuyển Dụng</h2>

        <div className="space-y-5">
          {/* Recruitment Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Loại tuyển <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label
                className={`flex-1 flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                  recruitmentType === "NEW"
                    ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <input
                  type="radio"
                  name="recruitmentType"
                  value="NEW"
                  checked={recruitmentType === "NEW"}
                  onChange={() => setRecruitmentType("NEW")}
                  className="w-4 h-4 text-blue-600 accent-blue-600"
                />
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">Tuyển mới (NEW)</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Vị trí mới trong kế hoạch</div>
                </div>
              </label>
              <label
                className={`flex-1 flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                  recruitmentType === "REPLACEMENT"
                    ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <input
                  type="radio"
                  name="recruitmentType"
                  value="REPLACEMENT"
                  checked={recruitmentType === "REPLACEMENT"}
                  onChange={() => setRecruitmentType("REPLACEMENT")}
                  className="w-4 h-4 text-blue-600 accent-blue-600"
                />
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">Thay thế (REPLACEMENT)</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Thay thế nhân sự nghỉ việc</div>
                </div>
              </label>
            </div>
          </div>

          {/* JD Template Selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-500" />
                Chọn JD Template
              </span>
              <span className="text-slate-400 text-xs font-normal ml-1">(không bắt buộc)</span>
            </label>

            {selectedJdTemplate ? (
              <div className="border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {selectedJdTemplate.positionName}
                    </span>
                    {selectedJdTemplate.level && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-full font-medium">
                        {selectedJdTemplate.level}
                      </span>
                    )}
                    <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full font-medium">
                      {selectedJdTemplate.venture.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowJdPreview(!showJdPreview)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg cursor-pointer transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleClearJdTemplate}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg cursor-pointer transition-colors"
                      title="Bỏ chọn"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {showJdPreview && selectedJdTemplate.jdContent && (
                  <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-800">
                    <div className="bg-white dark:bg-slate-700 rounded-lg p-3 text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                      {selectedJdTemplate.jdContent}
                    </div>
                    {selectedJdTemplate.candidateProfile && (
                      <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-3 mt-2 text-xs text-amber-800 dark:text-amber-300 whitespace-pre-wrap leading-relaxed">
                        <span className="font-semibold">Hồ sơ ứng viên: </span>
                        {selectedJdTemplate.candidateProfile}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowJdDropdown(!showJdDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 cursor-pointer transition-colors text-left"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Chọn JD template có sẵn...
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showJdDropdown ? "rotate-180" : ""}`} />
                </button>

                {showJdDropdown && (
                  <div className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
                    {/* Search input */}
                    <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={jdSearchQuery}
                          onChange={(e) => setJdSearchQuery(e.target.value)}
                          placeholder="Tìm kiếm template..."
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-400"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Template list */}
                    <div className="max-h-64 overflow-y-auto">
                      {filteredJdTemplates.length > 0 ? (
                        filteredJdTemplates.map((template) => (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => handleSelectJdTemplate(template)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer transition-colors text-left border-b border-slate-50 dark:border-slate-700 last:border-b-0"
                          >
                            <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                {template.positionName}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {template.level && (
                                  <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded font-medium">
                                    {template.level}
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400">
                                  {template.venture.code}
                                </span>
                              </div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
                          Không tìm thấy template
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Position Name */}
          <div>
            <label htmlFor="positionName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Vị trí <span className="text-red-500">*</span>
            </label>
            <input
              id="positionName"
              type="text"
              value={positionName}
              onChange={(e) => setPositionName(e.target.value)}
              placeholder="VD: Backend Developer, Product Manager..."
              className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500"
            />
            {selectedJdTemplate && positionName !== selectedJdTemplate.positionName && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Tên vị trí đã được chỉnh sửa thủ công (khác với template)
              </p>
            )}
          </div>

          {/* Level */}
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Level <span className="text-red-500">*</span>
            </label>
            <select
              id="level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 cursor-pointer"
            >
              <option value="">-- Chọn level --</option>
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Số lượng <span className="text-red-500">*</span>
            </label>
            <input
              id="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 hover:border-slate-300 focus:border-blue-500"
            />
          </div>

          {/* Reason */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Lý do tuyển <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Mô tả lý do cần tuyển dụng..."
              rows={4}
              className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 resize-none"
            />
          </div>

          {/* JD URL */}
          <div>
            <label htmlFor="jdUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              JD URL <span className="text-slate-400 dark:text-slate-500 text-xs font-normal">(không bắt buộc)</span>
            </label>
            <input
              id="jdUrl"
              type="text"
              value={jdUrl}
              onChange={(e) => setJdUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={handleSaveDraft}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl cursor-pointer disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Lưu nháp
              </>
            )}
          </button>
          <button
            onClick={handleSaveAndSubmit}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl cursor-pointer disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Lưu & Gửi duyệt
              </>
            )}
          </button>
        </div>

        {/* Cancel */}
        <div className="text-center mt-4">
          <button
            onClick={() => router.push("/orders")}
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer transition-colors"
          >
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  );
}
