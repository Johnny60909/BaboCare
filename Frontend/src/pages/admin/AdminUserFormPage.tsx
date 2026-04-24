import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { X } from "lucide-react";
import {
  useAdminUserDetail,
  useCreateUserMutation,
  useUpdateUserMutation,
} from "../../hooks/queries/useAdminUsers";
import type { CreateUserRequest } from "../../api/dtos/Users/user.dto";

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
  const formRef = useRef<HTMLFormElement>(null);
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
    return <div className="p-6 text-center text-gray-400">載入中…</div>;

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-left">
      {/* 置頂導覽列 */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10 border-b border-gray-100">
        <button
          type="button"
          onClick={() => navigate("/admin/users")}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={18} className="text-gray-400" />
        </button>
        <h3 className="font-bold">{isEdit ? "編輯資料" : "新增帳號"}</h3>
        <button
          type="button"
          onClick={() => formRef.current?.requestSubmit()}
          disabled={isPending}
          className="text-blue-500 font-bold text-sm disabled:opacity-50"
        >
          {isPending ? "儲存中…" : "儲存"}
        </button>
      </nav>

      <form ref={formRef} onSubmit={submit} className="p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600">
            {error}
          </div>
        )}

        {/* 登入資訊 */}
        <section className="space-y-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            登入資訊
          </h4>
          <FormField label="帳號" required>
            <input
              type="text"
              value={form.userName}
              onChange={(e) => set("userName", e.target.value)}
              disabled={isEdit}
              className="mantine-form-input"
              placeholder="請輸入帳號"
            />
          </FormField>
          <FormField
            label={isEdit ? "新密碼（留空不更改）" : "密碼"}
            required={!isEdit}
          >
            <input
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              className="mantine-form-input"
              placeholder="請輸入密碼"
            />
          </FormField>
        </section>

        {/* 基本資料 */}
        <section className="space-y-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            基本資料
          </h4>
          <FormField label="姓名" required>
            <input
              type="text"
              value={form.displayName}
              onChange={(e) => set("displayName", e.target.value)}
              className="mantine-form-input"
              placeholder="例如：王曉明"
            />
          </FormField>
          <FormField label="性別">
            <select
              value={form.gender}
              onChange={(e) => set("gender", e.target.value)}
              className="mantine-form-input"
            >
              <option value="">請選擇</option>
              <option value="Male">男</option>
              <option value="Female">女</option>
            </select>
          </FormField>
          <FormField label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="mantine-form-input"
              placeholder="user@example.com"
            />
          </FormField>
          <FormField label="手機">
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => set("phoneNumber", e.target.value)}
              className="mantine-form-input"
              placeholder="09xx-xxx-xxx"
            />
          </FormField>
        </section>

        {/* 帳號權限 */}
        <section className="space-y-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            帳號權限與屬性
          </h4>
          <FormField label="主要身分">
            <div className="flex flex-wrap gap-2">
              {ALL_ROLES.map(({ value, label }) => (
                <label
                  key={value}
                  className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold cursor-pointer border transition-all ${
                    form.roles?.includes(value)
                      ? "bg-blue-50 border-blue-500 text-blue-600"
                      : "bg-[#F8F9FA] border-gray-200 text-gray-500"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.roles?.includes(value) ?? false}
                    onChange={() => toggleRole(value)}
                    className="sr-only"
                  />
                  {label}
                </label>
              ))}
            </div>
          </FormField>
          <label className="flex items-center gap-3 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="w-4 h-4 accent-blue-600 cursor-pointer"
            />
            <span className="text-gray-700 font-medium text-xs">啟用帳號</span>
          </label>
        </section>
      </form>
    </div>
  );
};

const FormField = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-gray-700 ml-1">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);
