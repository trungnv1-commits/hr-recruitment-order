"use client";

import { useEffect, useState, useCallback } from "react";
import { BarChart3, Plus, Edit3, Trash2, Building2, Users, TrendingUp, X, Save } from "lucide-react";
import toast from "react-hot-toast";

interface Venture {
  id: string;
  name: string;
  code: string;
}

interface VentureSummary {
  ventureName: string;
  ventureCode: string;
  ventureId: string;
  departments: Record<string, { planned: number; used: number; positions: number }>;
  totalPlanned: number;
  totalUsed: number;
}

interface HCPlan {
  id: string;
  ventureId: string;
  year: number;
  department: string;
  positionName: string;
  plannedHc: number;
  usedHc: number;
  venture: Venture;
}

interface SummaryData {
  year: number;
  ventures: VentureSummary[];
  allVentures: Venture[];
  totalPlanned: number;
  totalUsed: number;
  totalPositions: number;
}

function getProgressColor(percentage: number): string {
  if (percentage >= 100) return "bg-red-500";
  if (percentage >= 75) return "bg-amber-500";
  return "bg-emerald-500";
}

function getProgressTextColor(percentage: number): string {
  if (percentage >= 100) return "text-red-600";
  if (percentage >= 75) return "text-amber-600";
  return "text-emerald-600";
}

