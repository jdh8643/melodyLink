import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Heart,
  ThumbsDown,
  MessageCircle,
  Edit2,
  Trash2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { PostModal } from "@/components/PostModal";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/hooks/useSession";

// 게시글 타입 정의
interface Post {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  audio_url?: string;
  user_id: string;
  created_at: string;
}

interface Comment {
  id: string;
  postid: string;
  content: string;
  userid: string;
  createdat: string;
}

interface Like {
  post_id: string;
  user_id: string;
  is_dislike: boolean;
}

const Board = () => {
  const navigate = useNavigate();
  const { session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [likes, setLikes] = useState<Record<string, string[]>>({});
  const [dislikes, setDislikes] = useState<Record<string, string[]>>({});
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // 데이터 로드
  useEffect(() => {
    loadPosts();
  }, []);

  // 게시글 로드
  const loadPosts = async () => {
    try {
      // 게시글 로드
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;
      setPosts(postsData || []);

      // 댓글 로드
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("*")
        .order("created_at", { ascending: true });

      if (commentsError) throw commentsError;

      // 댓글을 게시글 ID별로 그룹화
      const groupedComments: Record<string, Comment[]> = {};
      commentsData?.forEach((comment) => {
        if (!groupedComments[comment.postid]) {
          groupedComments[comment.postid] = [];
        }
        groupedComments[comment.postid].push(comment);
      });
      setComments(groupedComments);

      // 좋아요/싫어요 로드
      const { data: likesData, error: likesError } = await supabase
        .from("likes")
        .select("*");

      if (likesError) throw likesError;

      // 좋아요/싫어요 데이터 그룹화
      const groupedLikes: Record<string, string[]> = {};
      const groupedDislikes: Record<string, string[]> = {};

      likesData?.forEach((like) => {
        if (like.is_dislike) {
          if (!groupedDislikes[like.post_id]) {
            groupedDislikes[like.post_id] = [];
          }
          groupedDislikes[like.post_id].push(like.user_id);
        } else {
          if (!groupedLikes[like.post_id]) {
            groupedLikes[like.post_id] = [];
          }
          groupedLikes[like.post_id].push(like.user_id);
        }
      });

      setLikes(groupedLikes);
      setDislikes(groupedDislikes);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("데이터를 불러오는데 실패했습니다.");
    }
  };

  // 게시글 삭제
  const deletePost = async (id: string) => {
    if (window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      try {
        const { error } = await supabase.from("posts").delete().eq("id", id);

        if (error) throw error;

        // 이미지가 있다면 스토리지에서도 삭제
        const post = posts.find((p) => p.id === id);
        if (post?.image_url) {
          const imagePath = post.image_url.split("/").pop();
          if (imagePath) {
            await supabase.storage.from("post-images").remove([imagePath]);
          }
        }

        await loadPosts(); // 데이터 새로고침
        toast.success("게시글이 삭제되었습니다.");
      } catch (error) {
        console.error("Error deleting post:", error);
        toast.error("게시글 삭제에 실패했습니다.");
      }
    }
  };

  // 게시글 수정 모달 열기
  const openEditModal = (post: Post) => {
    setEditingPost(post);
    setIsPostModalOpen(true);
  };

  // 댓글 추가
  const addComment = async (postId: string) => {
    const commentText = newComments[postId];
    if (!commentText?.trim()) return;

    // 세션 체크
    if (!session?.user?.id) {
      console.log('Current session:', session);
      toast.error("로그인이 필요합니다.");
      return;
    }

    try {
      // 현재 시간을 ISO 문자열로 변환
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            postid: postId,
            content: commentText.trim(),
            userid: session.user.id,
            createdat: now,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Successfully added comment:', data);

      // UI 업데이트
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data],
      }));
      setNewComments((prev) => ({ ...prev, [postId]: "" }));
      toast.success("댓글이 추가되었습니다.");
    } catch (error) {
      console.error("Error adding comment:", error);
      if (error instanceof Error) {
        toast.error(`댓글 추가 실패: ${error.message}`);
      } else {
        toast.error("댓글 추가에 실패했습니다.");
      }
    }
  };

  // 댓글 수정
  const updateComment = async (postId: string, commentId: string) => {
    if (!editCommentText.trim()) return;

    try {
      const { error } = await supabase
        .from("comments")
        .update({ content: editCommentText.trim() })
        .eq("id", commentId);

      if (error) throw error;

      await loadPosts(); // 데이터 새로고침
      setEditingCommentId(null);
      setEditCommentText("");
      toast.success("댓글이 수정되었습니다.");
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("댓글 수정에 실패했습니다.");
    }
  };

  // 댓글 삭제
  const deleteComment = async (postId: string, commentId: string) => {
    if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
      try {
        const { error } = await supabase
          .from("comments")
          .delete()
          .eq("id", commentId);

        if (error) throw error;

        await loadPosts(); // 데이터 새로고침
        toast.success("댓글이 삭제되었습니다.");
      } catch (error) {
        console.error("Error deleting comment:", error);
        toast.error("댓글 삭제에 실패했습니다.");
      }
    }
  };

  // 좋아요/싫어요 토글
  const toggleReaction = async (postId: string, isDislike: boolean) => {
    try {
      const existingLike = await supabase
        .from("likes")
        .select("*")
        .eq("post_id", postId)
        .single();

      if (existingLike.data) {
        if (existingLike.data.is_dislike === isDislike) {
          // 같은 반응이면 제거
          await supabase.from("likes").delete().eq("post_id", postId);
        } else {
          // 다른 반응이면 업데이트
          await supabase
            .from("likes")
            .update({ is_dislike: isDislike })
            .eq("post_id", postId);
        }
      } else {
        // 새로운 반응 추가
        await supabase.from("likes").insert([
          {
            post_id: postId,
            is_dislike: isDislike,
          },
        ]);
      }

      await loadPosts(); // 데이터 새로고침
    } catch (error) {
      console.error("Error toggling reaction:", error);
      toast.error("작업에 실패했습니다.");
    }
  };

  // 날짜 포맷팅
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

  // 게시글 저장 핸들러
  const handleSavePost = async (post: Post, audioFile?: File) => {
    try {
      if (editingPost) {
        // 수정
        const { error } = await supabase
          .from("posts")
          .update({
            title: post.title,
            content: post.content,
            image_url: post.image_url,
            audio_url: post.audio_url,
          })
          .eq("id", editingPost.id);

        if (error) throw error;

        // UI 즉시 업데이트
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p.id === editingPost.id
              ? {
                  ...p,
                  title: post.title,
                  content: post.content,
                  image_url: post.image_url,
                  audio_url: post.audio_url,
                }
              : p
          )
        );

        setIsPostModalOpen(false);
        setEditingPost(null);
        toast.success("게시글이 수정되었습니다.");
      } else {
        // 새 게시글
        if (audioFile) {
          // 오디오 파일을 스토리지에 업로드
          const audioFileName = `${Date.now()}-${audioFile.name}`;
          const { data: audioData, error: audioError } = await supabase.storage
            .from("audio-files")
            .upload(audioFileName, audioFile, {
              cacheControl: "3600",
              upsert: false,
              contentType: audioFile.type, // 파일의 실제 MIME 타입 사용
            });

          if (audioError) throw audioError;

          // 오디오 파일의 공개 URL 가져오기
          const { data: audioUrl } = supabase.storage
            .from("audio-files")
            .getPublicUrl(audioFileName, {
              download: false, // 스트리밍을 위해 download 옵션을 false로 설정
            });

          // 게시글 데이터베이스에 저장
          const { error } = await supabase.from("posts").insert([
            {
              title: post.title,
              content: post.content,
              audio_url: audioUrl.publicUrl,
            },
          ]);

          if (error) throw error;
        } else {
          const { data, error } = await supabase.from("posts").insert([
            {
              title: post.title,
              content: post.content,
            },
          ]);

          if (error) throw error;
        }

        await loadPosts(); // 데이터 새로고침
        setEditingPost(null);
        setIsPostModalOpen(false);
        toast.success("게시글이 저장되었습니다.");
      }
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error("게시글 저장에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">게시판</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsPostModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />새 글쓰기
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

        <PostModal
          isOpen={isPostModalOpen}
          onClose={() => {
            setIsPostModalOpen(false);
            setEditingPost(null);
          }}
          onSave={handleSavePost}
          editingPost={editingPost}
        />

        {posts.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="text-center space-y-4">
              <MessageCircle className="w-12 h-12 text-purple-400 mx-auto" />
              <p className="text-gray-400">아직 게시글이 없습니다.</p>
              <Button
                onClick={() => setIsPostModalOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                첫 게시글 작성하기
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="bg-gray-800/50 border-purple-500/30 hover:border-purple-400 p-6"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        {post.title}
                      </h2>
                      <p className="text-sm text-gray-400 mt-1">
                        {formatDate(post.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => openEditModal(post)}
                        variant="ghost"
                        className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => deletePost(post.id)}
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-gray-300 whitespace-pre-wrap">
                    {post.content}
                  </p>

                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt="게시글 이미지"
                      className="rounded-lg max-h-96 object-cover mt-4"
                    />
                  )}
                  {post.audio_url && (
                    <div className="mt-4">
                      <audio controls className="w-full">
                        <source src={post.audio_url} type="audio/webm" />
                        <source src={post.audio_url} type="audio/mpeg" />
                        <source src={post.audio_url} type="audio/wav" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-4">
                    <Button
                      onClick={() => toggleReaction(post.id, false)}
                      variant="ghost"
                      className={`gap-2 ${
                        likes[post.id]?.length || 0 > 0
                          ? "text-red-500"
                          : "text-gray-400"
                      }`}
                    >
                      <Heart className="w-4 h-4" />
                      {likes[post.id]?.length || 0}
                    </Button>
                    <Button
                      onClick={() => toggleReaction(post.id, true)}
                      variant="ghost"
                      className={`gap-2 ${
                        dislikes[post.id]?.length || 0 > 0
                          ? "text-blue-500"
                          : "text-gray-400"
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      {dislikes[post.id]?.length || 0}
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-gray-700">
                    <h3 className="font-semibold text-white mb-4">댓글</h3>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <input
                          placeholder="댓글을 입력하세요..."
                          value={newComments[post.id] || ""}
                          onChange={(e) =>
                            setNewComments((prev) => ({
                              ...prev,
                              [post.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              addComment(post.id);
                            }
                          }}
                          className="flex-1 bg-gray-700 border-gray-600 rounded-md p-2 text-white"
                        />
                        <Button
                          onClick={() => addComment(post.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          댓글 작성
                        </Button>
                      </div>

                      {comments[post.id]?.map((comment) => (
                        <div
                          key={comment.id}
                          className="bg-gray-700/50 rounded-lg p-3"
                        >
                          {editingCommentId === comment.id ? (
                            <div className="flex gap-2">
                              <input
                                value={editCommentText}
                                onChange={(e) =>
                                  setEditCommentText(e.target.value)
                                }
                                className="flex-1 bg-gray-600 text-white rounded-md p-2"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    updateComment(post.id, comment.id);
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateComment(post.id, comment.id)
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
                                <p className="text-white">{comment.content}</p>
                                <p className="text-sm text-gray-400 mt-1">
                                  {formatDate(comment.createdat)}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingCommentId(comment.id);
                                    setEditCommentText(comment.content);
                                  }}
                                  className="text-blue-400 hover:text-blue-300"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    deleteComment(post.id, comment.id)
                                  }
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
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

export default Board;
