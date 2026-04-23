import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Bell, MoreHorizontal, X } from "lucide-react";
import {
  useActivityFeed,
  useActivitySummaries,
  useBabyActivities,
} from "../hooks/queries/Activities/useActivities";
import { useGetBabies } from "../hooks/queries/Babies/useBabies";
import { ActivityType } from "../api/dtos/Activities/activityDtos";
import type {
  IActivity,
  IBabyActivitySummary,
} from "../api/dtos/Activities/activityDtos";
import type { IBaby } from "../api/dtos/Babies/babyDtos";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5181";
const getPhotoUrl = (url: string) =>
  url.startsWith("http") ? url : `${API_URL}${url}`;

const getAvatarUrl = (url: string | undefined | null, fallback: string) =>
  url ? (url.startsWith("http") ? url : `${API_URL}${url}`) : fallback;

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  [ActivityType.Feeding]: "🍼 喝奶",
  [ActivityType.Eating]: "🥣 副食品",
  [ActivityType.Diaper]: "💩 換尿布",
  [ActivityType.Sleep]: "😴 睡眠",
  [ActivityType.Mood]: "😊 心情",
};

const formatTime = (isoString: string) =>
  new Intl.DateTimeFormat("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(isoString));

// --- CarouselModal ---

interface CarouselModalProps {
  babyId: string;
  onClose: () => void;
}

const CarouselModal = ({ babyId, onClose }: CarouselModalProps) => {
  const { data: activities = [] } = useBabyActivities(babyId);
  const [index, setIndex] = useState(0);
  const current = activities[index];
  const touchStartX = useRef<number | null>(null);

  const handlePrev = () => setIndex((i) => Math.max(0, i - 1));
  const handleNext = () =>
    setIndex((i) => Math.min(activities.length - 1, i + 1));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (delta < -50) handleNext();
    else if (delta > 50) handlePrev();
  };

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 z-[200] flex flex-col"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 頂部工具列：X 關閉 + 進度條 + 計數 */}
      <div className="flex items-center gap-2 px-4 pt-10 pb-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white shrink-0"
        >
          <X size={16} />
        </button>
        <div className="flex items-center gap-1 flex-1">
          {activities.map((_, i) => (
            <div
              key={i}
              className={`h-0.5 flex-1 rounded transition-all ${i <= index ? "bg-white" : "bg-white/30"}`}
            />
          ))}
        </div>
        <span className="text-white/70 text-xs tabular-nums shrink-0">
          {index + 1} / {activities.length}
        </span>
      </div>

      {/* 圖片區（min-h-0 確保 flex-1 正確壓縮，使 max-h-full 生效） */}
      <div
        className="flex-1 min-h-0 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={getPhotoUrl(current.photoUrl)}
          alt={ACTIVITY_LABELS[current.type]}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      <div className="px-6 pb-10 pt-4" onClick={(e) => e.stopPropagation()}>
        <p className="text-white font-medium">
          {ACTIVITY_LABELS[current.type]}
        </p>
        {current.notes && (
          <p className="text-white/70 text-sm mt-1">{current.notes}</p>
        )}
        <p className="text-white/50 text-xs mt-2">
          {formatTime(current.createdAt)}
        </p>
      </div>

      {/* 箭頭：定位於 fixed 容器（viewport），不受圖片容器影響 */}
      {index > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white text-xl"
        >
          ‹
        </button>
      )}
      {index < activities.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-white text-xl"
        >
          ›
        </button>
      )}
    </div>
  );
};

// --- ActivityCard ---

