import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * 後台列表共用分頁器
 * 顯示：上一頁、頁碼按鈕（最多5個）、下一頁、目前頁數說明
 */
export const AdminPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: AdminPaginationProps) => {
  if (totalPages <= 1) return null;

  // 計算顯示的頁碼範圍（最多5個）
  const getPageNumbers = () => {
    const pages: number[] = [];
    let start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="flex items-center justify-between mt-6">
      <span className="text-xs text-babo-text-light">
        第 {currentPage} 頁，共 {totalPages} 頁
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-full border border-gray-200 text-babo-text-light hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
              page === currentPage
                ? "bg-babo-primary text-white shadow-sm"
                : "border border-gray-200 text-babo-text-light hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-full border border-gray-200 text-babo-text-light hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
