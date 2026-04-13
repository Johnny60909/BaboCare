import { KeyRound, Trash2 } from "lucide-react";
import {
  usePendingUsers,
  useGenerateInviteCodeMutation,
  useRemovePendingUserMutation,
} from "../../hooks/queries/usePendingUsers";

const sourceLabel: Record<string, string> = {
  Google: "Google",
  Line: "LINE",
  Account: "一般帳號",
};

export const AdminPendingPage = () => {
  const { data: items = [], isLoading: loading, error } = usePendingUsers();
  const generateCodeMutation = useGenerateInviteCodeMutation();
  const removePendingMutation = useRemovePendingUserMutation();

  const generateCode = (id: string) => {
    generateCodeMutation.mutate(id);
  };

  const dismiss = (id: string) => {
    if (!confirm("確定要移除此待匹配記錄？")) return;
    removePendingMutation.mutate(id);
  };

  if (loading) return <p className="text-gray-500">載入中…</p>;
  if (error) return <p className="text-red-500">載入失敗，請稍後再試</p>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-babo-text mb-1">待匹配帳號</h1>
        <p className="text-babo-text-light text-sm">
          審核並分配邀請碼給待驗證使用者
        </p>
      </div>

      {items.length === 0 ? (
        <div className="ios-card p-12 text-center">
          <p className="text-babo-text-light text-base">目前無待匹配記錄</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((p) => (
            <div key={p.id} className="ios-card p-5 flex items-start gap-4">
              {/* 頭像 */}
              <div className="shrink-0">
                {p.avatarUrl ? (
                  <img
                    src={p.avatarUrl}
                    alt={p.displayName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-babo-primary/10 text-babo-primary text-base font-bold">
                    {p.displayName?.[0] ?? "?"}
                  </div>
                )}
              </div>

              {/* 資訊 */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-babo-text text-lg mb-1">
                  {p.displayName || "（未填寫）"}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-babo-text-light">
                    {p.email || p.phoneNumber || "無聯絡資料"}
                  </span>
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-babo-text-light">
                    {sourceLabel[p.source] ?? p.source}
                  </span>
                </div>
                {p.inviteCode && (
                  <div className="text-sm">
                    <span className="text-babo-text-light">邀請碼：</span>
                    <span className="font-mono font-bold text-babo-primary px-1.5">
                      {p.inviteCode}
                    </span>
                    {p.isInviteCodeValid ? (
                      <span className="ml-1 text-green-600 font-bold">
                        ✓ 有效
                      </span>
                    ) : (
                      <span className="ml-1 text-orange-600 font-bold">
                        ✗ 已過期
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 操作 */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                <button
                  onClick={() => generateCode(p.id)}
                  disabled={generateCodeMutation.isPending}
                  className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold border-2 border-babo-primary text-babo-primary hover:bg-blue-50 disabled:opacity-60 transition-colors"
                  title="產生邀請碼"
                >
                  <KeyRound size={14} />
                  {p.inviteCode ? "重新產生" : "邀請碼"}
                </button>
                <button
                  onClick={() => dismiss(p.id)}
                  disabled={removePendingMutation.isPending}
                  className="flex items-center justify-center rounded-full p-2.5 border-2 border-gray-300 text-gray-400 hover:border-red-300 hover:text-red-500 hover:bg-red-50 disabled:opacity-60 transition-colors"
                  title="移除"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
