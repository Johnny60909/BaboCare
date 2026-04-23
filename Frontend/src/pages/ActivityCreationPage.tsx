import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { Textarea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ChevronLeft, Camera, X } from "lucide-react";
import {
  ActivityType,
  EatingOption,
  MoodOption,
} from "../api/dtos/Activities/activityDtos";
import { activityService } from "../api/services/Activities/activityService";
import { useGetBabies } from "../hooks/queries/Babies/useBabies";
import { useCreateActivity } from "../hooks/queries/Activities/useActivities";
import type { IBaby } from "../api/dtos/Babies/babyDtos";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5181";

const getAvatarUrl = (url: string | undefined | null, seed: string) =>
  url
    ? url.startsWith("http")
      ? url
      : `${API_URL}${url}`
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

const ACTIVITY_TYPES = [
  {
    type: ActivityType.Feeding,
    label: "餵奶",
    emoji: "🍼",
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    color: "text-blue-600",
  },
  {
    type: ActivityType.Eating,
    label: "進食",
    emoji: "🥣",
    bg: "bg-orange-50",
    iconBg: "bg-orange-100",
    color: "text-orange-600",
  },
  {
    type: ActivityType.Diaper,
    label: "換尿布",
    emoji: "🫧",
    bg: "bg-green-50",
    iconBg: "bg-green-100",
    color: "text-green-600",
  },
  {
    type: ActivityType.Sleep,
    label: "睡眠",
    emoji: "😴",
    bg: "bg-purple-50",
    iconBg: "bg-purple-100",
    color: "text-purple-600",
  },
  {
    type: ActivityType.Mood,
    label: "心情",
    emoji: "😊",
    bg: "bg-yellow-50",
    iconBg: "bg-yellow-100",
    color: "text-yellow-600",
  },
];

const EATING_OPTIONS = [
  { value: String(EatingOption.Supplementary), label: "副食品" },
  { value: String(EatingOption.Lunch), label: "午餐" },
];

const MOOD_OPTIONS = [
  { value: String(MoodOption.Outing), label: "🌳 出遊" },
  { value: String(MoodOption.Playing), label: "🎮 玩遊戲" },
  { value: String(MoodOption.Unhappy), label: "😢 不開心" },
];

