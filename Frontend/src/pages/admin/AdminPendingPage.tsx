import { KeyRound, Trash2 } from 'lucide-react';
import {
  usePendingUsers,
  useGenerateInviteCodeMutation,
  useRemovePendingUserMutation,
} from '../../hooks/queries/usePendingUsers';

const sourceLabel: Record<string, string> = {
  Google: 'Google',
  Line: 'LINE',
  Account: '一般帳號',
};

export const AdminPendingPage = () => {
  const { data: items = [], isLoading: loading, error } = usePendingUsers();
  const generateCodeMutation = useGenerateInviteCodeMutation();
  const removePendingMutation = useRemovePendingUserMutation();

  const generateCode = (id: string) => {
    generateCodeMutation.mutate(id);
  };

  const dismiss = (id: string) => {
    if (!confirm('確定要移除此待匹配記錄？')) return;
    removePendingMutation.mutate(id);
  };

  if (loading) return <p className="text-gray-500">載入中…</p>;
  if (error) return <p className="text-red-500">載入失敗，請稍後再試</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">待匹配帳號</h1>

      {items.length === 0 ? (
        <p className="text-gray-400 py-8 text-center">目前無待匹配記錄</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4"
            >
              {/* 頭像 */}
              <div className="shrink-0">
                {p.avatarUrl ? (
                  <img
                    src={p.avatarUrl}
                    alt={p.displayName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-500 text-sm font-medium">
                    {p.displayName?.[0] ?? '?'}
                  </div>
                )}
              </div>

              {/* 資訊 */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{p.displayName || '（未填寫）'}</p>
                <p className="text-xs text-gray-500">
                  {p.email || p.phoneNumber || '無聯絡資料'} ·{' '}
                  <span className="rounded bg-gray-100 px-1.5 py-0.5">
                    {sourceLabel[p.source] ?? p.source}
                  </span>
                </p>
                {p.inviteCode && (
                  <p className="mt-1 text-xs text-blue-700">
                    邀請碼：<span className="font-mono font-semibold">{p.inviteCode}</span>
                    {p.isInviteCodeValid ? (
                      <span className="ml-1 text-green-600">✓ 有效</span>
                    ) : (
                      <span className="ml-1 text-red-600">✗ 已過期</span>
                    )}
                  </p>
                )}
              </div>

              {/* 操作 */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => generateCode(p.id)}
                  disabled={generateCodeMutation.isPending}
                  className="flex items-center gap-1 rounded-md border border-blue-300 px-2.5 py-1.5 text-xs text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                  title="產生邀請碼"
                >
                  <KeyRound size={13} />
                  {p.inviteCode ? '重新產生' : '產生邀請碼'}
                </button>
                <button
                  onClick={() => dismiss(p.id)}
                  disabled={removePendingMutation.isPending}
                  className="flex items-center justify-center rounded-md border border-gray-200 p-1.5 text-gray-400 hover:border-red-300 hover:text-red-500 disabled:opacity-50"
                  title="移除"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
