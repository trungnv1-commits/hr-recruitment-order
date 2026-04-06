"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, Building2, AlertCircle } from "lucide-react";

const ROLE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  HIRING_MANAGER: { label: "Hiring Manager", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  CEO_VENTURE: { label: "CEO Venture", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  CEO_GROUP: { label: "CEO Group", color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  HR: { label: "HR Officer", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
};

const TEST_ACCOUNTS = [
  { email: "HM@apero.vn", role: "HIRING_MANAGER" },
  { email: "CEOVen@apero.vn", role: "CEO_VENTURE" },
  { email: "CEOGroup@apero.vn", role: "CEO_GROUP" },
  { email: "HR@apero.vn", role: "HR" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const doLogin = async (loginEmail: string, loginPassword: string) => {
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      router.push('/dashboard');
    } catch {
      setError('Cannot connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await doLogin(email, password);
  };

  const handleQuickLogin = async (accountEmail: string) => {
    setEmail(accountEmail);
    setPassword("test123");
    await doLogin(accountEmail, 'test123');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/5 rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-white/90 font-semibold text-lg">Apero HR</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
            HR Recruitment<br />Order System
          </h1>
          <p className="text-blue-100 text-lg max-w-md leading-relaxed">
            Quản lý quy trình tuyển dụng, kiểm tra định biên tự động,
            và duyệt order nhanh chóng.
          </p>
          <div className="flex gap-6 pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">4</div>
              <div className="text-blue-200 text-sm">Vai trò</div>
            </div>
            <div className="w-px bg-blue-400/30" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">6</div>
              <div className="text-blue-200 text-sm">Trạng thái</div>
            </div>
            <div className="w-px bg-blue-400/30" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">Auto</div>
              <div className="text-blue-200 text-sm">HC Check</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-blue-200/60 text-sm">
          &copy; 2026 Apero &middot; HR Recruitment Order v1.0
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-slate-50">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-semibold text-lg text-slate-800">Apero HR</span>
          </div>

          {/* Header */}
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-slate-900">Đăng nhập</h2>
            <p className="mt-2 text-slate-500">
              Nhập email và mật khẩu để truy cập hệ thống
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@apero.vn"
                required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  required
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Đăng nhập
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-slate-50 text-slate-400">Tài khoản test</span>
            </div>
          </div>

          {/* Quick Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {TEST_ACCOUNTS.map((account) => {
              const roleInfo = ROLE_LABELS[account.role];
              return (
                <button
                  key={account.email}
                  onClick={() => handleQuickLogin(account.email)}
                  className={`p-3 rounded-xl border text-left hover:shadow-md cursor-pointer transition-shadow ${roleInfo.bg}`}
                >
                  <div className={`text-sm font-semibold ${roleInfo.color}`}>
                    {roleInfo.label}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">
                    {account.email}
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-center text-xs text-slate-400">
            Mật khẩu mặc định: <code className="bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-600">test123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
