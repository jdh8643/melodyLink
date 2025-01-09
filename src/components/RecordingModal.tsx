import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Square, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";

interface RecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, audioFile: File) => void;
}

export function RecordingModal({ isOpen, onClose, onSave }: RecordingModalProps) {
  const [title, setTitle] = useState("");
  const { isRecording, audioUrl, startRecording, stopRecording, clearRecording } = useAudioRecorder();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setTitle("");
    clearRecording();
    onClose();
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }

    if (!audioUrl) {
      toast.error("녹음하거나 파일을 선택해주세요.");
      return;
    }

    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const file = new File([blob], `${title}.webm`, { type: "audio/webm" });
      onSave(title, file);
      handleClose();
    } catch (error) {
      console.error("Error saving recording:", error);
      toast.error("저장에 실패했습니다.");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("audio/")) {
        const url = URL.createObjectURL(file);
        clearRecording();
        onSave(title || file.name.replace(/\.[^/.]+$/, ""), file);
        URL.revokeObjectURL(url);
        handleClose();
      } else {
        toast.error("오디오 파일만 업로드할 수 있습니다.");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gradient-to-b from-gray-900 to-gray-800 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">새로운 녹음</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
          />
          <div className="flex justify-center gap-4">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={!!audioUrl}
              >
                <Mic className="mr-2 h-4 w-4" />
                녹음 시작
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <Square className="mr-2 h-4 w-4" />
                녹음 중지
              </Button>
            )}
            <div className="relative">
              <Input
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
                ref={fileInputRef}
                disabled={isRecording}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                disabled={isRecording}
                className="border-gray-700 text-white hover:bg-gray-700"
              >
                <Upload className="mr-2 h-4 w-4" />
                파일 선택
              </Button>
            </div>
          </div>
          {audioUrl && (
            <div className="space-y-4">
              <audio src={audioUrl} controls className="w-full" />
              <Button
                onClick={handleSave}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                저장하기
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
