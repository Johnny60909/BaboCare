import { useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { X } from "lucide-react";
import { useGetBabyById } from "../../hooks/queries/Babies/useBabies";
import BabyForm from "../../components/BabyForm";

export default function AdminBabyEditPage() {
  const navigate = useNavigate();
  const { babyId } = useParams<{ babyId: string }>();
  const { data: baby, isLoading, error } = useGetBabyById(babyId);
  const formRef = useRef<HTMLFormElement>(null);

  const handleBack = () => navigate("/admin/babies");

  if (!babyId)
    return <div className="p-6 text-center text-red-500">缺少寶寶 ID</div>;

  if (isLoading)
    return <div className="p-6 text-center text-gray-400">載入中…</div>;

  if (error || !baby)
    return <div className="p-6 text-center text-red-500">無法載入寶寶資料</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10 border-b border-gray-100">
        <button
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={18} className="text-gray-400" />
        </button>
        <h3 className="font-bold">編輯寶寶</h3>
        <button
          type="button"
          onClick={() => formRef.current?.requestSubmit()}
          className="text-blue-500 font-bold text-sm"
        >
          儲存
        </button>
      </nav>
      <div className="p-6 pb-12">
        <BabyForm ref={formRef} babyId={babyId} onSuccess={handleBack} />
      </div>
    </div>
  );
}
