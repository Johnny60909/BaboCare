import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { modals } from "@mantine/modals";
import { Text } from "@mantine/core";
import {
  useGetBabies,
  useDeleteBaby,
  useGetNannies,
} from "../../hooks/queries/Babies/useBabies";
import { AdminListHeader } from "../../components/admin/AdminListHeader";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { useDebounce } from "../../hooks/useDebounce";

const ITEMS_PER_PAGE = 10;

function calcAge(dateOfBirth: string): string {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  const months =
    (now.getFullYear() - dob.getFullYear()) * 12 +
    (now.getMonth() - dob.getMonth());
  if (months < 12) return `${months} 個月`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years} 歲 ${rem} 個月` : `${years} 歲`;
}

const genderLabel: Record<string, string> = {
  Male: "男寶寶",
  Female: "女寶寶",
};

export default function AdminBabiesPage() {
  const navigate = useNavigate();
  const { data: babies = [], isLoading } = useGetBabies();
  const { data: nannies = [] } = useGetNannies();
  const { mutate: deleteBaby } = useDeleteBaby();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const nannyMap = useMemo<Record<string, string>>(
    () => Object.fromEntries(nannies.map((n) => [n.id, n.displayName])),
    [nannies],
  );

  const filtered = babies.filter(
    (b) =>
      !debouncedSearch ||
      b.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paged = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleDelete = (id: string) => {
    modals.openConfirmModal({
      title: "刪除寶寶資料",
      children: <Text size="sm">確定要刪除這個寶寶嗎？此操作無法復原。</Text>,
      labels: { confirm: "確定刪除", cancel: "取消" },
      confirmProps: { color: "red" },
      onConfirm: () => deleteBaby(id),
    });
  };

  if (isLoading)
    return <div className="p-6 text-center text-babo-text-light">載入中…</div>;

  return (
    <div className="min-h-screen bg-babo-bg pb-24 px-6 pt-6">
      <AdminListHeader
        title="寶寶管理"
        subtitle={`共 ${filtered.length} 位寶寶`}
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="搜尋寶寶名稱…"
        addButton={
          <button
            onClick={() => navigate("/admin/babies/new")}
            className="flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white bg-babo-primary active:scale-95 transition-all shadow-md"
          >
            <Plus size={18} />
            新增
          </button>
        }
      />

      {paged.length === 0 ? (
        <div className="ios-card p-12 text-center">
          <p className="text-babo-text-light">尚無寶寶資料</p>
        </div>
      ) : (
        <div className="space-y-3">
          {paged.map((baby) => {
            const nannyName = baby.nannyId ? nannyMap[baby.nannyId] : null;
            return (
              <div
                key={baby.id}
                className="ios-card p-5 flex items-center gap-4"
              >
                {/* 頭像 */}
                <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                  {baby.avatarUrl ? (
                    <img
                      src={baby.avatarUrl}
                      alt={baby.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    "👶"
                  )}
                </div>

                {/* 資訊 */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-babo-text text-base">
                    {baby.name}
                  </p>
                  <p className="text-xs text-babo-text-light">
                    {calcAge(baby.dateOfBirth)} ·{" "}
                    {genderLabel[baby.gender ?? ""] ?? "未設定"}
                  </p>
                  <div className="mt-1.5">
                    {nannyName ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                        已指派：{nannyName}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-500">
                        未指派保母
                      </span>
                    )}
                  </div>
                </div>

                {/* 操作 */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <button
                    onClick={() => navigate(`/admin/babies/${baby.id}`)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors text-babo-primary"
                    title="編輯"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(baby.id)}
                    className="p-2 rounded-full hover:bg-red-50 transition-colors text-red-400"
                    title="刪除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
