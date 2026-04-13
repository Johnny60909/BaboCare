import { useNavigate } from "react-router";
import { Plus, Pencil } from "lucide-react";
import {
  useAdminUsers,
  useToggleUserStatusMutation,
  useDeleteUserMutation,
} from "../../hooks/queries/useAdminUsers";

const roleLabel: Record<string, string> = {
  SystemAdmin: "系統管理員",
  Nanny: "保母",
  Parent: "家長",
};

const methodLabel: Record<string, string> = {
  Google: "Google",
  Line: "LINE",
  Email: "Email",
  Phone: "手機",
  Account: "帳號",
};

export const AdminUsersPage = () => {
  const navigate = useNavigate();
  const { data: users = [], isLoading: loading, error } = useAdminUsers();
  const toggleActiveMutation = useToggleUserStatusMutation();
  const deleteUserMutation = useDeleteUserMutation();

  const toggleActive = (id: string, current: boolean) => {
    toggleActiveMutation.mutate({ id, isActive: !current });
  };

  const deleteUser = (id: string) => {
    if (!confirm("確定要刪除此帳號？")) return;
    deleteUserMutation.mutate(id);
  };

  if (loading) return <p className="text-gray-500">載入中…</p>;
  if (error) return <p className="text-red-500">載入失敗，請稍後再試</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-babo-text mb-1">帳號管理</h1>
          <p className="text-babo-text-light text-sm">
            管理平臺中所有使用者帳號
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/users/new")}
          className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white transition-all active:scale-95 shadow-lg"
          style={{
            backgroundColor: "#3B82F6",
          }}
        >
          <Plus size={20} />
          新增帳號
        </button>
      </div>

      {users.length === 0 ? (
        <div className="ios-card p-12 text-center">
          <p className="text-babo-text-light text-base">尚無帳號資料</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className={`ios-card p-5 flex items-start justify-between gap-4 ${u.isDeleted ? "opacity-50" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-babo-text">
                    {u.displayName}
                  </h3>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                      u.isActive
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {u.isActive ? "啟用" : "停用"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {u.roles.map((r) => (
                    <span
                      key={r}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-babo-primary/10 text-babo-primary"
                    >
                      {roleLabel[r] ?? r}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {u.loginMethods.map((m) => (
                    <span
                      key={m}
                      className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-babo-text-light"
                    >
                      {methodLabel[m] ?? m}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => navigate(`/admin/users/${u.id}/edit`)}
                  className="p-2.5 rounded-full hover:bg-gray-100 transition-colors text-babo-primary hover:text-blue-600"
                  title="編輯"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => toggleActive(u.id, u.isActive)}
                  className="text-xs font-bold px-3 py-2 rounded-full border border-gray-300 text-babo-text-light hover:bg-gray-100 transition-colors"
                  title={u.isActive ? "停用" : "啟用"}
                >
                  {u.isActive ? "停用" : "啟用"}
                </button>
                {!u.isDeleted && (
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="text-xs font-bold px-3 py-2 rounded-full border border-red-300 text-red-500 hover:bg-red-50 transition-colors"
                    title="刪除"
                  >
                    刪除
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
