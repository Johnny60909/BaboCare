import { useNavigate } from 'react-router';
import { Plus, Pencil } from 'lucide-react';
import { useAdminUsers, useToggleUserStatusMutation, useDeleteUserMutation } from '../../hooks/queries/useAdminUsers';

const roleLabel: Record<string, string> = {
  SystemAdmin: '系統管理員',
  Nanny: '保母',
  Parent: '家長',
};

const methodLabel: Record<string, string> = {
  Google: 'Google',
  Line: 'LINE',
  Email: 'Email',
  Phone: '手機',
  Account: '帳號',
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
    if (!confirm('確定要刪除此帳號？')) return;
    deleteUserMutation.mutate(id);
  };

  if (loading) return <p className="text-gray-500">載入中…</p>;
  if (error) return <p className="text-red-500">載入失敗，請稍後再試</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">帳號管理</h1>
        <button
          onClick={() => navigate('/admin/users/new')}
          className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          <Plus size={16} />
          新增帳號
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left font-medium">姓名</th>
              <th className="px-4 py-3 text-left font-medium">角色</th>
              <th className="px-4 py-3 text-left font-medium">登入方式</th>
              <th className="px-4 py-3 text-left font-medium">狀態</th>
              <th className="px-4 py-3 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className={`${u.isDeleted ? 'opacity-40' : ''}`}>
                <td className="px-4 py-3">{u.displayName}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {u.roles.map((r) => (
                      <span key={r} className="rounded bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
                        {roleLabel[r] ?? r}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {u.loginMethods.map((m) => (
                      <span key={m} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                        {methodLabel[m] ?? m}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {u.isActive ? '啟用' : '停用'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/admin/users/${u.id}/edit`)}
                      className="text-gray-400 hover:text-gray-700"
                      title="編輯"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => toggleActive(u.id, u.isActive)}
                      className={`text-xs ${u.isActive ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}`}
                    >
                      {u.isActive ? '停用' : '啟用'}
                    </button>
                    {!u.isDeleted && (
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        刪除
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  尚無帳號資料
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
