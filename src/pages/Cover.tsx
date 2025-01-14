// UI 컴포넌트와 아이콘
import { Button } from "@/components/ui/button";
import { Music4 } from "lucide-react";
// 라우팅을 위한 훅
import { useNavigate } from "react-router-dom";

// 앱의 랜딩/커버 페이지 컴포넌트
const Cover = () => {
  // 페이지 이동을 위한 네비게이션 훅
  const navigate = useNavigate();

  // '시작하기' 버튼 클릭 핸들러
  // 메인 페이지 표시 상태를 localStorage에 저장하고 메인 페이지로 이동
  const handleStart = () => {
    localStorage.setItem('showMain', 'true');
    navigate('/main');
  };

  return (
    // 전체 화면 컨테이너 (그라데이션 배경)
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500">
      {/* 중앙 정렬된 콘텐츠 */}
      <div className="text-center">
        {/* 로고 아이콘 */}
        <div className="flex items-center justify-center mb-6">
          <Music4 className="w-16 h-16 text-white" />
        </div>
        {/* 앱 제목 */}
        <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
          Melody Link
        </h1>
        {/* 앱 설명 */}
        <p className="text-xl text-purple-100 mb-8">
          당신의 노래를 세상과 공유하세요
        </p>
        {/* 시작하기 버튼 */}
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
