import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAdminUserDetail, useCreateUserMutation, useUpdateUserMutation } from '../../hooks/queries/useAdminUsers';
import type { CreateUserRequest } from '../../api/dtos/user.dto';

interface UserFormState extends CreateUserRequest {
  id?: string;
  confirmPassword?: string;
}

const ALL_ROLES = [
  { value: 'SystemAdmin', label: '系統管理員' },
  { value: 'Nanny', label: '保母' },
  { value: 'Parent', label: '家長' },
];

const empty: UserFormState = {
  userName: '',
  password: '',
  displayName: '',
  gender: '',
  email: '',
  phoneNumber: '',
  roles: ['Parent'],
  isActive: true,
};

export const AdminUserFormPage = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: existingUser, isLoading: loading } = useAdminUserDetail(id);
  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();
  
  const [form, setForm] = useState<UserFormState>(
    existingUser
      ? { ...existingUser, password: '', confirmPassword: '', email: existingUser.email ?? '' }
      : empty
  );
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof UserFormState>(key: K, value: UserFormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleRole = (role: string) =>
    setForm((prev) => ({
      ...prev,
      roles: prev.roles?.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...(prev.roles || []), role],
    }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isEdit && id) {
        updateMutation.mutate(
          { id, data: { ...form, password: undefined } as any },
          {
            onError: (err: any) => {
              const data = err?.response?.data;
              if (Array.isArray(data)) {
                setError(data.map((e: any) => e.description ?? '').join('、'));
              } else if (data?.message) {
                setError(data.message);
              } else {
                setError('儲存失敗，請確認欄位後重試');
              }
            },
            onSuccess: () => navigate('/admin/users'),
          }
        );
      } else {
        createMutation.mutate(form, {
          onError: (err: any) => {
            const data = err?.response?.data;
            if (Array.isArray(data)) {
              setError(data.map((e: any) => e.description ?? '').join('、'));
            } else if (data?.message) {
              setError(data.message);
            } else {
              setError('儲存失敗，請確認欄位後重試');
            }
          },
          onSuccess: () => navigate('/admin/users'),
        });
      }
    } catch (err) {
      setError('發生未知錯誤');
    }
  };

  if (loading) return <p className="text-gray-500">載入中…</p>;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{isEdit ? '編輯帳號' : '新增帳號'}</h1>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <form onSubmit={submit} className="flex flex-col gap-4">
        {/* 帳號密碼 */}
        <fieldset className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
          <legend className="px-1 text-sm font-medium text-gray-600">登入資訊</legend>
          <Field label="帳號 (userName)" required>
            <input
              type="text"
              value={form.userName}
              onChange={(e) => set('userName', e.target.value)}
              disabled={isEdit}
              className="input"
            />
          </Field>
          <Field label={isEdit ? '新密碼（留空不更改）' : '密碼'} required={!isEdit}>
            <input
              type="password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              className="input"
            />
          </Field>
        </fieldset>

        {/* 基本資料 */}
        <fieldset className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
          <legend className="px-1 text-sm font-medium text-gray-600">基本資料</legend>
          <Field label="姓名" required>
            <input
              type="text"
              value={form.displayName}
              onChange={(e) => set('displayName', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="性別">
            <select value={form.gender} onChange={(e) => set('gender', e.target.value)} className="input">
              <option value="">請選擇</option>
              <option value="Male">男</option>
              <option value="Female">女</option>
            </select>
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className="input"
            />
          </Field>
          <Field label="手機">
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => set('phoneNumber', e.target.value)}
              className="input"
            />
          </Field>
        </fieldset>

        {/* 角色 */}
        <fieldset className="flex flex-col gap-2 rounded-lg border border-gray-200 p-4">
          <legend className="px-1 text-sm font-medium text-gray-600">角色</legend>
          {ALL_ROLES.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.roles?.includes(value) ?? false}
                onChange={() => toggleRole(value)}
              />
              {label}
            </label>
          ))}
        </fieldset>

        {/* 啟用 */}
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => set('isActive', e.target.checked)}
          />
          啟用帳號
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="mt-6 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {createMutation.isPending || updateMutation.isPending ? '儲存中…' : '儲存'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
};

const Field = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm text-gray-700">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);
