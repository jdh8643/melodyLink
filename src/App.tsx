// 필요한 UI 컴포넌트들과 라이브러리 임포트
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
// React Query 설정을 위한 임포트
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// 라우팅을 위한 리액트 라우터 컴포넌트들
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
// UI 컴포넌트와 아이콘
import { Button } from "@/components/ui/button";
import { Music4 } from "lucide-react";
// React 훅
import { useEffect, useState } from "react";
// Supabase 클라이언트
import { supabase } from "@/integrations/supabase/client";
// 페이지 컴포넌트들
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Video from "./pages/Video";
import Posts from "./pages/Posts";
import Cover from "./pages/Cover"; // Import Cover component
import Popular from "./pages/Popular"; // 인기 순위 페이지 추가
import Board from "./pages/Board"; // Import Board component


// React Query 클라이언트 인스턴스 생성
const queryClient = new QueryClient();

// 네비게이션 바 컴포넌트
// 로그인 상태에 따라 다른 메뉴를 보여주고, 마우스 호버 시 나타나는 애니메이션 효과 포함
const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // 세션 상태와 네비게이션 바 표시 여부 상태 관리
  const [session, setSession] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // 컴포넌트 마운트 시 세션 체크 및 인증 상태 변경 구독
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 로그아웃 처리 함수
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 h-10 bg-transparent"
        onMouseEnter={() => setIsVisible(true)}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 transform transition-transform duration-300 ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
        onMouseLeave={() => setIsVisible(false)}
      >
        <div className="bg-gray-900/50 backdrop-blur-sm border-t border-gray-800">
          <div className="max-w-6xl mx-auto px-8 py-4">
            <div className="w-full flex justify-between items-center">
              <div className="flex items-center gap-8">
                <Link
                  to="/main"
                  className="flex items-center gap-2 text-white hover:text-purple-400 transition-colors"
                >
                  <Music4 className="w-6 h-6" />
                  <span className="font-bold">Melody Link</span>
                </Link>
                <Link
                  to="/posts"
                  className={`text-white hover:text-purple-400 transition-colors ${
                    location.pathname === "/posts" ? "text-purple-400" : ""
                  }`}
                >
                  게시물
                </Link>
                <Link
                  to="/popular"
                  className={`text-white hover:text-purple-400 transition-colors ${
                    location.pathname === "/popular" ? "text-purple-400" : ""
                  }`}
                >
                  인기 순위
                </Link>
                <Link
                  to="/board"
                  className={`text-white hover:text-purple-400 transition-colors ${
                    location.pathname === "/board" ? "text-purple-400" : ""
                  }`}
                >
                  게시판
                </Link>
              </div>
              <div className="flex items-center gap-4">
                {session ? (
                  <Button
                    variant="outline"
                    className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
                    onClick={handleLogout}
                  >
                    로그아웃
                  </Button>
                ) : (
                  <>
                    <Link to="/login">
                      <Button
                        variant="outline"
                        className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white"
                      >
                        로그인
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                        회원가입
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// 네비게이션 래퍼 컴포넌트
// 현재 경로가 '/'가 아닐 때만 네비게이션 바를 표시
const NavigationWrapper = () => {
  const location = useLocation();
  const hideNavigation = ["/", "/login", "/register"].includes(
    location.pathname
  );
  return !hideNavigation && <Navigation />;
};

// 앱의 메인 컴포넌트
// 전역 상태 관리와 라우팅 설정을 담당
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Cover />} />
            <Route path="/main" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/video/:videoId" element={<Video />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/popular" element={<Popular />} />{" "}
            {/* 새로운 라우트 추가 */}
            <Route path="/board" element={<Board />} />{" "}
            {/* 새로운 라우트 추가 */}
          </Routes>
          <NavigationWrapper />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
