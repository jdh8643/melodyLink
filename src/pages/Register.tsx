// React와 라우팅 관련 훅
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// UI 컴포넌트들
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// 토스트 알림을 위한 커스텀 훅
import { useToast } from "@/hooks/use-toast";
// Supabase 클라이언트
import { supabase } from "@/integrations/supabase/client";

// 회원가입 페이지 컴포넌트
const Register = () => {
  // 폼 입력값 상태 관리
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // 페이지 이동을 위한 네비게이션 훅
  const navigate = useNavigate();
  // 토스트 알림 훅
  const { toast } = useToast();

  // 회원가입 폼 제출 핸들러
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    // 비밀번호 확인 검증
    if (password !== confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Supabase 인증 API를 사용하여 회원가입 시도
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      // 회원가입 실패 시 에러 메시지 표시
      if (error) {
        toast({
          title: "회원가입 실패",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // 회원가입 성공 시 로그인 페이지로 이동
      if (data.user) {
        toast({
          title: "회원가입 성공",
          description: "이메일 인증을 완료해주세요!",
        });
        navigate("/login");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "오류 발생",
        description: "회원가입 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    // 전체 페이지를 차지하는 컨테이너
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 p-4">
      {/* 회원가입 카드 컴포넌트 */}
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-white">
            회원가입
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* 회원가입 폼 */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* 이메일 입력 필드 */}
            <div>
              <Input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            {/* 비밀번호 입력 필드 */}
            <div>
              <Input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            {/* 비밀번호 확인 입력 필드 */}
            <div>
              <Input
                type="password"
                placeholder="비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            {/* 회원가입 버튼 */}
            <Button type="submit" className="w-full">
              회원가입
            </Button>
            {/* 로그인 페이지 링크 */}
            <div className="text-center text-gray-400">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="hover:text-white transition-colors"
              >
                이미 계정이 있으신가요? 로그인하기
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
