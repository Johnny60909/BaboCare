import {
  Stack,
  Button,
  TextInput,
  Select,
  Group,
  FileInput,
  Progress,
  Avatar,
  Box,
  Text,
} from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  useGetBabyById,
  useCreateBaby,
  useUpdateBaby,
  useUploadBabyAvatar,
  useGetNannies,
} from "../hooks/queries/Babies/useBabies";
import ImageCropModal from "./ImageCropModal";
import type { ICreateBabyRequest } from "../api/dtos/babyDtos";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5181";
const getAvatarUrl = (url?: string | null) =>
  url ? (url.startsWith("http") ? url : `${API_URL}${url}`) : undefined;

interface BabyFormProps {
  babyId?: string | null;
  onSuccess?: () => void;
}

export default function BabyForm({ babyId, onSuccess }: BabyFormProps) {
  const { data: baby } = useGetBabyById(babyId || undefined);
  const { mutate: createBaby, isPending: isCreating } = useCreateBaby();
  const { mutate: updateBaby, isPending: isUpdating } = useUpdateBaby();
  const { mutate: uploadAvatar, isPending: isUploading } =
    useUploadBabyAvatar();
  const { data: nannies = [] } = useGetNannies();
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
      name: (value) => (!value ? "名稱為必需" : null),
      dateOfBirth: (value) => (!value ? "出生日期為必需" : null),
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
    const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });

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
    <form onSubmit={handleSubmit}>
      <Stack>
        <TextInput
          label="名稱"
          placeholder="輸入寶寶名稱"
          {...form.getInputProps("name")}
        />

        <TextInput
          label="出生日期"
          type="date"
          placeholder="選擇出生日期"
          {...form.getInputProps("dateOfBirth")}
        />

        <Select
          label="性別"
          placeholder="選擇性別"
          data={[
            { value: "Male", label: "男" },
            { value: "Female", label: "女" },
          ]}
          {...form.getInputProps("gender")}
        />

        <Select
          label="保母"
          placeholder="選擇保母"
          data={nannies.map((n) => ({ value: n.id, label: n.displayName }))}
          clearable
          {...form.getInputProps("nannyId")}
        />

        {babyId && (
          <>
            <div>
              <Text fw={500} mb="xs">
                寶寶頭像
              </Text>
              {baby?.avatarUrl && (
                <Box mb="md" style={{ textAlign: "center" }}>
                  <Avatar
                    src={getAvatarUrl(baby.avatarUrl)}
                    size={100}
                    radius="50%"
                    alt={baby.name}
                  />
                </Box>
              )}
            </div>

            <FileInput
              label="更換頭像"
              placeholder="選擇圖片"
              accept="image/png,image/jpeg,image/gif"
              onChange={handleAvatarUpload}
              disabled={isUploading || cropProgress}
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
          </>
        )}

        <Group justify="flex-end">
          <Button type="submit" loading={isCreating || isUpdating}>
            {babyId ? "更新" : "建立"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
