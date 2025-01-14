// React와 라우팅 관련 훅
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// YouTube 관련 유틸리티와 타입
import {
  searchVideos,
  fetchGenreVideos,
  type YouTubeVideo,
} from "../utils/youtube";
// UI 컴포넌트들
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
// 아이콘
import { Music4, ChartBar } from "lucide-react";
// 이미지 처리 유틸리티
import { getPlaceholderImage } from "../utils/imageHandling";

// 메인 페이지 컴포넌트
const Index = () => {
  // 검색어 상태 관리
  const [searchQuery, setSearchQuery] = useState("");
  // 검색 결과 상태 관리
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  // 장르별 비디오 상태 관리
  const [genreVideos, setGenreVideos] = useState<
    Record<string, YouTubeVideo[]>
  >({
    kpop: [],
    hiphop: [],
    indie: [],
  });
  // 페이지 이동 함수
  const navigate = useNavigate();

  // 컴포넌트 마운트 시 장르별 비디오 로드
  useEffect(() => {
    const loadGenreVideos = async () => {
      const genres = ["kpop", "hiphop", "indie"];
      const genreData: Record<string, YouTubeVideo[]> = {};

      for (const genre of genres) {
        const videos = await fetchGenreVideos(genre);
        genreData[genre] = videos;
      }

      setGenreVideos(genreData);
    };

    loadGenreVideos();
  }, []);

  // 검색 핸들러
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        const results = await searchVideos(searchQuery);
        setVideos(results);
      } catch (error) {
        console.error("검색 오류:", error);
        setVideos([]);
      }
    }
  };

  // 엔터 키 입력 시 검색 핸들러 호출
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 장르별 섹션 렌더링
  const GenreSection = ({
    title,
    videos,
    genre,
  }: {
    title: string;
    videos: YouTubeVideo[];
    genre: string;
  }) => (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <ChartBar className="w-5 h-5 text-purple-400" />
        <h2 className="text-xl font-semibold text-white">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <Card
            key={video.id}
            className="bg-gray-800/50 border-purple-500/30 hover:border-purple-400 transition-colors cursor-pointer"
            onClick={() => navigate(`/video/${video.id}`)}
          >
            <div className="flex items-start p-4 gap-4">
              <div className="w-24 flex-shrink-0">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full aspect-video object-cover rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getPlaceholderImage(genre);
                  }}
                />
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-white line-clamp-2">
                  {video.title}
                </h3>
                {video.channelTitle && (
                  <p className="text-purple-300 text-sm mt-1">
                    {video.channelTitle}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-purple-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Music4 className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Melody Link
            </h1>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <Input
            type="text"
            placeholder="가수 또는 노래 제목을 입력하세요..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-gray-800/50 border-purple-500/30 focus:border-purple-400"
          />
          <Button
            onClick={handleSearch}
            className="bg-purple-600 hover:bg-purple-700"
          >
            검색
          </Button>
        </div>

        {videos.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">검색 결과</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <Card
                  key={video.id}
                  className="bg-gray-800/50 border-purple-500/30 hover:border-purple-400 transition-colors cursor-pointer"
                  onClick={() => navigate(`/video/${video.id}`)}
                >
                  <div className="flex items-start p-4 gap-4">
                    <div className="w-24 flex-shrink-0">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full aspect-video object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getPlaceholderImage("kpop");
                        }}
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-white line-clamp-2">
                        {video.title}
                      </h3>
                      {video.channelTitle && (
                        <p className="text-purple-300 text-sm mt-1">
                          {video.channelTitle}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <>
            <GenreSection
              title="K-POP"
              videos={genreVideos.kpop}
              genre="kpop"
            />
            <GenreSection
              title="Hip Hop"
              videos={genreVideos.hiphop}
              genre="hiphop"
            />
            <GenreSection
              title="Indie"
              videos={genreVideos.indie}
              genre="indie"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
