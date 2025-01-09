// React 훅
import { useState, useEffect } from "react";

// YouTube 비디오 정보를 위한 타입 정의
export interface YouTubeVideo {
  id: string; // YouTube 비디오 고유 ID
  title: string; // 비디오 제목
  thumbnail: string; // 썸네일 이미지 URL
  songNumber?: string; // 노래 번호 (선택적)
  artist?: string; // 아티스트 이름 (선택적)
  composer?: string; // 작곡가 (선택적)
  lyricist?: string; // 작사가 (선택적)
  channelTitle?: string; // 또는 선택적으로 만들기
}

// 현재 사용자 ID (임시)
export const currentUserId = "user1"; // 실제 인증 구현 시 변경

// YouTube Data API 키
// 주의: 실제 프로덕션 환경에서는 환경 변수로 관리해야 함
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || "AIzaSyCI9QQU8N-4_PrPDnWLxiaIgFPGQrzd5LM";

if (!YOUTUBE_API_KEY) {
  console.error("YouTube API 키가 설정되지 않았습니다.");
}

/**
 * YouTube API를 사용하여 비디오를 검색하는 함수
 * @param query - 검색어
 * @returns 검색된 비디오 목록
 */
export const searchVideos = async (query: string): Promise<YouTubeVideo[]> => {
  try {
    // YouTube Data API v3를 사용하여 비디오 검색
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(
        `MR ${query}`
      )}&type=video&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error("YouTube API request failed");
    }

    const data = await response.json();

    // API 응답을 YouTubeVideo 형식으로 변환
    return data.items.map((item: any) => {
      const title = item.snippet.title;
      // 제목에서 노래 번호 추출 (있는 경우)
      const songNumberMatch = title.match(/(\d{5})/);
      const songNumber = songNumberMatch ? songNumberMatch[1] : "";

      return {
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        songNumber,
        artist: item.snippet.channelTitle,
      };
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return [];
  }
};

/**
 * 장르별 인기 뮤직비디오를 가져오는 함수
 * @param genre - 장르 (kpop, hiphop, indie 등)
 * @returns 인기 뮤직비디오 목록
 */
export const fetchGenreVideos = async (genre: string): Promise<YouTubeVideo[]> => {
  try {
    const searchTerms: { [key: string]: string } = {
      kpop: "최신 케이팝 뮤직비디오",
      hiphop: "한국 힙합 뮤직비디오",
      indie: "한국 인디음악 뮤직비디오"
    };

    const searchTerm = searchTerms[genre] || genre;
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=6&q=${encodeURIComponent(
        searchTerm
      )}&type=video&videoCategoryId=10&regionCode=KR&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error('YouTube API 요청 실패');
    }

    const data = await response.json();
    
    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
    }));
  } catch (error) {
    console.error(`장르 ${genre} 비디오 가져오기 실패:`, error);
    return [];
  }
};

/**
 * YouTube 플레이어를 관리하는 커스텀 훅
 * @param videoId - 재생할 비디오 ID
 * @returns player 객체
 */
export const useYouTubePlayer = (videoId: string) => {
  const [player, setPlayer] = useState<any>(null);

  useEffect(() => {
    const cleanupPlayer = () => {
      if (player) {
        try {
          player.destroy();
        } catch (error) {
          console.error("Error destroying player:", error);
        }
      }
    };

    if (!videoId) {
      cleanupPlayer();
      return;
    }

    const loadVideo = () => {
      try {
        cleanupPlayer();

        const newPlayer = new (window as any).YT.Player("youtube-player", {
          height: "360",
          width: "640",
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            enablejsapi: 1,
            origin: window.location.origin,
            host: "https://www.youtube.com",
            widget_referrer: window.location.origin,
            playsinline: 1,
          },
          events: {
            onReady: (event: any) => {
              console.log("Player ready:", event);
              event.target.playVideo();
            },
            onError: (error: any) => {
              console.error("YouTube Player Error:", error);
              console.log("Error details:", {
                videoId,
                error: error.data,
                playerState: error.target.getPlayerState(),
                url: error.target.getVideoUrl(),
              });
            },
            onStateChange: (event: any) => {
              console.log("Player state changed:", event.data);
            },
          },
        });

        setPlayer(newPlayer);
      } catch (error) {
        console.error("Error initializing player:", error);
      }
    };

    if ((window as any).YT && (window as any).YT.Player) {
      loadVideo();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = loadVideo;
    }

    return cleanupPlayer;
  }, [videoId]);

  return player;
};

export const fetchPopularMusicVideos = async (
  category: string,
  maxResults: number
) => {
  // YouTube API 호출 로직
  // ...
};
