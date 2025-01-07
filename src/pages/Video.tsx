import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useYouTubePlayer } from '../utils/youtube';
import { Mic, Square, Play, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Video = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  
  useYouTubePlayer(videoId || '');

  const startRecording = async () => {
    // Reset previous recording state
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
            chromeMediaSource: 'tab',
          },
        },
      } as any);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing system audio:', error);
      toast.error("시스템 오디오 접근 권한이 필요합니다. 브라우저 설정에서 '탭 오디오 캡처'를 허용해주세요.");
      
      // 실패 시 기존 마이크 녹음으로 폴백
      try {
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(micStream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
        };

        mediaRecorder.start();
        setIsRecording(true);
        
        timerRef.current = window.setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);

      } catch (micError) {
        console.error('Error accessing microphone:', micError);
        toast.error("마이크 접근 권한이 필요합니다.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup
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
          onClick={() => navigate('/')}
          className="mb-4"
          variant="outline"
        >
          뒤로가기
        </Button>
        
        <div className="aspect-video w-full rounded-lg overflow-hidden bg-black mb-8">
          <div id="youtube-player" className="w-full h-full" />
        </div>

        {/* Recording Section */}
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
              <Button
                onClick={stopRecording}
                variant="destructive"
              >
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
                  className="flex-1 text-black"
                />
                <Button>
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