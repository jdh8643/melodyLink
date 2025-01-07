import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Music4 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Video from "./pages/Video";
import Posts from "./pages/Posts";
import Cover from "./pages/Cover"; // Import Cover component

const queryClient = new QueryClient();

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <>
      <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
        <div className="flex-1 flex items-center gap-4">
          <input
            type="text"
            placeholder="가수 또는 노래 제목을 입력하세요..."
            className="flex-1 bg-gray-800/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <Button className="bg-purple-600 hover:bg-purple-700">검색</Button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/50 backdrop-blur-sm border-t border-gray-800">
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
    </>
  );
};

const NavigationWrapper = () => {
  const location = useLocation();
  const hideNavigation = ['/', '/login', '/register'].includes(location.pathname);
  return !hideNavigation && <Navigation />;
};

const App = () => (
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
        </Routes>
        <NavigationWrapper />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