function AddPlanModal({
  ventures,
  onClose,
  onSaved,
}: {
  ventures: Venture[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [ventureId, setVentureId] = useState("");
  const [department, setDepartment] = useState("");
  const [positionName, setPositionName] = useState("");
  const [plannedHc, setPlannedHc] = useState<number>(1);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ventureId || !department.trim() || !positionName.trim() || plannedHc < 1) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/headcount-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ventureId,
          year: 2026,
          department: department.trim(),
          positionName: positionName.trim(),
          plannedHc,
        }),
      });

      if (res.ok) {
        toast.success("Thêm kế hoạch HC thành công!");
        onSaved();
      } else {
        const data = await res.json();
        toast.error(data.error || "Thêm kế hoạch thất bại");
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
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Thêm kế hoạch HC</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Venture</label>
            <select
              value={ventureId}
              onChange={(e) => setVentureId(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 cursor-pointer"
            >
              <option value="">Chọn venture...</option>
              {ventures.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phòng ban</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="VD: Engineering, Marketing..."
              className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Vị trí</label>
            <input
              type="text"
              value={positionName}
              onChange={(e) => setPositionName(e.target.value)}
              placeholder="VD: Senior Developer, Product Manager..."
              className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Planned HC</label>
            <input
              type="number"
              min={1}
              value={plannedHc}
              onChange={(e) => setPlannedHc(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditPlanModal({
  plan,
  onClose,
  onSaved,
}: {
  plan: HCPlan;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [department, setDepartment] = useState(plan.department);
  const [positionName, setPositionName] = useState(plan.positionName);
  const [plannedHc, setPlannedHc] = useState<number>(plan.plannedHc);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!department.trim() || !positionName.trim() || plannedHc < 1) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/headcount-plans/${plan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          department: department.trim(),
          positionName: positionName.trim(),
          plannedHc,
        }),
      });

      if (res.ok) {
        toast.success("Cập nhật kế hoạch HC thành công!");
        onSaved();
      } else {
        const data = await res.json();
        toast.error(data.error || "Cập nhật thất bại");
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
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl w-full max-w-lg mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Chỉnh sửa kế hoạch HC</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Venture</label>
            <input
              type="text"
              value={`${plan.venture.name} (${plan.venture.code})`}
              disabled
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phòng ban</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="VD: Engineering, Marketing..."
              className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Vị trí</label>
            <input
              type="text"
              value={positionName}
              onChange={(e) => setPositionName(e.target.value)}
              placeholder="VD: Senior Developer, Product Manager..."
              className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Planned HC</label>
            <input
              type="number"
              min={1}
              value={plannedHc}
              onChange={(e) => setPlannedHc(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? "Đang lưu..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function HeadcountPlansPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [plans, setPlans] = useState<HCPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenture, setSelectedVenture] = useState<string>("");
  const [selectedVentureName, setSelectedVentureName] = useState<string>("");
  const [view, setView] = useState<"summary" | "detail">("summary");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<HCPlan | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/headcount-plans?summary=true&year=2026");
      if (res.ok) {
        const data: SummaryData = await res.json();
        setSummary(data);
      } else {
        toast.error("Không thể tải dữ liệu HC Plans");
      }
    } catch {
      toast.error("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlans = useCallback(async (ventureId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/headcount-plans?year=2026&ventureId=${ventureId}`);
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
      } else {
        toast.error("Không thể tải danh sách kế hoạch");
      }
    } catch {
      toast.error("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleVentureClick = (ventureId: string, ventureName: string) => {
    setSelectedVenture(ventureId);
    setSelectedVentureName(ventureName);
    setView("detail");
    fetchPlans(ventureId);
  };

  const handleBackToSummary = () => {
    setView("summary");
    setSelectedVenture("");
    setSelectedVentureName("");
    setPlans([]);
    fetchSummary();
  };

  const handleDelete = async (planId: string) => {
    if (!confirm("Bạn có chắc muốn xóa kế hoạch này?")) return;

    setDeleteLoading(planId);
    try {
      const res = await fetch(`/api/headcount-plans/${planId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Đã xóa kế hoạch HC");
        if (selectedVenture) {
          fetchPlans(selectedVenture);
        }
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

  const handlePlanSaved = () => {
    setShowAddModal(false);
    setEditingPlan(null);
    if (view === "detail" && selectedVenture) {
      fetchPlans(selectedVenture);
    } else {
      fetchSummary();
    }
  };

  if (loading && !summary && view === "summary") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mt-2" />
          </div>
          <div className="h-12 w-40 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-3" />
              <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-3" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
              <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (view === "summary") {
    const totalPlanned = summary?.totalPlanned || 0;
    const totalUsed = summary?.totalUsed || 0;
    const totalAvailable = totalPlanned - totalUsed;
    const usedPercent = totalPlanned > 0 ? Math.round((totalUsed / totalPlanned) * 100) : 0;

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">HC Plans</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Kế hoạch Headcount năm {summary?.year || 2026}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl cursor-pointer transition-colors"
          >
            <Plus className="w-5 h-5" />
            Thêm kế hoạch
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Planned HC</span>
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalPlanned}</div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Used HC</span>
              <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">{totalUsed}</span>
              <span className={`text-sm font-medium ${getProgressTextColor(usedPercent)}`}>
                ({usedPercent}%)
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Available HC</span>
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalAvailable}</div>
          </div>
        </div>

        {summary && summary.ventures.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.ventures.map((venture) => {
              const venturePercent = venture.totalPlanned > 0
                ? Math.round((venture.totalUsed / venture.totalPlanned) * 100)
                : 0;
              const departments = Object.entries(venture.departments);

              return (
                <div
                  key={venture.ventureId}
                  onClick={() => handleVentureClick(venture.ventureId, venture.ventureName)}
                  className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{venture.ventureName}</h3>
                        <span className="inline-block text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full font-medium mt-0.5">
                          {venture.ventureCode}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-slate-500 dark:text-slate-400">
                        {venture.totalUsed} / {venture.totalPlanned} HC
                      </span>
                      <span className={`font-semibold ${getProgressTextColor(venturePercent)}`}>
                        {venturePercent}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getProgressColor(venturePercent)}`}
                        style={{ width: `${Math.min(venturePercent, 100)}%` }}
                      />
                    </div>
                  </div>

                  {departments.length > 0 && (
                    <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-700">
                      {departments.map(([deptName, deptData]) => {
                        const deptPercent = deptData.planned > 0
                          ? Math.round((deptData.used / deptData.planned) * 100)
                          : 0;

                        return (
                          <div key={deptName}>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-600 dark:text-slate-400 truncate mr-2">{deptName}</span>
                              <span className="text-slate-400 dark:text-slate-500 whitespace-nowrap">
                                {deptData.used}/{deptData.planned}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${getProgressColor(deptPercent)}`}
                                style={{ width: `${Math.min(deptPercent, 100)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          !loading && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
              <BarChart3 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Chưa có kế hoạch HC nào</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Hãy thêm kế hoạch headcount đầu tiên</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl cursor-pointer mx-auto transition-colors"
              >
                <Plus className="w-5 h-5" />
                Thêm kế hoạch
              </button>
            </div>
          )
        )}

        {showAddModal && summary && (
          <AddPlanModal
            ventures={summary.allVentures}
            onClose={() => setShowAddModal(false)}
            onSaved={handlePlanSaved}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={handleBackToSummary}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium mb-2 cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại tổng quan
          </button>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedVentureName}</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Chi tiết kế hoạch HC &middot; {plans.length} vị trí
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl cursor-pointer transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm kế hoạch
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-5 w-28 bg-slate-200 rounded animate-pulse" />
                  <div className="h-5 w-36 bg-slate-200 rounded animate-pulse" />
                  <div className="h-5 w-12 bg-slate-200 rounded animate-pulse" />
                  <div className="h-5 w-12 bg-slate-200 rounded animate-pulse" />
                  <div className="h-5 w-12 bg-slate-200 rounded animate-pulse" />
                  <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
                  <div className="h-5 w-20 bg-slate-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : plans.length === 0 ? (
          <div className="p-12 text-center">
            <BarChart3 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Chưa có kế hoạch nào</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Venture này chưa có kế hoạch HC</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl cursor-pointer mx-auto transition-colors"
            >
              <Plus className="w-5 h-5" />
              Thêm kế hoạch
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Phòng ban
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Vị trí
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Planned
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Used
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Available
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase min-w-[160px]">
                    Usage
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {plans.map((plan) => {
                  const available = plan.plannedHc - plan.usedHc;
                  const usagePercent = plan.plannedHc > 0
                    ? Math.round((plan.usedHc / plan.plannedHc) * 100)
                    : 0;

                  return (
                    <tr key={plan.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                        {plan.department}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                        {plan.positionName}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900 dark:text-white text-center font-semibold">
                        {plan.plannedHc}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 text-center">
                        {plan.usedHc}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block text-sm font-semibold ${
                            available <= 0 ? "text-red-600" : "text-emerald-600"
                          }`}
                        >
                          {available}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${getProgressColor(usagePercent)}`}
                              style={{ width: `${Math.min(usagePercent, 100)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium whitespace-nowrap ${getProgressTextColor(usagePercent)}`}>
                            {usagePercent}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingPlan(plan)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg cursor-pointer transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(plan.id)}
                            disabled={deleteLoading === plan.id}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && summary && (
        <AddPlanModal
          ventures={summary.allVentures}
          onClose={() => setShowAddModal(false)}
          onSaved={handlePlanSaved}
        />
      )}

      {editingPlan && (
        <EditPlanModal
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSaved={handlePlanSaved}
        />
      )}
    </div>
  );
}
