import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Play,
  Calendar,
  Music,
  Heart,
  MessageCircle,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";

// 로컬 스토리지 키
const RECORDINGS_STORAGE_KEY = "melodylink_recordings";
const COMMENTS_STORAGE_KEY = "melodylink_comments";
const LIKES_STORAGE_KEY = "melodylink_likes";

// 녹음 데이터 타입 정의
interface Recording {
  id: string;
  title: string;
  audioUrl: string;
  videoId: string;
  createdAt: string;
  userId: string;
}

interface Comment {
  id: string;
  recordingId: string;
  text: string;
  userId: string;
  createdAt: string;
}

const Popular = () => {
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [likes, setLikes] = useState<Record<string, string[]>>({});

  // 데이터 로드
  useEffect(() => {
    loadRecordings();
    loadComments();
    loadLikes();
  }, []);

  // 녹음 데이터 로드
  const loadRecordings = () => {
    try {
      const savedRecordings = localStorage.getItem(RECORDINGS_STORAGE_KEY);
      if (savedRecordings) {
        setRecordings(JSON.parse(savedRecordings));
      }
    } catch (error) {
      console.error("Error loading recordings:", error);
    }
  };

  // 댓글 데이터 로드
  const loadComments = () => {
    try {
      const savedComments = localStorage.getItem(COMMENTS_STORAGE_KEY);
      if (savedComments) {
        setComments(JSON.parse(savedComments));
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  // 좋아요 데이터 로드
  const loadLikes = () => {
    try {
      const savedLikes = localStorage.getItem(LIKES_STORAGE_KEY);
      if (savedLikes) {
        setLikes(JSON.parse(savedLikes));
      }
    } catch (error) {
      console.error("Error loading likes:", error);
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // 좋아요 수를 기준으로 정렬된 녹음 목록
  const sortedRecordings = [...recordings].sort((a, b) => {
    const likesA = likes[a.id]?.length || 0;
    const likesB = likes[b.id]?.length || 0;
    return likesB - likesA;
  });

  // 순위 뱃지 스타일
  const getRankBadgeStyle = (index: number) => {
    switch (index) {
      case 0:
        return "bg-yellow-500"; // 금메달
      case 1:
        return "bg-gray-400"; // 은메달
      case 2:
        return "bg-amber-600"; // 동메달
      default:
        return "bg-gray-700"; // 기본
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-4xl font-bold text-white">인기 순위</h1>
          </div>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="border-purple-500/30 hover:border-purple-400 text-purple-400 hover:text-purple-300"
          >
            메인으로
          </Button>
        </div>

        {sortedRecordings.length === 0 ? (
          <div className="text-center py-12">
            <div className="space-y-4">
              <Music className="w-12 h-12 text-purple-400 mx-auto" />
              <p className="text-gray-400">아직 게시된 녹음이 없습니다.</p>
              <Button
                onClick={() => navigate("/")}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                노래 선택하러 가기
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedRecordings.map((recording, index) => (
              <Card key={recording.id} className="bg-gray-800 text-white p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full ${getRankBadgeStyle(
                      index
                    )} text-white font-bold text-xl`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-white">
                        {recording.title}
                      </h2>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-red-500">
                          <Heart className="w-5 h-5 fill-current" />
                          <span className="font-bold">
                            {likes[recording.id]?.length || 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-400">
                          <MessageCircle className="w-5 h-5" />
                          <span>{comments[recording.id]?.length || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(recording.createdAt)}</span>
                    </div>

                    <audio
                      controls
                      src={recording.audioUrl}
                      className="w-full"
                    />

                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        댓글
                      </h3>
                      <div className="space-y-2">
                        {comments[recording.id]?.slice(0, 3).map((comment) => (
                          <div
                            key={comment.id}
                            className="bg-gray-700/50 rounded p-3"
                          >
                            <p className="text-white">{comment.text}</p>
                            <p className="text-sm text-gray-400 mt-1">
                              {formatDate(comment.createdAt)}
                            </p>
                          </div>
                        ))}
                        {(comments[recording.id]?.length || 0) > 3 && (
                          <Button
                            variant="ghost"
                            onClick={() => navigate("/posts")}
                            className="text-purple-400 hover:text-purple-300 w-full"
                          >
                            더 많은 댓글 보기
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Popular;
