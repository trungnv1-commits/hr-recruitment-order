"use client";

import { useEffect, useState, useCallback } from "react";
import { BookOpen, Search, Plus, Eye, Edit3, Trash2, X, Building2, FileText, Save } from "lucide-react";
import toast from "react-hot-toast";

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
  createdAt: string;
  updatedAt: string;
  venture: Venture;
}

interface UserInfo {
  userId: string;
  email: string;
  role: string;
  fullName: string;
  ventureId: string | null;
}

// ===================== VIEW MODAL =====================
function ViewModal({
  template,
  onClose,
}: {
  template: JDTemplate;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{template.positionName}</h3>
            <div className="flex items-center gap-2 mt-1">
              {template.level && (
                <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                  {template.level}
                </span>
              )}
              <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">
                {template.venture.code}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {template.jdContent && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                Nội dung JD
              </h4>
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {template.jdContent}
              </div>
            </div>
          )}

          {template.candidateProfile && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Hồ sơ ứng viên</h4>
              <div className="bg-amber-50 rounded-xl p-4 text-sm text-amber-800 whitespace-pre-wrap leading-relaxed">
                {template.candidateProfile}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

// ===================== ADD/EDIT MODAL =====================
function FormModal({
  template,
  ventures,
  onClose,
  onSaved,
}: {
  template: JDTemplate | null;
  ventures: Venture[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!template;
  const [ventureId, setVentureId] = useState(template?.ventureId || "");
  const [positionName, setPositionName] = useState(template?.positionName || "");
  const [level, setLevel] = useState(template?.level || "");
  const [jdContent, setJdContent] = useState(template?.jdContent || "");
  const [candidateProfile, setCandidateProfile] = useState(template?.candidateProfile || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ventureId) {
      toast.error("Vui lòng chọn venture");
      return;
    }
    if (!positionName.trim()) {
      toast.error("Vui lòng nhập tên vị trí");
      return;
    }
    if (!jdContent.trim()) {
      toast.error("Vui lòng nhập nội dung JD");
      return;
    }

    setSaving(true);
    try {
      const url = isEdit ? `/api/jd-templates/${template.id}` : "/api/jd-templates";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ventureId,
          positionName: positionName.trim(),
          level: level.trim() || null,
          jdContent: jdContent.trim(),
          candidateProfile: candidateProfile.trim() || null,
        }),
      });

      if (res.ok) {
        toast.success(isEdit ? "Cập nhật JD template thành công!" : "Tạo JD template thành công!");
        onSaved();
      } else {
        const data = await res.json();
        toast.error(data.error || "Thao tác thất bại");
      }
    } catch {
      toast.error("Lỗi kết nối server");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">
            {isEdit ? "Chỉnh sửa JD Template" : "Tạo JD Template mới"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Venture <span className="text-red-500">*</span>
            </label>
            <select
              value={ventureId}
              onChange={(e) => setVentureId(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 hover:border-slate-300 focus:border-blue-500 cursor-pointer"
            >
              <option value="">Chọn venture...</option>
              {ventures.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Vị trí <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={positionName}
                onChange={(e) => setPositionName(e.target.value)}
                placeholder="VD: Backend Developer, Product Manager..."
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 hover:border-slate-300 focus:border-blue-500 cursor-pointer"
              >
                <option value="">-- Chọn level --</option>
                <option value="Junior">Junior</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nội dung JD <span className="text-red-500">*</span>
            </label>
            <textarea
              value={jdContent}
              onChange={(e) => setJdContent(e.target.value)}
              placeholder="Mô tả công việc, yêu cầu, quyền lợi..."
              rows={10}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 resize-none font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Hồ sơ ứng viên
            </label>
            <textarea
              value={candidateProfile}
              onChange={(e) => setCandidateProfile(e.target.value)}
              placeholder="Mô tả ứng viên lý tưởng..."
              rows={3}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ===================== MAIN PAGE =====================
export default function JDRepositoryPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [templates, setTemplates] = useState<JDTemplate[]>([]);
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewTemplate, setViewTemplate] = useState<JDTemplate | null>(null);
  const [editTemplate, setEditTemplate] = useState<JDTemplate | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const isHR = user?.role === "HR";

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/jd-templates?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);

        // Extract unique ventures from templates
        const ventureMap = new Map<string, Venture>();
        (data.templates || []).forEach((t: JDTemplate) => {
          if (!ventureMap.has(t.venture.id)) {
            ventureMap.set(t.venture.id, t.venture);
          }
        });
        if (ventureMap.size > 0) {
          setVentures(Array.from(ventureMap.values()));
        }
      } else {
        toast.error("Không thể tải danh sách JD templates");
      }
    } catch {
      toast.error("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  }, [search]);

  // Fetch ventures list separately for the form modal
  useEffect(() => {
    fetch("/api/jd-templates")
      .then((r) => r.json())
      .then((data) => {
        const ventureMap = new Map<string, Venture>();
        (data.templates || []).forEach((t: JDTemplate) => {
          if (!ventureMap.has(t.venture.id)) {
            ventureMap.set(t.venture.id, t.venture);
          }
        });
        setVentures(Array.from(ventureMap.values()));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchTemplates();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchTemplates]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa JD template này?")) return;

    setDeleteLoading(id);
    try {
      const res = await fetch(`/api/jd-templates/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Đã xóa JD template");
        fetchTemplates();
      } else {
        const data = await res.json();
        toast.error(data.error || "Xóa thất bại");
      }
    } catch {
      toast.error("Lỗi kết nối server");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSaved = () => {
    setShowAddModal(false);
    setEditTemplate(null);
    fetchTemplates();
  };

  const getContentPreview = (content: string | null, maxLength: number = 120): string => {
    if (!content) return "";
    const cleaned = content.replace(/##\s*/g, "").replace(/\n/g, " ").replace(/- /g, "").trim();
    return cleaned.length > maxLength ? cleaned.substring(0, maxLength) + "..." : cleaned;
  };

  // Loading skeleton
  if (loading && templates.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-slate-200 rounded-lg animate-pulse mt-2" />
          </div>
          <div className="h-12 w-40 bg-slate-200 rounded-xl animate-pulse" />
        </div>
        <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="h-5 w-32 bg-slate-200 rounded animate-pulse mb-3" />
              <div className="h-4 w-full bg-slate-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">JD Repository</h2>
          <p className="text-slate-500 text-sm mt-1">
            {templates.length} JD template có sẵn
          </p>
        </div>
        {isHR && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl cursor-pointer transition-colors"
          >
            <Plus className="w-5 h-5" />
            Tạo JD Template
          </button>
        )}
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm theo tên vị trí..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Templates grid */}
      {templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-md transition-all group"
            >
              {/* Card header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">
                      {template.positionName}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {template.level && (
                        <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                          {template.level}
                        </span>
                      )}
                      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {template.venture.code}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content preview */}
              <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-3">
                {getContentPreview(template.jdContent)}
              </p>

              {/* Card actions */}
              <div className="flex items-center gap-1.5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setViewTemplate(template)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Xem
                </button>
                {isHR && (
                  <>
                    <button
                      onClick={() => setEditTemplate(template)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      disabled={deleteLoading === template.id}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Xóa
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">
              {search ? "Không tìm thấy JD template" : "Chưa có JD template nào"}
            </h3>
            <p className="text-slate-500 text-sm">
              {search
                ? "Thử thay đổi từ khóa tìm kiếm"
                : "Hãy tạo JD template đầu tiên"}
            </p>
            {isHR && !search && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl cursor-pointer mx-auto transition-colors"
              >
                <Plus className="w-5 h-5" />
                Tạo JD Template
              </button>
            )}
          </div>
        )
      )}

      {/* View modal */}
      {viewTemplate && (
        <ViewModal
          template={viewTemplate}
          onClose={() => setViewTemplate(null)}
        />
      )}

      {/* Add modal */}
      {showAddModal && (
        <FormModal
          template={null}
          ventures={ventures}
          onClose={() => setShowAddModal(false)}
          onSaved={handleSaved}
        />
      )}

      {/* Edit modal */}
      {editTemplate && (
        <FormModal
          template={editTemplate}
          ventures={ventures}
          onClose={() => setEditTemplate(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
