import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Upload, Square, Play } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface AudioUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AudioUploadModal({ isOpen, onClose, onSuccess }: AudioUploadModalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // 녹음 시작
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setSelectedFile(null);
      };

      mediaRecorder.start();
      setIsRecording(true);

      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("마이크 접근 권한이 필요합니다.");
    }
  };

  // 녹음 중지
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // 파일 선택 처리
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("audio/")) {
        setSelectedFile(file);
        setAudioUrl(URL.createObjectURL(file));
      } else {
        toast.error("오디오 파일만 업로드할 수 있습니다.");
      }
    }
  };

  // Supabase에 저장
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
      // 현재 사용자 정보 가져오기
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("로그인이 필요합니다.");
        return;
      }

      // 오디오 데이터를 Blob으로 변환
      const response = await fetch(audioUrl);
      const blob = await response.blob();

      // Storage에 파일 업로드
      const fileName = `audio/${session.user.id}/${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      // 파일의 공개 URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from('recordings')
        .getPublicUrl(fileName);

      // 데이터베이스에 레코드 저장
      const { data, error } = await supabase
        .from('recordings')
        .insert([
          {
            title,
            audio_url: publicUrl,
            user_id: session.user.id,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      toast.success("업로드가 완료되었습니다!");
      onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error saving recording:", error);
      toast.error("저장에 실패했습니다.");
    }
  };

  // 모달 닫기
  const handleClose = () => {
    setIsRecording(false);
    setRecordingTime(0);
    setAudioUrl(null);
    setTitle("");
    setSelectedFile(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    onClose();
  };

  // 녹음 시간 포맷
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gradient-to-b from-gray-900 to-gray-800 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">새로운 녹음 업로드</DialogTitle>
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
                disabled={!!selectedFile}
                className="bg-purple-600 hover:bg-purple-700 text-white"
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
                녹음 중지 ({formatTime(recordingTime)})
              </Button>
            )}
            <div className="relative">
              <Input
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
                id="audio-file"
                disabled={isRecording || !!audioUrl}
              />
              <Button
                asChild
                variant="outline"
                disabled={isRecording || !!audioUrl}
                className="border-gray-700 text-white hover:bg-gray-700"
              >
                <label htmlFor="audio-file" className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  파일 선택
                </label>
              </Button>
            </div>
          </div>
          {audioUrl && (
            <div className="flex justify-center bg-gray-800 p-4 rounded-lg">
              <audio src={audioUrl} controls className="w-full" />
            </div>
          )}
          <Button 
            onClick={handleSave} 
            disabled={!audioUrl || !title.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            업로드
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
