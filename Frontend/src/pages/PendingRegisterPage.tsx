import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useRegisterPendingMutation } from '../hooks/queries/usePendingUsers';

interface FormState {
  displayName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

const empty: FormState = {
  displayName: '',
  userName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
};

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
      setError('密碼與確認密碼不一致');
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
          navigate('/activate', {
            state: {
              fromRegister: true,
              pendingUserId: res.pendingUserId,
            },
          });
        },
        onError: () => {
          setError('送出失敗，請稍後再試');
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">申請加入</h1>
        <p className="text-sm text-gray-500 mb-6">填寫基本資料後等待保母授權</p>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">姓名 <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={form.displayName}
              onChange={(e) => set('displayName', e.target.value)}
              className="input"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">帳號 Account</label>
            <input
              type="text"
              value={form.userName}
              onChange={(e) => set('userName', e.target.value)}
              placeholder="可選填，未填寫則以 Email 作為帳號"
              className="input"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className="input"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">手機</label>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => set('phoneNumber', e.target.value)}
              className="input"
            />
          </div>
          <hr className="border-gray-100" />
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">密碼 <span className="text-red-500">*</span></label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              className="input"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700">確認密碼 <span className="text-red-500">*</span></label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => set('confirmPassword', e.target.value)}
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="mt-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {registerMutation.isPending ? '送出中…' : '申請加入'}
          </button>

          <p className="text-center text-sm text-gray-500">
            已有帳號？{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              登入
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};
