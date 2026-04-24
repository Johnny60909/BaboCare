import React, { useState, useEffect } from "react";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { Camera } from "lucide-react";
import { MultiSelect, Progress } from "@mantine/core";

const inputClass =
  "w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 transition-colors appearance-none";
const labelClass = "block text-xs font-bold text-gray-700 ml-1 mb-1";
const sectionHeaderClass =
  "text-xs font-bold text-gray-400 uppercase tracking-widest";
import {
  useGetBabyById,
  useCreateBaby,
  useUpdateBaby,
  useUploadBabyAvatar,
  useGetNannies,
  useGetParents,
} from "../hooks/queries/Babies/useBabies";
import ImageCropModal from "./ImageCropModal";
import type { ICreateBabyRequest } from "../api/dtos/Babies/babyDtos";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5181";
const getAvatarUrl = (url?: string | null) =>
  url ? (url.startsWith("http") ? url : `${API_URL}${url}`) : undefined;

interface BabyFormProps {
  babyId?: string | null;
  onSuccess?: () => void;
}

const BabyForm = React.forwardRef<HTMLFormElement, BabyFormProps>(
  function BabyForm({ babyId, onSuccess }, ref) {
    const { data: baby } = useGetBabyById(babyId || undefined);
    const { mutate: createBaby } = useCreateBaby();
    const { mutate: updateBaby } = useUpdateBaby();
    const { mutate: uploadAvatar, isPending: isUploading } =
      useUploadBabyAvatar();
    const { data: nannies = [] } = useGetNannies();
    const { data: parents = [] } = useGetParents();
    const [uploadProgress, setUploadProgress] = useState(0);
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string>("");
    const [cropProgress, setCropProgress] = useState(false);

    const form = useForm<ICreateBabyRequest>({
      initialValues: {
        name: "",
        dateOfBirth: "",
        gender: "",
        nannyId: "",
        parentIds: [],
      },
      validate: {
        name: (value: string) => (!value ? "名稱為必需" : null),
        dateOfBirth: (value: string) => (!value ? "出生日期為必需" : null),
      },
    });

    useEffect(() => {
      if (baby) {
        form.setValues({
          name: baby.name,
          dateOfBirth: baby.dateOfBirth,
          gender: baby.gender ?? "",
          nannyId: baby.nannyId ?? "",
          parentIds: baby.parentIds ?? [],
        });
      }
    }, [baby?.id]);

    const handleSubmit = form.onSubmit((values) => {
      // 轉換空字符串為 undefined（DTO 接受 undefined 而不是 null）
      const requestData = {
        ...values,
        nannyId: values.nannyId === "" ? undefined : values.nannyId,
      } as ICreateBabyRequest;

      if (babyId) {
        updateBaby(
          { id: babyId, request: requestData },
          {
            onSuccess: () => {
              notifications.show({
                title: "成功",
                message: "寶寶已更新",
                color: "green",
                icon: <IconCheck size={16} />,
                autoClose: 3000,
              });
              onSuccess?.();
            },
          },
        );
      } else {
        createBaby(requestData, {
          onSuccess: () => {
            notifications.show({
              title: "成功",
              message: "寶寶已建立",
              color: "green",
            });
            form.reset();
            onSuccess?.();
          },
        });
      }
    });

    const handleAvatarUpload = (file: File | null) => {
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          setSelectedImage(reader.result as string);
          setCropModalOpen(true);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleCropComplete = (croppedBlob: Blob) => {
      if (!babyId) return;

      setCropProgress(true);
      // Convert Blob to File
      const file = new File([croppedBlob], "avatar.jpg", {
        type: "image/jpeg",
      });

      uploadAvatar(
        { babyId, file, onProgress: setUploadProgress },
        {
          onSuccess: () => {
            notifications.show({
              title: "成功",
              message: "頭像已上傳",
              color: "green",
              icon: <IconCheck size={16} />,
              autoClose: 3000,
            });
            setUploadProgress(0);
            setCropProgress(false);
          },
          onError: () => {
            setCropProgress(false);
            notifications.show({
              title: "失敗",
              message: "頭像上傳失敗",
              color: "red",
              icon: <IconX size={16} />,
              autoClose: 4000,
            });
          },
        },
      );
    };

    return (
      <form ref={ref} onSubmit={handleSubmit} className="space-y-6">
        {/* 基本資料 */}
        <section className="space-y-4">
          <h4 className={sectionHeaderClass}>基本資料</h4>

          <div>
            <label className={labelClass}>名稱 *</label>
            <input
              type="text"
              className={inputClass}
              placeholder="輸入寶寶名稱"
              value={form.values.name}
              onChange={(e) => form.setFieldValue("name", e.target.value)}
            />
            {form.errors.name && (
              <p className="text-xs text-red-500 ml-1 mt-1">
                {form.errors.name}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>出生日期 *</label>
            <input
              type="date"
              className={inputClass}
              value={form.values.dateOfBirth}
              onChange={(e) =>
                form.setFieldValue("dateOfBirth", e.target.value)
              }
            />
            {form.errors.dateOfBirth && (
              <p className="text-xs text-red-500 ml-1 mt-1">
                {form.errors.dateOfBirth}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>性別</label>
            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
              {[
                { value: "Male", label: "男" },
                { value: "Female", label: "女" },
              ].map((g) => (
                <label
                  key={g.value}
                  className={`flex-1 text-center py-2 text-xs font-bold cursor-pointer rounded-lg transition-all ${
                    form.values.gender === g.value
                      ? "bg-white shadow-sm text-gray-800"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  <input
                    type="radio"
                    className="hidden"
                    value={g.value}
                    checked={form.values.gender === g.value}
                    onChange={() => form.setFieldValue("gender", g.value)}
                  />
                  {g.label}
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* 指派設定 */}
        <section className="space-y-4">
          <h4 className={sectionHeaderClass}>指派設定</h4>

          <div>
            <label className={labelClass}>保母</label>
            <select
              className={inputClass}
              value={form.values.nannyId}
              onChange={(e) => form.setFieldValue("nannyId", e.target.value)}
            >
              <option value="">選擇保母</option>
              {nannies.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.displayName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>指定家長</label>
            <MultiSelect
              placeholder="選擇一個或多個家長"
              data={parents.map((p) => ({ value: p.id, label: p.displayName }))}
              searchable
              clearable
              value={form.values.parentIds}
              onChange={(val) => form.setFieldValue("parentIds", val)}
              styles={{
                input: {
                  backgroundColor: "#F8F9FA",
                  borderColor: "#E9ECEF",
                  borderRadius: "12px",
                  fontSize: "14px",
                  minHeight: "48px",
                  padding: "12px 16px",
                },
              }}
            />
          </div>
        </section>

        {/* 頭像（僅編輯模式） */}
        {babyId && (
          <section className="space-y-4">
            <h4 className={sectionHeaderClass}>頭像</h4>

            {baby?.avatarUrl ? (
              <div className="relative rounded-[24px] overflow-hidden bg-gray-100">
                <img
                  src={getAvatarUrl(baby.avatarUrl)}
                  alt={baby.name}
                  className="max-w-full h-auto max-h-[400px] block mx-auto"
                />
                {isUploading || cropProgress ? (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      上傳中...
                    </span>
                  </div>
                ) : (
                  <label
                    onClick={() =>
                      document.getElementById("avatar-file-input")?.click()
                    }
                    className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors"
                  >
                    <Camera size={14} className="text-white" />
                  </label>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() =>
                  document.getElementById("avatar-file-input")?.click()
                }
                className="w-full p-6 bg-gray-50 rounded-[24px] flex flex-col items-center justify-center gap-2 h-28 border-2 border-dashed border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <Camera size={28} className="text-gray-300" />
                <span className="text-xs text-gray-400">上傳頭像</span>
              </button>
            )}

            <input
              id="avatar-file-input"
              type="file"
              accept="image/png,image/jpeg,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.currentTarget.files?.[0];
                if (file) handleAvatarUpload(file);
              }}
            />

            {uploadProgress > 0 && uploadProgress < 100 && (
              <Progress value={uploadProgress} animated />
            )}

            <ImageCropModal
              opened={cropModalOpen}
              onClose={() => setCropModalOpen(false)}
              imageSrc={selectedImage}
              onCropComplete={handleCropComplete}
              aspectRatio={1}
            />
          </section>
        )}

        {/* 刪除按鈕已移除 - 刪除操作在列表頁進行 */}
      </form>
    );
  },
);

export default BabyForm;
