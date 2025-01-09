// React와 라우팅 관련 훅
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
// UI 컴포넌트와 아이콘
import { Button } from "@/components/ui/button";
import { useYouTubePlayer, currentUserId } from "../utils/youtube";
import { Mic, Square, Play, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";  // Supabase 클라이언트 임포트

// 로컬 스토리지 키
const RECORDINGS_STORAGE_KEY = "melodylink_recordings";

// 녹음 데이터 타입 정의
interface Recording {
  id: string;
  title: string;
  audioUrl: string;
  videoId: string;
  createdAt: string;
  userId: string;
}

// 비디오 재생 및 녹음 페이지 컴포넌트
const Video = () => {
  // URL 파라미터에서 비디오 ID 추출
  const { videoId } = useParams();
  const navigate = useNavigate();
  // 녹음 관련 상태 관리
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTitle, setRecordingTitle] = useState("");
  // MediaRecorder와 녹음 데이터를 위한 ref
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // YouTube 플레이어 초기화
  useYouTubePlayer(videoId || "");

  // 녹음 시작 함수
  const startRecording = async () => {
    // 이전 녹음 상태 초기화
    setAudioUrl(null);
    setRecordingTime(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    try {
      // 시스템 오디오와 마이크 동시 캡처 시도
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          mandatory: {
            chromeMediaSource: "tab",
          },
        },
      } as any);

      // MediaRecorder 설정
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // 녹음 데이터 수집 이벤트 핸들러
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      // 녹음 종료 시 오디오 URL 생성
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      // 녹음 시작
      mediaRecorder.start();
      setIsRecording(true);

      // 녹음 시간 타이머 시작
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing system audio:", error);
      toast.error(
        "시스템 오디오 접근 권한이 필요합니다. 브라우저 설정에서 '탭 오디오 캡처'를 허용해주세요."
      );

      // 시스템 오디오 캡처 실패 시 마이크 녹음으로 대체
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const mediaRecorder = new MediaRecorder(micStream);
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
        };

        mediaRecorder.start();
        setIsRecording(true);

        timerRef.current = window.setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      } catch (micError) {
        console.error("Error accessing microphone:", micError);
        toast.error("마이크 접근 권한이 필요합니다.");
      }
    }
  };

  // 녹음 중지 함수
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);

      // 녹음 시간 타이머 중지
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // 녹음 데이터를 Supabase에 저장하는 함수
  const saveRecording = async () => {
    if (!audioUrl || !recordingTitle.trim() || !videoId) {
      toast.error("제목을 입력해주세요.");
      return;
    }

    try {
      // Blob를 base64로 변환
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64AudioData = reader.result;
        
        // Supabase에 녹음 데이터 저장
        const { data, error } = await supabase
          .from('recordings')
          .insert([
            {
              title: recordingTitle,
              audio_data: base64AudioData,
              video_id: videoId,
              user_id: currentUserId,
              created_at: new Date().toISOString()
            }
          ]);

        if (error) throw error;

        toast.success("녹음이 저장되었습니다!");
        navigate("/posts"); // 저장 후 게시물 페이지로 이동
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Error saving recording:", error);
      toast.error("녹음 저장에 실패했습니다.");
    }
  };

  // 녹음 시간을 분과 초로 포맷팅하는 함수
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // 컴포넌트가 언마운트될 때 타이머와 오디오 URL을 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          onClick={() => navigate("/")}
          className="mb-4"
          variant="outline"
        >
          뒤로가기
        </Button>

        <div className="aspect-video w-full rounded-lg overflow-hidden bg-black mb-8">
          <div id="youtube-player" className="w-full h-full" />
        </div>

        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">녹음하기</h2>

          <div className="flex items-center gap-4">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                className="bg-red-500 hover:bg-red-600"
              >
                <Mic className="mr-2" />
                녹음 시작
              </Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive">
                <Square className="mr-2" />
                녹음 중지 ({formatTime(recordingTime)})
              </Button>
            )}
          </div>

          {audioUrl && (
            <div className="space-y-4">
              <audio controls src={audioUrl} className="w-full" />
              <div className="flex gap-4">
                <Input
                  placeholder="녹음 제목을 입력하세요"
                  value={recordingTitle}
                  onChange={(e) => setRecordingTitle(e.target.value)}
                  className="flex-1 bg-gray-700 text-white border-gray-600"
                />
                <Button
                  onClick={saveRecording}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Save className="mr-2" />
                  저장하기
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Video;
