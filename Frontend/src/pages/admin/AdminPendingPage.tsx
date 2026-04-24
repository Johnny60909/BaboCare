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
    return <div className="p-6 text-center text-gray-400">載入中…</div>;
  if (error)
    return (
      <div className="p-6 text-center text-red-500">載入失敗，請稍後再試</div>
    );

  return (
    <div className="min-h-screen bg-white px-6 pt-12 pb-28 text-left">
      <header className="mb-6">
        <h2 className="text-2xl font-bold">待審核帳號</h2>
        {items.length > 0 && (
          <p className="text-sm text-gray-400 mt-1">
            目前有{" "}
            <span className="text-blue-600 font-bold">{items.length}</span>{" "}
            位待審核
          </p>
        )}
      </header>

      {items.length === 0 ? (
        <div className="ios-card p-12 text-center">
          <p className="text-gray-400">目前無待匹配記錄</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((p) => (
            <div key={p.id} className="ios-card p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="shrink-0">
                  {p.avatarUrl ? (
                    <img
                      src={p.avatarUrl}
                      alt={p.displayName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-base font-bold">
                      {(p.displayName || p.email || "?")[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-base">
                    {p.displayName || "（未填寫）"}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {p.email || p.phoneNumber || "無聯絡資料"}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sourceBadgeClass[p.source] ?? "bg-gray-100 text-gray-500"}`}
                    >
                      {sourceLabel[p.source] ?? p.source}
                    </span>
                  </div>
                </div>
              </div>

              {p.inviteCode && (
                <div className="mb-4 px-3 py-2 bg-gray-50 rounded-xl text-xs">
                  <span className="text-gray-400">邀請碼：</span>
                  <span className="font-mono font-bold text-blue-600 px-1">
                    {p.inviteCode}
                  </span>
                  {p.isInviteCodeValid ? (
                    <span className="ml-1 text-green-600 font-bold">
                      ✓ 有效
                    </span>
                  ) : (
                    <span className="ml-1 text-orange-500 font-bold">
                      ✗ 已過期
                    </span>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => dismiss(p.id)}
                  disabled={removePendingMutation.isPending}
                  className="flex-1 py-3 text-xs font-bold text-red-500 bg-red-50 rounded-2xl flex items-center justify-center gap-1.5 disabled:opacity-60 active:scale-95 transition-all"
                >
                  <UserX size={13} />
                  退回
                </button>
                <button
                  onClick={() => generateCode(p.id)}
                  disabled={generateCodeMutation.isPending}
                  className="flex-1 py-3 text-xs font-bold text-white bg-blue-600 rounded-2xl flex items-center justify-center gap-1.5 disabled:opacity-60 active:scale-95 transition-all"
                >
                  <KeyRound size={13} />
                  {p.inviteCode ? "重新批准" : "批准"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
