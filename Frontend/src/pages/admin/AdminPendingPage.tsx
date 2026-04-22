import { KeyRound, UserX } from "lucide-react";
import { modals } from "@mantine/modals";
import { Text } from "@mantine/core";
import {
  usePendingUsers,
  useGenerateInviteCodeMutation,
  useRemovePendingUserMutation,
} from "../../hooks/queries/PendingUsers/usePendingUsers";

const sourceLabel: Record<string, string> = {
  Google: "Google",
  Line: "LINE",
  Account: "一般帳號",
};

const sourceBadgeClass: Record<string, string> = {
  Google: "bg-red-50 text-red-500",
  Line: "bg-green-50 text-green-600",
  Account: "bg-gray-100 text-gray-500",
};

export const AdminPendingPage = () => {
  const { data: items = [], isLoading: loading, error } = usePendingUsers();
  const generateCodeMutation = useGenerateInviteCodeMutation();
  const removePendingMutation = useRemovePendingUserMutation();

  const generateCode = (id: string) => {
    generateCodeMutation.mutate(id);
  };

  const dismiss = (id: string) => {
    modals.openConfirmModal({
      title: "退回申請",
      children: <Text size="sm">確定要退回此申請？退回後用戶需重新申請。</Text>,
      labels: { confirm: "確定退回", cancel: "取消" },
      confirmProps: { color: "red" },
      onConfirm: () => removePendingMutation.mutate(id),
    });
  };

  if (loading)
    return <div className="p-6 text-center text-babo-text-light">載入中…</div>;
  if (error)
    return (
      <div className="p-6 text-center text-red-500">載入失敗，請稍後再試</div>
    );

  return (
    <div className="min-h-screen bg-babo-bg pb-24 px-6 pt-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-babo-text mb-1">待匹配帳號</h1>
        <p className="text-babo-text-light text-sm">
          審核並分配邀請碼給待驗證使用者
          {items.length > 0 && (
            <span className="ml-2 text-babo-primary font-bold">
              {items.length} 位待審核
            </span>
          )}
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
                    {(p.displayName || p.email || "?")[0].toUpperCase()}
                  </div>
                )}
              </div>

              {/* 資訊 */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-babo-text text-base mb-1">
                  {p.displayName || "（未填寫）"}
                </h3>
                <p className="text-xs text-babo-text-light mb-2">
                  {p.email || p.phoneNumber || "無聯絡資料"}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sourceBadgeClass[p.source] ?? "bg-gray-100 text-gray-500"}`}
                  >
                    {sourceLabel[p.source] ?? p.source}
                  </span>
                </div>
                {p.inviteCode && (
                  <div className="text-xs">
                    <span className="text-babo-text-light">邀請碼：</span>
                    <span className="font-mono font-bold text-babo-primary px-1">
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
              <div className="flex flex-col items-end gap-2 shrink-0">
                <button
                  onClick={() => generateCode(p.id)}
                  disabled={generateCodeMutation.isPending}
                  className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold bg-babo-primary text-white hover:bg-blue-600 disabled:opacity-60 active:scale-95 transition-all whitespace-nowrap"
                >
                  <KeyRound size={13} />
                  {p.inviteCode ? "重新產生邀請碼" : "批准入系統 / 產生邀請碼"}
                </button>
                <button
                  onClick={() => dismiss(p.id)}
                  disabled={removePendingMutation.isPending}
                  className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 active:scale-95 transition-all"
                >
                  <UserX size={13} />
                  退回申請
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
