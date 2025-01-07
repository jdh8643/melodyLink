import { Card } from "@/components/ui/card";

const Posts = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">녹음 게시물</h1>
        <div className="grid gap-4">
          {/* 게시물 목록은 Supabase 연동 후 구현 예정 */}
          <Card className="bg-gray-800 border-gray-700 p-4">
            <p className="text-gray-400">아직 게시된 녹음이 없습니다.</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Posts;