import { Navigate, Link, useSearchParams } from "react-router";
import { useState } from "react";
import { useLogin } from "../hooks/useLogin";
import { getToken } from "../lib/auth";
import { useNavigate } from "react-router";
import { Baby } from "lucide-react";

/// <summary>
/// 登入頁面組件 - 依據設計風格實現 iOS 風格登入頁
/// </summary>
export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activated = searchParams.get("activated") === "1";
  const prefillUsername = searchParams.get("username") ?? "";
  const [username, setUsername] = useState(prefillUsername);
  const [password, setPassword] = useState("");
  const { mutate: login, isPending, error } = useLogin();

  if (getToken()) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(
      { username, password },
      { onSuccess: () => navigate("/", { replace: true }) },
    );
  };

  return (
    <div className="min-h-screen bg-babo-bg flex items-center justify-center px-8 py-20">
      <div className="w-full max-w-sm">
        {/* Logo 和標題 */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-blue-100 rounded-[32px] mx-auto flex items-center justify-center mb-6 shadow-ios">
            <Baby className="w-12 h-12 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-babo-text mb-2">BaboCare</h1>
          <p className="text-gray-400 text-sm">溫馨育兒，從這裡開始</p>
        </div>

        {/* 一般登入表單 */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          {activated && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-2xl">
              <p className="text-sm text-green-700 font-medium">
                🎉 帳號已成功啟用！請使用帳號密碼登入。
              </p>
            </div>
          )}

          <input
            type="text"
            placeholder="帳號或電子郵件"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="input"
          />

          <input
            type="password"
            placeholder="密碼"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
          />

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-sm text-red-700 font-medium">
                帳號或密碼錯誤，請重試。
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full p-5 bg-gray-800 text-white font-bold rounded-[32px] shadow-lg shadow-black/20 active:scale-95 transition-transform disabled:opacity-50"
          >
            {isPending ? "登入中..." : "登入"}
          </button>
        </form>

        {/* 三方登入 */}
        <div className="space-y-3 mb-10">
          <button className="w-full p-4 bg-[#06C755] text-white font-medium rounded-[32px] flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.99 4c1.105 0 2 .895 2 2v12c0 1.105-.895 2-2 2H4.01c-1.105 0-2-.895-2-2V6c0-1.105.895-2 2-2h15.98z" />
            </svg>
            LINE 快速登入
          </button>
          <button className="w-full p-4 bg-white border border-gray-200 text-gray-700 font-medium rounded-[32px] flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-gray-50">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google 帳號登入
          </button>
        </div>

        {/* 連結區 */}
        <div className="text-center mt-8 space-y-3">
          <p className="text-sm text-gray-500">
            還沒有帳號？{" "}
            <Link
              to="/register"
              className="text-blue-500 font-medium hover:text-blue-600"
            >
              初次登入（自行申請）
            </Link>
          </p>
          <p className="text-sm text-gray-500">
            已申請但尚未驗證？{" "}
            <Link
              to="/activate"
              className="text-blue-500 font-medium hover:text-blue-600"
            >
              輸入驗證碼
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
