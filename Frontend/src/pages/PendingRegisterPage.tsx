import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useRegisterPendingMutation } from "../hooks/queries/PendingUsers/usePendingUsers";
import { Baby } from "lucide-react";

interface FormState {
  displayName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

const empty: FormState = {
  displayName: "",
  userName: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
};

/// <summary>
/// 申請加入頁面 - 依據設計風格實現
/// </summary>
export const PendingRegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(empty);
  const [error, setError] = useState<string | null>(null);
  const registerMutation = useRegisterPendingMutation();

  const set = <K extends keyof FormState>(key: K, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("密碼與確認密碼不一致");
      return;
    }
    setError(null);
    registerMutation.mutate(
      {
        displayName: form.displayName,
        userName: form.userName || undefined,
        email: form.email || undefined,
        phoneNumber: form.phoneNumber || undefined,
        password: form.password,
      },
      {
        onSuccess: (res) => {
          navigate("/activate", {
            state: {
              fromRegister: true,
              pendingUserId: res.pendingUserId,
            },
          });
        },
        onError: () => {
          setError("送出失敗，請稍後再試");
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-babo-bg flex items-center justify-center px-8 py-12">
      <div className="w-full max-w-sm pb-20">
        {/* 標題 */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-[32px] mx-auto flex items-center justify-center mb-6">
            <Baby className="w-10 h-10 text-babo-primary" />
          </div>
          <h1 className="text-2xl font-bold text-babo-text mb-2">
            申請加入 BaboCare
          </h1>
          <p className="text-sm text-babo-text-light">
            填寫基本資料後等待保母授權
          </p>
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* 表單 */}
        <form onSubmit={submit} className="space-y-4">
          {/* 基本資訊 */}
          <div>
            <label className="block text-sm font-bold text-babo-text mb-2">
              姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.displayName}
              onChange={(e) => set("displayName", e.target.value)}
              placeholder="請輸入您的姓名"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-babo-text mb-2">
              帳號
            </label>
            <input
              type="text"
              value={form.userName}
              onChange={(e) => set("userName", e.target.value)}
              placeholder="可選填，未填寫則以 Email 作為帳號"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-babo-text mb-2">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="請輸入 Email"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-babo-text mb-2">
              手機
            </label>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => set("phoneNumber", e.target.value)}
              placeholder="可選填"
              className="input"
            />
          </div>

          <div className="h-px bg-gray-200 my-4"></div>

          {/* 密碼設定 */}
          <div>
            <label className="block text-sm font-bold text-babo-text mb-2">
              密碼 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="請設定密碼"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-babo-text mb-2">
              確認密碼 <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => set("confirmPassword", e.target.value)}
              placeholder="請再次輸入密碼"
              className="input"
            />
          </div>

          {/* 提交按鈕 */}
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full py-5 bg-blue-400 text-white font-bold rounded-[32px] shadow-lg active:scale-95 transition-transform mt-8"
          >
            申請加入
          </button>
        </form>

        {/* 登入連結 */}
        <div className="text-center mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-babo-text-light">
            已有帳號？{" "}
            <Link
              to="/login"
              className="text-babo-primary font-medium hover:text-blue-600"
            >
              直接登入
            </Link>
          </p>
        </div>

        {/* 提示 */}
        <div className="mt-6 p-5 bg-blue-50 rounded-2xl border border-blue-100">
          <p className="text-xs text-blue-600 text-center leading-relaxed">
            申請後需要由保母確認並提供邀請碼才能啟用帳號
          </p>
        </div>
      </div>
    </div>
  );
};
