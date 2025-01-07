import { Button } from "@/components/ui/button";
import { Music4 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Cover = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    localStorage.setItem('showMain', 'true');
    navigate('/main');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500">
      <div className="text-center">
        <div className="flex items-center justify-center mb-6">
          <Music4 className="w-16 h-16 text-white" />
        </div>
        <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
          Melody Link
        </h1>
        <p className="text-xl text-purple-100 mb-8">
          당신의 노래를 세상과 공유하세요
        </p>
        <Button 
          onClick={handleStart}
          className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-6 text-lg rounded-full shadow-lg transition-all duration-300 hover:scale-105"
        >
          시작하기
        </Button>
      </div>
    </div>
  );
};

export default Cover;
