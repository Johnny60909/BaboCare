import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { modals } from "@mantine/modals";
import { Text } from "@mantine/core";
import {
  useGetBabies,
  useDeleteBaby,
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
  const { mutate: deleteBaby } = useDeleteBaby();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

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
    return <div className="p-6 text-center text-gray-400">載入中…</div>;

  return (
    <div className="min-h-screen bg-white px-6 pt-12 pb-28 text-left">
      <AdminListHeader
        title="寶寶管理"
        subtitle={`共 ${filtered.length} 位寶寶`}
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="搜尋寶寶名稱…"
        addButton={
          <button
            onClick={() => navigate("/admin/babies/new")}
            className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center active:scale-95 transition-all"
          >
            <Plus size={18} />
          </button>
        }
      />

      {paged.length === 0 ? (
        <div className="ios-card p-12 text-center">
          <p className="text-gray-400">尚無寶寳資料</p>
        </div>
      ) : (
        <div>
          {paged.map((baby) => {
            return (
              <div
                key={baby.id}
                className="flex items-center gap-4 p-4 border-b border-gray-50"
              >
                {/* 頭像 */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0 overflow-hidden">
                  {baby.avatarUrl ? (
                    <img
                      src={baby.avatarUrl}
                      alt={baby.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (baby.name || "?").charAt(0).toUpperCase()
                  )}
                </div>

                {/* 資訊 */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-800 mb-1">
                    {baby.name}
                  </div>
                  <div className="text-[10px] text-gray-400 font-medium uppercase">
                    {genderLabel[baby.gender ?? ""] ?? "未設定"} ·{" "}
                    {calcAge(baby.dateOfBirth)}
                  </div>
                </div>

                {/* 操作 */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => navigate(`/admin/babies/${baby.id}`)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-300"
                    title="編輯"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(baby.id)}
                    className="p-2 rounded-full hover:bg-red-50 transition-colors text-red-300"
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
