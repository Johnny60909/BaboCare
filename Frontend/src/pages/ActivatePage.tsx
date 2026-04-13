import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useActivatePendingMutation } from '../hooks/queries/usePendingUsers';
import { CheckCircle2 } from 'lucide-react';

/// <summary>
/// 帳號驗證碼綁定頁 - 依據設計風格實現
/// </summary>
export const ActivatePage = () => {
  const location = useLocation();
  const fromRegister = location.state?.fromRegister === true;
  const pendingUserId: string | undefined = location.state?.pendingUserId;

  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const activateMutation = useActivatePendingMutation();

  const handleCodeChange = (value: string) => {
    setCode(value.toUpperCase());
  };

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
    <div className="min-h-screen bg-babo-bg flex items-center justify-center px-8 py-20">
      <div className="w-full max-w-sm">
        {/* 頂部圖示 */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-blue-400" />
          </div>
          
          {fromRegister ? (
            <>
              <h1 className="text-2xl font-bold text-babo-text mb-2">等待授權中</h1>
              <p className="text-sm text-babo-text-light">
                申請已送出，請聯繫保母索取邀請碼後在下方輸入
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-babo-text mb-2">尚未獲得授權</h1>
              <p className="text-sm text-babo-text-light">
                請向保母索取邀請碼以啟用您的帳號
              </p>
            </>
          )}
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* 表單 */}
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-babo-text mb-3">邀請碼</label>
            <input
              type="text"
              required
              placeholder="輸入邀請碼"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              maxLength={10}
              className="input text-center tracking-widest text-lg uppercase font-bold"
            />
          </div>

          <button
            type="submit"
            disabled={activateMutation.isPending || !code.trim()}
            className="w-full p-5 bg-babo-primary text-white font-bold rounded-[32px] shadow-lg shadow-blue-200 active:scale-95 transition-transform disabled:opacity-50 disabled:shadow-none"
          >
            {activateMutation.isPending ? '驗證中...' : '啟用帳號'}
          </button>
        </form>

        {/* 提示文字 */}
        <p className="mt-6 text-xs text-center text-babo-text-light">
          邀請碼由保母產生，具有時效限制。<br />未收到邀請碼？請直接聯繫保母。
        </p>
      </div>
    </div>
  );
};
