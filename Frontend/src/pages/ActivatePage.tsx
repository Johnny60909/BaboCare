import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useActivatePendingMutation } from '../hooks/queries/usePendingUsers';

export const ActivatePage = () => {
  const location = useLocation();
  const fromRegister = location.state?.fromRegister === true;
  const pendingUserId: string | undefined = location.state?.pendingUserId;

  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const activateMutation = useActivatePendingMutation();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    activateMutation.mutate(
      { pendingUserId, inviteCode: code.trim() },
      {
        onSuccess: (res) => {
          navigate(`/login?activated=1&username=${encodeURIComponent(res.userName)}`, { replace: true });
        },
        onError: (err: any) => {
          const data = err?.response?.data;
          setError(data?.message ?? data?.title ?? '邀請碼無效或已過期，請向保母確認');
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm text-center">
        {fromRegister ? (
          <>
            <h1 className="text-xl font-bold text-gray-900 mb-1">等待授權中</h1>
            <p className="text-sm text-gray-500 mb-6">
              申請已送出，請聯繫保母索取邀請碼後在下方輸入
            </p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-gray-900 mb-1">尚未獲得授權</h1>
            <p className="text-sm text-gray-500 mb-6">
              請向保母索取邀請碼以啟用您的帳號
            </p>
          </>
        )}

        {error && (
          <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={submit} className="flex flex-col gap-4">
          <input
            type="text"
            required
            placeholder="輸入邀請碼"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="input text-center tracking-widest text-lg uppercase"
          />
          <button
            type="submit"
            disabled={activateMutation.isPending || !code.trim()}
            className="rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {activateMutation.isPending ? '驗證中…' : '啟用帳號'}
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-400">
          邀請碼由保母產生，具有時效限制
        </p>
      </div>
    </div>
  );
};