export const ActivityCreationPage = () => {
  const navigate = useNavigate();
  const { data: babies = [] } = useGetBabies();
  const { mutateAsync: createActivity } = useCreateActivity();

  // 'hub' = 功能選擇頁，'detail' = 詳細輸入頁
  const [view, setView] = useState<"hub" | "detail">("hub");
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<ActivityType | null>(null);
  const [typeOption, setTypeOption] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTypeInfo = ACTIVITY_TYPES.find((t) => t.type === selectedType);
  const showTypeOption =
    selectedType === ActivityType.Eating || selectedType === ActivityType.Mood;
  const typeOptionChoices =
    selectedType === ActivityType.Eating ? EATING_OPTIONS : MOOD_OPTIONS;
  const typeOptionLabel =
    selectedType === ActivityType.Eating ? "進食類型" : "心情類型";

  const handleTypeSelect = (type: ActivityType) => {
    if (!selectedBabyId) {
      notifications.show({
        color: "yellow",
        title: "請先選擇寶寶",
        message: "請先在上方選擇要記錄的寶寶",
      });
      return;
    }
    setSelectedType(type);
    setTypeOption(null);
    setNotes("");
    setPhotoUrl(null);
    setPhotoPreview(null);
    setView("detail");
  };

  const handleBackToHub = () => {
    setView("hub");
    setSelectedType(null);
    setTypeOption(null);
    setNotes("");
    setPhotoUrl(null);
    setPhotoPreview(null);
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);
    setIsUploading(true);
    try {
      const url = await activityService.uploadPhoto(file);
      setPhotoUrl(url);
    } catch (err) {
      console.error("照片上傳失敗", err);
      setPhotoPreview(null);
      setPhotoUrl(null);
      notifications.show({
        color: "red",
        title: "上傳失敗",
        message: "照片上傳失敗，請重試",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const canSubmit =
    selectedBabyId &&
    selectedType !== null &&
    photoUrl &&
    !isUploading &&
    !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      await createActivity({
        babyId: selectedBabyId!,
        type: selectedType!,
        photoUrl: photoUrl!,
        notes: notes || undefined,
        typeOption: typeOption ? Number(typeOption) : undefined,
      });
      notifications.show({
        color: "green",
        title: "發布成功",
        message: "動態已成功發布 🎉",
      });
      navigate("/");
    } catch (err) {
      console.error("建立活動失敗", err);
      notifications.show({
        color: "red",
        title: "發布失敗",
        message: "發布動態時發生錯誤，請重試",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Hub View（功能選擇頁） ───────────────────────────────────────────
  if (view === "hub") {
    return (
      <div className="min-h-screen bg-babo-bg pb-24">
        {/* 標題列 */}
        <header className="bg-white px-6 pt-6 pb-4 flex items-center gap-3 shadow-sm">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={22} className="text-babo-text" />
          </button>
          <h2 className="text-xl font-bold text-babo-text">快速紀錄</h2>
        </header>

        {/* 寶寶頭像選擇列 */}
        <div className="bg-white px-6 pt-5 pb-6 mb-4 shadow-sm">
          <p className="text-sm font-medium text-babo-text-light mb-4">
            選擇寶寶
          </p>
          {babies.length === 0 ? (
            <p className="text-sm text-gray-400">暫無寶寶資料</p>
          ) : (
            <div className="flex gap-5 overflow-x-auto no-scrollbar">
              {babies.map((baby: IBaby) => (
                <button
                  key={baby.id}
                  onClick={() => setSelectedBabyId(baby.id)}
                  className="flex flex-col items-center gap-1.5 min-w-[64px]"
                >
                  <div
                    className={`p-0.5 rounded-full border-2 transition-colors ${
                      selectedBabyId === baby.id
                        ? "border-babo-primary"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={getAvatarUrl(baby.avatarUrl, baby.id)}
                      alt={baby.name}
                      className="w-14 h-14 rounded-full bg-gray-100 object-cover"
                    />
                  </div>
                  <span
                    className={`text-xs font-medium truncate max-w-[64px] ${
                      selectedBabyId === baby.id
                        ? "text-babo-primary"
                        : "text-babo-text"
                    }`}
                  >
                    {baby.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 活動類型卡片 */}
        <div className="px-6">
          <p className="text-sm font-medium text-babo-text-light mb-4">
            {selectedBabyId ? "選擇紀錄類型" : "請先選擇寶寶"}
          </p>
          <div className="grid grid-cols-2 gap-4">
            {ACTIVITY_TYPES.map((at) => (
              <button
                key={at.type}
                onClick={() => handleTypeSelect(at.type)}
                className={`ios-card p-6 flex flex-col items-center justify-center gap-4 ${at.bg} transition-opacity ${
                  !selectedBabyId ? "opacity-40" : ""
                }`}
              >
                <div
                  className={`w-16 h-16 ${at.iconBg} rounded-full flex items-center justify-center`}
                >
                  <span className="text-4xl">{at.emoji}</span>
                </div>
                <span className={`font-bold ${at.color}`}>{at.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Detail View（詳細輸入頁） ────────────────────────────────────────
  const selectedBaby = babies.find((b: IBaby) => b.id === selectedBabyId);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* 標題列 */}
      <header className="px-6 pt-6 pb-4 flex items-center bg-white shadow-sm">
        <button
          onClick={handleBackToHub}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={22} className="text-babo-text" />
        </button>
        <h2 className="text-xl font-bold text-babo-text mx-auto">
          {currentTypeInfo?.emoji} {currentTypeInfo?.label}紀錄
        </h2>
        <div className="w-9" />
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* 已選寶寶 */}
        {selectedBaby && (
          <div className="flex items-center gap-3 py-2">
            <img
              src={getAvatarUrl(selectedBaby.avatarUrl, selectedBaby.id)}
              alt={selectedBaby.name}
              className="w-10 h-10 rounded-full bg-gray-100 object-cover"
            />
            <span className="font-medium text-babo-text">
              {selectedBaby.name}
            </span>
          </div>
        )}

        {/* 類型子選項（進食 / 心情） */}
        {showTypeOption && (
          <div>
            <p className="text-sm font-medium text-babo-text mb-3">
              {typeOptionLabel}
            </p>
            <div className="flex flex-wrap gap-2">
              {typeOptionChoices.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    setTypeOption(opt.value === typeOption ? null : opt.value)
                  }
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    typeOption === opt.value
                      ? "bg-babo-primary text-white"
                      : "bg-gray-100 text-babo-text hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 照片上傳 */}
        <div>
          {photoPreview ? (
            <div className="relative rounded-[24px] overflow-hidden bg-gray-100">
              <img
                src={photoPreview}
                alt="預覽"
                className="max-w-full h-auto max-h-[600px] block mx-auto"
              />
              {isUploading ? (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    上傳中...
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setPhotoPreview(null);
                    setPhotoUrl(null);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center"
                >
                  <X size={14} className="text-white" />
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-6 bg-gray-50 rounded-[24px] flex flex-col items-center justify-center gap-2 h-28 border-2 border-dashed border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <Camera size={28} className="text-gray-300" />
              <span className="text-xs text-gray-400">拍攝照片</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoSelect}
          />
        </div>

        {/* 備註 */}
        <Textarea
          placeholder="記錄今天的點點滴滴..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          maxLength={1000}
        />
      </div>

      {/* 發布按鈕 */}
      <div className="p-6 bg-white border-t border-gray-100">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full py-5 bg-babo-primary text-white font-bold text-lg rounded-[32px] shadow-lg shadow-blue-100 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
        >
          {isUploading
            ? "照片上傳中..."
            : isSubmitting
              ? "發布中..."
              : "確認發布"}
        </button>
      </div>
    </div>
  );
};
