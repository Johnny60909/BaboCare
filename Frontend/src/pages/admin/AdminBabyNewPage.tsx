import { useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";
import BabyForm from "../../components/BabyForm";

export default function AdminBabyNewPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-babo-bg pb-24 px-6 pt-6">
      <button
        onClick={() => navigate("/admin/babies")}
        className="flex items-center gap-1 text-babo-primary text-sm font-medium mb-6 active:scale-95 transition-all"
      >
        <ChevronLeft size={18} />
        返回寶寶管理
      </button>

      <div className="ios-card p-6">
        <h1 className="text-xl font-bold text-babo-text mb-6">新增寶寶</h1>
        <BabyForm babyId={null} onSuccess={() => navigate("/admin/babies")} />
      </div>
    </div>
  );
}
