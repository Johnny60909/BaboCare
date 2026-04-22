import { useNavigate, useParams } from "react-router";
import { ChevronLeft } from "lucide-react";
import { useGetBabyById } from "../../hooks/queries/Babies/useBabies";
import BabyForm from "../../components/BabyForm";

export default function AdminBabyEditPage() {
  const navigate = useNavigate();
  const { babyId } = useParams<{ babyId: string }>();
  const { data: baby, isLoading, error } = useGetBabyById(babyId);

  const handleBack = () => navigate("/admin/babies");

  if (!babyId) {
    return (
      <div className="min-h-screen bg-babo-bg px-6 pt-6">
        <p className="text-red-500">未提供寶寶 ID</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-6 text-center text-babo-text-light">載入中…</div>;
  }

  if (error || !baby) {
    return (
      <div className="min-h-screen bg-babo-bg px-6 pt-6">
        <p className="text-red-500">無法載入寶寶資訊</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-babo-bg pb-24 px-6 pt-6">
      <button
        onClick={handleBack}
        className="flex items-center gap-1 text-babo-primary text-sm font-medium mb-6 active:scale-95 transition-all"
      >
        <ChevronLeft size={18} />
        返回寶寶管理
      </button>

      <div className="ios-card p-6">
        <h1 className="text-xl font-bold text-babo-text mb-6">
          編輯寶寶：{baby.name}
        </h1>
        <BabyForm babyId={babyId} onSuccess={handleBack} />
      </div>
    </div>
  );
}
