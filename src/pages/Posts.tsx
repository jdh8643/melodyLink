// React 훅
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// UI 컴포넌트 임포트
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Play,
  Calendar,
  Music,
  Heart,
  MessageCircle,
  Edit2,
  Trash2,
  MoreVertical,
  Mic,
} from "lucide-react";
import { toast } from "sonner";
import { RecordingModal } from "@/components/RecordingModal";

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

const Posts = () => {
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [likes, setLikes] = useState<Record<string, string[]>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);

  // 현재 사용자 ID (임시)
  const currentUserId = "user1"; // 실제 인증 구현 시 변경

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

  // 녹음 삭제
  const deleteRecording = (id: string) => {
    if (window.confirm("정말로 이 녹음을 삭제하시겠습니까?")) {
      const updatedRecordings = recordings.filter((rec) => rec.id !== id);
      localStorage.setItem(
        RECORDINGS_STORAGE_KEY,
        JSON.stringify(updatedRecordings)
      );
      setRecordings(updatedRecordings);
      toast.success("녹음이 삭제되었습니다.");
    }
  };

  // 녹음 제목 수정
  const updateRecordingTitle = (id: string) => {
    const updatedRecordings = recordings.map((rec) =>
      rec.id === id ? { ...rec, title: editTitle } : rec
    );
    localStorage.setItem(
      RECORDINGS_STORAGE_KEY,
      JSON.stringify(updatedRecordings)
    );
    setRecordings(updatedRecordings);
    setEditingId(null);
    toast.success("제목이 수정되었습니다.");
  };

  // 댓글 추가
  const addComment = (recordingId: string) => {
    const commentText = newComments[recordingId];
    if (!commentText?.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      recordingId,
      text: commentText,
      userId: currentUserId,
      createdAt: new Date().toISOString(),
    };

    const updatedComments = {
      ...comments,
      [recordingId]: [...(comments[recordingId] || []), newComment],
    };

    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(updatedComments));
    setComments(updatedComments);
    setNewComments((prev) => ({ ...prev, [recordingId]: "" }));
    toast.success("댓글이 추가되었습니다.");
  };

  // 댓글 수정
  const updateComment = (recordingId: string, commentId: string) => {
    if (!editCommentText.trim()) return;

    const updatedComments = {
      ...comments,
      [recordingId]: comments[recordingId].map((comment) =>
        comment.id === commentId
          ? { ...comment, text: editCommentText.trim() }
          : comment
      ),
    };

    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(updatedComments));
    setComments(updatedComments);
    setEditingCommentId(null);
    setEditCommentText("");
    toast.success("댓글이 수정되었습니다.");
  };

  // 댓글 삭제
  const deleteComment = (recordingId: string, commentId: string) => {
    if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
      const updatedComments = {
        ...comments,
        [recordingId]: comments[recordingId].filter(
          (comment) => comment.id !== commentId
        ),
      };
      localStorage.setItem(
        COMMENTS_STORAGE_KEY,
        JSON.stringify(updatedComments)
      );
      setComments(updatedComments);
      toast.success("댓글이 삭제되었습니다.");
    }
  };

  // 좋아요 토글
  const toggleLike = (recordingId: string) => {
    const recordingLikes = likes[recordingId] || [];
    const userLiked = recordingLikes.includes(currentUserId);

    const updatedLikes = {
      ...likes,
      [recordingId]: userLiked
        ? recordingLikes.filter((id) => id !== currentUserId)
        : [...recordingLikes, currentUserId],
    };

    localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(updatedLikes));
    setLikes(updatedLikes);
  };

  // 새 녹음 저장
  const handleSaveRecording = (title: string, audioFile: File) => {
    const newRecording: Recording = {
      id: Date.now().toString(),
      title,
      audioUrl: URL.createObjectURL(audioFile),
      videoId: "", // 녹음에는 비디오 ID가 없음
      createdAt: new Date().toISOString(),
      userId: currentUserId,
    };

    const updatedRecordings = [newRecording, ...recordings];
    localStorage.setItem(
      RECORDINGS_STORAGE_KEY,
      JSON.stringify(updatedRecordings)
    );
    setRecordings(updatedRecordings);
    toast.success("녹음이 저장되었습니다.");
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">녹음 게시물</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsRecordingModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Mic className="w-4 h-4 mr-2" />새 녹음
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="border-purple-500/30 hover:border-purple-400 text-purple-400 hover:text-purple-300"
            >
              메인으로
            </Button>
          </div>
        </div>

        <RecordingModal
          isOpen={isRecordingModalOpen}
          onClose={() => setIsRecordingModalOpen(false)}
          onSave={handleSaveRecording}
        />

        {recordings.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="text-center space-y-4">
              <Music className="w-12 h-12 text-purple-400 mx-auto" />
              <p className="text-gray-400">아직 게시된 녹음이 없습니다.</p>
              <Button
                onClick={() => navigate("/")}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                노래 선택하러 가기
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {recordings.map((recording) => (
              <Card
                key={recording.id}
                className="bg-gray-800/50 border-purple-500/30 hover:border-purple-400 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-grow">
                    {editingId === recording.id ? (
                      <div className="flex gap-2">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="bg-gray-700 text-white border-gray-600"
                        />
                        <Button
                          onClick={() => updateRecordingTitle(recording.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          저장
                        </Button>
                        <Button
                          onClick={() => setEditingId(null)}
                          variant="outline"
                          className="text-white"
                        >
                          취소
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white">
                          {recording.title}
                        </h2>
                        {recording.userId === currentUserId && (
                          <div className="flex gap-2 ml-4">
                            <Button
                              onClick={() => {
                                setEditingId(recording.id);
                                setEditTitle(recording.title);
                              }}
                              variant="ghost"
                              className="h-8 w-8 p-0 text-purple-400 hover:text-purple-300"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => deleteRecording(recording.id)}
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(recording.createdAt)}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate(`/video/${recording.videoId}`)}
                    className="bg-purple-600 hover:bg-purple-700 text-white ml-4"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    원곡 듣기
                  </Button>
                </div>

                <div className="mt-4">
                  <audio controls src={recording.audioUrl} className="w-full" />
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <Button
                    onClick={() => toggleLike(recording.id)}
                    variant="ghost"
                    className={`gap-2 ${
                      likes[recording.id]?.includes(currentUserId)
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    <Heart className="w-4 h-4" />
                    {likes[recording.id]?.length || 0}
                  </Button>
                  <div className="flex-grow">
                    <div className="flex gap-2">
                      <Input
                        placeholder="댓글을 입력하세요..."
                        value={newComments[recording.id] || ""}
                        onChange={(e) =>
                          setNewComments((prev) => ({
                            ...prev,
                            [recording.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            addComment(recording.id);
                          }
                        }}
                        className="bg-gray-700 text-white border-gray-600"
                      />
                      <Button
                        onClick={() => addComment(recording.id)}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        댓글 작성
                      </Button>
                    </div>
                    <div className="mt-4 space-y-2">
                      {comments[recording.id]?.map((comment) => (
                        <div
                          key={comment.id}
                          className="bg-gray-700/50 rounded-lg p-3"
                        >
                          {editingCommentId === comment.id ? (
                            <div className="flex gap-2">
                              <Input
                                value={editCommentText}
                                onChange={(e) =>
                                  setEditCommentText(e.target.value)
                                }
                                className="flex-1 bg-gray-600 text-white"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    updateComment(recording.id, comment.id);
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateComment(recording.id, comment.id)
                                }
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                저장
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditCommentText("");
                                }}
                                className="text-gray-400 hover:text-white"
                              >
                                취소
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-white">{comment.text}</p>
                                <p className="text-sm text-gray-400 mt-1">
                                  {formatDate(comment.createdAt)}
                                </p>
                              </div>
                              {comment.userId === currentUserId && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setEditingCommentId(comment.id);
                                      setEditCommentText(comment.text);
                                    }}
                                    className="text-blue-400 hover:text-blue-300"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      deleteComment(recording.id, comment.id)
                                    }
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
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

export default Posts;
