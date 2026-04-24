import { useRef } from "react";
import { useNavigate } from "react-router";
import { X } from "lucide-react";
import BabyForm from "../../components/BabyForm";

export default function AdminBabyNewPage() {
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10 border-b border-gray-100">
        <button
          onClick={() => navigate("/admin/babies")}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={18} className="text-gray-400" />
        </button>
        <h3 className="font-bold">新增寶寶</h3>
        <button
          type="button"
          onClick={() => formRef.current?.requestSubmit()}
          className="text-blue-500 font-bold text-sm"
        >
          儲存
        </button>
      </nav>
      <div className="p-6 pb-12">
        <BabyForm
          ref={formRef}
          babyId={null}
          onSuccess={() => navigate("/admin/babies")}
        />
      </div>
    </div>
  );
}
