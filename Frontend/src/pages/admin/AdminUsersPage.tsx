import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Plus, Pencil, Filter } from "lucide-react";
import { modals } from "@mantine/modals";
import { Text } from "@mantine/core";
import {
  useAdminUsers,
  useToggleUserStatusMutation,
  useDeleteUserMutation,
} from "../../hooks/queries/useAdminUsers";
import { AdminListHeader } from "../../components/admin/AdminListHeader";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { useDebounce } from "../../hooks/useDebounce";

const ITEMS_PER_PAGE = 10;

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

const roleOptions = [
  { value: "", label: "全部角色" },
  { value: "SystemAdmin", label: "系統管理員" },
  { value: "Nanny", label: "保母" },
  { value: "Parent", label: "家長" },
];

export const AdminUsersPage = () => {
  const navigate = useNavigate();
  const { data: users = [], isLoading: loading, error } = useAdminUsers();
  const toggleActiveMutation = useToggleUserStatusMutation();
  const deleteUserMutation = useDeleteUserMutation();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, roleFilter]);

  const filtered = users.filter((u) => {
    const matchSearch =
      !debouncedSearch ||
      u.displayName?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchRole = !roleFilter || u.roles.includes(roleFilter);
    return matchSearch && matchRole;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const toggleActive = (id: string, current: boolean) => {
    toggleActiveMutation.mutate({ id, isActive: !current });
  };

  const deleteUser = (id: string) => {
    modals.openConfirmModal({
      title: "刪除帳號",
      children: <Text size="sm">確定要刪除此帳號？此操作無法復原。</Text>,
      labels: { confirm: "確定刪除", cancel: "取消" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteUserMutation.mutate(id),
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
      <AdminListHeader
        title="帳號管理"
        subtitle={`共 ${filtered.length} 筆帳號`}
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="搜尋名稱…"
        filterButton={
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none pl-9 pr-4 py-3 rounded-[32px] bg-white border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-200 transition-all shadow-sm text-babo-text-light"
            >
              {roleOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <Filter
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-babo-text-light pointer-events-none"
            />
          </div>
        }
        addButton={
          <button
            onClick={() => navigate("/admin/users/new")}
            className="flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white bg-babo-primary active:scale-95 transition-all shadow-md"
          >
            <Plus size={18} />
            新增
          </button>
        }
      />

      {paged.length === 0 ? (
        <div className="ios-card p-12 text-center">
          <p className="text-babo-text-light">尚無符合的帳號資料</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paged.map((u) => (
            <div
              key={u.id}
              className={`ios-card p-5 flex items-start justify-between gap-4 ${u.isDeleted ? "opacity-50" : ""}`}
            >
              {/* 頭像 */}
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                {(u.displayName || "?").charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <h3 className="text-base font-bold text-babo-text">
                    {u.displayName}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      u.isActive
                        ? "bg-green-50 text-green-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {u.isActive ? "啟用" : "停用"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {u.roles.map((r) => (
                    <span
                      key={r}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-babo-primary/10 text-babo-primary"
                    >
                      {roleLabel[r] ?? r}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {u.loginMethods.map((m) => (
                    <span
                      key={m}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-babo-text-light"
                    >
                      {methodLabel[m] ?? m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <button
                  onClick={() => navigate(`/admin/users/${u.id}/edit`)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors text-babo-primary"
                  title="編輯"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => toggleActive(u.id, u.isActive)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-300 text-babo-text-light hover:bg-gray-100 transition-colors whitespace-nowrap"
                >
                  {u.isActive ? "停用" : "啟用"}
                </button>
                {!u.isDeleted && (
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full border border-red-300 text-red-500 hover:bg-red-50 transition-colors"
                  >
                    刪除
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};
