import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface Post {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  user_id: string;
  created_at: string;
}

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: Post) => void;
  editingPost?: Post | null;
}

export function PostModal({ isOpen, onClose, onSave, editingPost }: PostModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title);
      setContent(editingPost.content);
      setImagePreview(editingPost.image_url || "");
    } else {
      setTitle("");
      setContent("");
      setImageFile(null);
      setImagePreview("");
    }
  }, [editingPost]);

  const handleClose = () => {
    setTitle("");
    setContent("");
    setImageFile(null);
    setImagePreview("");
    onClose();
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }

    if (!content.trim()) {
      toast.error("내용을 입력해주세요.");
      return;
    }

    try {
      let image_url = editingPost?.image_url;

      // 이미지 파일이 있으면 업로드
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from("post-images")
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        // 이전 이미지가 있었다면 삭제
        if (editingPost?.image_url) {
          const oldImagePath = editingPost.image_url.split("/").pop();
          if (oldImagePath) {
            await supabase.storage.from("post-images").remove([oldImagePath]);
          }
        }

        // 새 이미지의 공개 URL 가져오기
        const { data: publicUrl } = supabase.storage
          .from("post-images")
          .getPublicUrl(fileName);
        
        image_url = publicUrl.publicUrl;
      } else if (imagePreview === "") {
        // 이미지를 제거한 경우
        if (editingPost?.image_url) {
          const oldImagePath = editingPost.image_url.split("/").pop();
          if (oldImagePath) {
            await supabase.storage.from("post-images").remove([oldImagePath]);
          }
        }
        image_url = undefined;
      }

      const post: Post = {
        id: editingPost?.id || "",
        title: title.trim(),
        content: content.trim(),
        image_url,
        user_id: editingPost?.user_id || "",
        created_at: editingPost?.created_at || new Date().toISOString(),
      };

      onSave(post);
      handleClose();
    } catch (error) {
      console.error("Error handling image:", error);
      toast.error("이미지 처리 중 오류가 발생했습니다.");
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error("이미지 파일만 업로드할 수 있습니다.");
      }
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gradient-to-b from-gray-900 to-gray-800 text-white border-gray-700 max-w-2xl" aria-describedby="post-modal-description">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            {editingPost ? "게시글 수정" : "새 게시글 작성"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4" id="post-modal-description">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">제목</label>
            <Input
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">내용</label>
            <textarea
              placeholder="내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full bg-gray-800 border-gray-700 text-white rounded-md p-2 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">이미지</label>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                ref={fileInputRef}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="border-gray-700 text-white hover:bg-gray-700"
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                이미지 선택
              </Button>
              {imagePreview && (
                <Button
                  variant="ghost"
                  onClick={handleRemoveImage}
                  className="text-red-400 hover:text-red-300"
                >
                  이미지 제거
                </Button>
              )}
            </div>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="미리보기"
                className="mt-4 rounded-lg max-h-48 object-cover"
              />
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="ghost"
              onClick={handleClose}
              className="text-gray-400 hover:text-white"
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {editingPost ? "수정하기" : "작성하기"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