const ActivityCard = ({ activity }: { activity: IActivity }) => (
  <div className="ios-card overflow-hidden">
    <div className="p-4 flex items-center gap-3 border-b border-gray-50">
      <img
        src={getAvatarUrl(
          activity.babyAvatarUrl,
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${activity.babyId}`,
        )}
        alt={activity.babyName}
        className="w-10 h-10 rounded-full bg-gray-200"
      />
      <div className="flex-1">
        <p className="font-bold text-base text-babo-text">
          {activity.babyName}
        </p>
        <p className="text-xs text-babo-text-light">
          {formatTime(activity.createdAt)} · {ACTIVITY_LABELS[activity.type]}
        </p>
      </div>
      <button className="text-babo-text-light hover:text-babo-text transition-colors">
        <MoreHorizontal size={18} />
      </button>
    </div>

    <div className="bg-gray-100 overflow-hidden flex items-center justify-center">
      <img
        src={getPhotoUrl(activity.photoUrl)}
        alt={ACTIVITY_LABELS[activity.type]}
        className="max-w-full h-auto max-h-[600px] block mx-auto"
      />
    </div>

    {activity.notes && (
      <div className="p-4">
        <p className="text-sm text-babo-text leading-relaxed">
          {activity.notes}
        </p>
      </div>
    )}
  </div>
);

// --- DashboardPage ---

export const DashboardPage = () => {
  const {
    data: feedPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isFeedLoading,
  } = useActivityFeed();

  const { data: summaries = [] } = useActivitySummaries();
  const { data: allBabies = [] } = useGetBabies();
  const [carouselBabyId, setCarouselBabyId] = useState<string | null>(null);

  // 合併頭像列：有活動的寶寶依最新活動排序，其餘排在後面
  const avatarList = useMemo(() => {
    const summaryIds = new Set(summaries.map((s) => s.babyId));
    const summaryBabies = summaries.map((s) => ({
      babyId: s.babyId,
      babyName: s.babyName,
      babyAvatarUrl: s.babyAvatarUrl,
      hasActivity: true,
    }));
    const restBabies = allBabies
      .filter((b: IBaby) => !summaryIds.has(b.id))
      .map((b: IBaby) => ({
        babyId: b.id,
        babyName: b.name,
        babyAvatarUrl: b.avatarUrl,
        hasActivity: false,
      }));
    return [...summaryBabies, ...restBabies];
  }, [summaries, allBabies]);

  const activities = feedPages?.pages.flatMap((p) => p.items) ?? [];

  // 無限滾動 sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(onIntersect, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [onIntersect]);

  return (
    <div className="min-h-screen bg-babo-bg pb-24">
      {/* 頭部 */}
      <header className="bg-white px-6 pt-6 pb-4 flex justify-between items-center shadow-sm">
        <h2 className="text-2xl font-bold text-babo-text">寶寶日常</h2>
        <button className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center hover:bg-blue-200 transition-colors">
          <Bell className="w-5 h-5 text-babo-primary" />
        </button>
      </header>

      {/* 頭像列（有活動的寶寶排前，依最新活動排序；無活動的寶寶排後） */}
      {avatarList.length > 0 && (
        <div className="flex gap-4 px-6 py-4 overflow-x-auto no-scrollbar">
          {avatarList.map((s) => (
            <button
              key={s.babyId}
              onClick={() =>
                s.hasActivity ? setCarouselBabyId(s.babyId) : undefined
              }
              className={`flex flex-col items-center gap-1 min-w-[70px] ${
                s.hasActivity ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <div
                className={`status-ring ${s.hasActivity ? "status-awake" : ""}`}
              >
                <img
                  src={getAvatarUrl(
                    s.babyAvatarUrl,
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.babyId}`,
                  )}
                  alt={s.babyName}
                  className={`w-14 h-14 rounded-full bg-gray-200 ${
                    s.hasActivity ? "" : "opacity-50"
                  }`}
                />
              </div>
              <span className="text-xs font-medium text-babo-text">
                {s.babyName}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Feed 列表 */}
      <div className="px-6 space-y-6 pt-2">
        {isFeedLoading && (
          <div className="text-center text-babo-text-light py-10">
            載入中...
          </div>
        )}

        {!isFeedLoading && activities.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🍼</p>
            <p className="text-babo-text-light font-medium">還沒有動態</p>
            <p className="text-babo-text-light text-sm mt-1">
              點擊下方「+」按鈕新增第一筆記錄
            </p>
          </div>
        )}

        {activities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}

        <div ref={sentinelRef} className="h-4" />
        {isFetchingNextPage && (
          <div className="text-center text-babo-text-light py-4 text-sm">
            載入更多...
          </div>
        )}
      </div>

      {/* 轉盤模態 */}
      {carouselBabyId && (
        <CarouselModal
          babyId={carouselBabyId}
          onClose={() => setCarouselBabyId(null)}
        />
      )}
    </div>
  );
};
