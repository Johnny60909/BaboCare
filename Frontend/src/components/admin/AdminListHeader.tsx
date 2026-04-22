import { Search } from "lucide-react";
import type { ReactNode } from "react";

interface AdminListHeaderProps {
  title: string;
  subtitle?: string;
  searchValue: string;
  onSearch: (value: string) => void;
  searchPlaceholder?: string;
  filterButton?: ReactNode;
  addButton?: ReactNode;
}

/**
 * 後台列表頁共用標題區塊
 * 包含：標題、搜尋框、篩選按鈕、新增按鈕
 */
export const AdminListHeader = ({
  title,
  subtitle,
  searchValue,
  onSearch,
  searchPlaceholder = "搜尋名稱…",
  filterButton,
  addButton,
}: AdminListHeaderProps) => {
  return (
    <div className="mb-6">
      {/* 標題列 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-babo-text">{title}</h1>
          {subtitle && (
            <p className="text-babo-text-light text-sm mt-0.5">{subtitle}</p>
          )}
        </div>
        {addButton}
      </div>

      {/* 搜尋與篩選列 */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-babo-text-light pointer-events-none"
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-4 py-3 rounded-[32px] bg-white border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-200 focus:border-babo-primary transition-all shadow-sm"
          />
        </div>
        {filterButton}
      </div>
    </div>
  );
};
