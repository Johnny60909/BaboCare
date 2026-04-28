import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import {
  useCurrentUser,
  useUpdateMyProfile,
} from "../hooks/queries/CurrentUser/useCurrentUser";
import type { UpdateMyProfileRequest } from "../api/dtos/Users/currentUser.dto";

interface AccountSettingsFormProps {
  onClose: () => void;
}

/**
 * 帳戶設定編輯表單
 */
export const AccountSettingsForm = ({ onClose }: AccountSettingsFormProps) => {
  const { data: user } = useCurrentUser();
  const { mutate: updateProfile, isPending } = useUpdateMyProfile();

  const [formData, setFormData] = useState<UpdateMyProfileRequest>({
    displayName: user?.displayName ?? "",
    gender: user?.gender ?? "",
    email: user?.email ?? "",
    phoneNumber: user?.phoneNumber ?? "",
  });

  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // 當 user 數據加載或更新時，同步到表單
  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName ?? "",
        gender: user.gender ?? "",
        email: user.email ?? "",
        phoneNumber: user.phoneNumber ?? "",
      });
    }
  }, [user]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = "顯示名稱不能為空";
    }

    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "請輸入有效的郵箱地址";
      }
    }

    // 密碼驗證
    if (formData.newPassword) {
      if (!formData.newPassword) {
        newErrors.newPassword = "請輸入新密碼";
      } else if (formData.newPassword.length < 8) {
        newErrors.newPassword = "新密碼至少需要 8 個字符";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    updateProfile(formData, {
      onSuccess: () => {
        notifications.show({
          title: "成功",
          message: "個人資料已更新",
          color: "green",
          autoClose: 3000,
        });
        setShowPasswordSection(false);
        setFormData((prev) => ({
          ...prev,
          newPassword: undefined,
        }));
        setTimeout(onClose, 500);
      },
      onError: (error: any) => {
        const errorMessage =
          error?.response?.data?.message || "更新失敗，請稍後重試";
        notifications.show({
          title: "失敗",
          message: errorMessage,
          color: "red",
          autoClose: 5000,
        });
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <FormField label="顯示名稱" required>
        <input
          type="text"
          placeholder="輸入顯示名稱"
          value={formData.displayName}
          onChange={(e) =>
            setFormData({ ...formData, displayName: e.target.value })
          }
          className="mantine-form-input"
          disabled={isPending}
        />
        {errors.displayName && (
          <p className="text-xs text-red-500 ml-1 mt-1">{errors.displayName}</p>
        )}
      </FormField>

      <FormField label="性別">
        <select
          value={formData.gender ?? ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              gender: e.target.value || undefined,
            })
          }
          className="mantine-form-input"
          disabled={isPending}
        >
          <option value="">請選擇</option>
          <option value="Male">男</option>
          <option value="Female">女</option>
          <option value="Other">其他</option>
        </select>
      </FormField>

      <FormField label="Email">
        <input
          type="email"
          placeholder="user@example.com"
          value={formData.email ?? ""}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value || undefined })
          }
          className="mantine-form-input"
          disabled={isPending}
        />
        {errors.email && (
          <p className="text-xs text-red-500 ml-1 mt-1">{errors.email}</p>
        )}
      </FormField>

      <FormField label="手機">
        <input
          type="tel"
          placeholder="09xx-xxx-xxx"
          value={formData.phoneNumber ?? ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              phoneNumber: e.target.value || undefined,
            })
          }
          className="mantine-form-input"
          disabled={isPending}
        />
      </FormField>

      {/* 密碼修改區段 */}
      <div className="border-t pt-6">
        <button
          type="button"
          onClick={() => setShowPasswordSection(!showPasswordSection)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          {showPasswordSection ? "隱藏" : "修改"} 密碼
        </button>

        {showPasswordSection && (
          <div className="mt-4 space-y-4">
            <FormField label="新密碼" required>
              <input
                type="password"
                placeholder="輸入新密碼（至少 8 個字符）"
                value={formData.newPassword ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    newPassword: e.target.value || undefined,
                  })
                }
                className="mantine-form-input"
                disabled={isPending}
              />
              {errors.newPassword && (
                <p className="text-xs text-red-500 ml-1 mt-1">
                  {errors.newPassword}
                </p>
              )}
            </FormField>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-3 bg-white border border-[#E9ECEF] rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm font-medium text-gray-700"
          disabled={isPending}
        >
          取消
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-3 bg-babo-primary text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm font-medium"
          disabled={isPending}
        >
          {isPending ? "儲存中…" : "儲存"}
        </button>
      </div>
    </form>
  );
};

/**
 * 表單欄位包裝器組件
 */
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
