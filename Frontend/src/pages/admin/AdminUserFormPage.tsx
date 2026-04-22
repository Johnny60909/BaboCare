import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronLeft } from "lucide-react";
import {
  useAdminUserDetail,
  useCreateUserMutation,
  useUpdateUserMutation,
} from "../../hooks/queries/useAdminUsers";
import type { CreateUserRequest } from "../../api/dtos/user.dto";

interface UserFormState extends CreateUserRequest {
  id?: string;
  confirmPassword?: string;
}

const ALL_ROLES = [
  { value: "SystemAdmin", label: "系統管理員" },
  { value: "Nanny", label: "保母" },
  { value: "Parent", label: "家長" },
];

const empty: UserFormState = {
  userName: "",
  password: "",
  displayName: "",
  gender: "",
  email: "",
  phoneNumber: "",
  roles: ["Parent"],
  isActive: true,
};

export const AdminUserFormPage = () => {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: existingUser, isLoading: loading } = useAdminUserDetail(id);
  const createMutation = useCreateUserMutation();
  const updateMutation = useUpdateUserMutation();

  const [form, setForm] = useState<UserFormState>(empty);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingUser) {
      setForm({
        ...existingUser,
        password: "",
        confirmPassword: "",
        email: existingUser.email ?? "",
      });
    }
  }, [existingUser]);

  const set = <K extends keyof UserFormState>(
    key: K,
    value: UserFormState[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

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
                setError(data.map((e: any) => e.description ?? "").join("、"));
              } else if (data?.message) {
                setError(data.message);
              } else {
                setError("儲存失敗，請確認欄位後重試");
              }
            },
            onSuccess: () => navigate("/admin/users"),
          },
        );
      } else {
        createMutation.mutate(form, {
          onError: (err: any) => {
            const data = err?.response?.data;
            if (Array.isArray(data)) {
              setError(data.map((e: any) => e.description ?? "").join("、"));
            } else if (data?.message) {
              setError(data.message);
            } else {
              setError("儲存失敗，請確認欄位後重試");
            }
          },
          onSuccess: () => navigate("/admin/users"),
        });
      }
    } catch (err) {
      setError("發生未知錯誤");
    }
  };

  if (loading)
    return <div className="p-6 text-center text-babo-text-light">載入中…</div>;

  return (
    <div className="min-h-screen bg-babo-bg pb-24 px-6 pt-6">
      {/* 返回按鈕 */}
      <button
        onClick={() => navigate("/admin/users")}
        className="flex items-center gap-1 text-babo-primary text-sm font-medium mb-6 active:scale-95 transition-all"
      >
        <ChevronLeft size={18} />
        返回帳號管理
      </button>

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-babo-text mb-1">
          {isEdit ? "編輯帳號" : "新增帳號"}
        </h1>
        <p className="text-babo-text-light text-sm mb-6">
          填寫用戶基本資訊和權限設定
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-[20px] text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="flex flex-col gap-6">
          {/* 帳號密碼 */}
          <fieldset className="ios-card p-6 flex flex-col gap-4 overflow-hidden">
            <legend className="px-0 text-lg font-bold text-babo-text">
              登入資訊
            </legend>
            <Field label="帳號 (userName)" required>
              <input
                type="text"
                value={form.userName}
                onChange={(e) => set("userName", e.target.value)}
                disabled={isEdit}
                className="input"
              />
            </Field>
            <Field
              label={isEdit ? "新密碼（留空不更改）" : "密碼"}
              required={!isEdit}
            >
              <input
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                className="input"
              />
            </Field>
          </fieldset>

          {/* 基本資料 */}
          <fieldset className="ios-card p-6 flex flex-col gap-4 overflow-hidden">
            <legend className="px-0 text-lg font-bold text-babo-text">
              基本資料
            </legend>
            <Field label="姓名" required>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => set("displayName", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="性別">
              <select
                value={form.gender}
                onChange={(e) => set("gender", e.target.value)}
                className="input"
              >
                <option value="">請選擇</option>
                <option value="Male">男</option>
                <option value="Female">女</option>
              </select>
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="手機">
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => set("phoneNumber", e.target.value)}
                className="input"
              />
            </Field>
          </fieldset>

          {/* 角色 */}
          <fieldset className="ios-card p-6 flex flex-col gap-3 overflow-hidden">
            <legend className="px-0 text-lg font-bold text-babo-text">
              角色
            </legend>
            {ALL_ROLES.map(({ value, label }) => (
              <label
                key={value}
                className="flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <input
                  type="checkbox"
                  checked={form.roles?.includes(value) ?? false}
                  onChange={() => toggleRole(value)}
                  className="w-5 h-5 cursor-pointer"
                />
                <span className="text-babo-text font-medium">{label}</span>
              </label>
            ))}
          </fieldset>

          {/* 啟用 */}
          <label className="flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="w-5 h-5 cursor-pointer"
            />
            <span className="text-babo-text font-medium">啟用帳號</span>
          </label>

          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 rounded-[32px] py-3.5 text-base font-bold text-white bg-babo-primary active:scale-95 transition-all shadow-md disabled:opacity-60"
            >
              {createMutation.isPending || updateMutation.isPending
                ? "儲存中…"
                : "儲存"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className="flex-1 py-3.5 rounded-[32px] border-2 border-gray-300 text-babo-text text-base font-bold hover:bg-gray-50 transition-colors active:scale-95"
            >
              取消
            </button>
          </div>
        </form>
      </div>
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
