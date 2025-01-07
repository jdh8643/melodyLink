import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchVideos, type YouTubeVideo } from "../utils/youtube";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Music4, ChartBar } from "lucide-react";
import { getPlaceholderImage } from "../utils/imageHandling";

// 인기 뮤직비디오 데이터
const popularSongs = {
  kpop: [
    {
      id: "D8VEhcPeSlw",
      title: "SEVENTEEN (세븐틴) - F*ck My Life",
      artist: "SEVENTEEN",
      songNumber: "MV-001",
      thumbnail: "https://i.ytimg.com/vi/D8VEhcPeSlw/maxresdefault.jpg",
    },
    {
      id: "UBURTj20HXI",
      title: "Red Velvet - Chill Kill",
      artist: "Red Velvet",
      songNumber: "MV-002",
      thumbnail: "https://i.ytimg.com/vi/UBURTj20HXI/maxresdefault.jpg",
    },
  ],
  hiphop: [
    {
      id: "5jXrUNTqrwY",
      title: "Agust D - People Pt.2 (feat. IU)",
      artist: "Agust D, IU",
      songNumber: "MV-003",
      thumbnail: "https://i.ytimg.com/vi/5jXrUNTqrwY/maxresdefault.jpg",
    },
    {
      id: "ArmDp-zijuc",
      title: "염따 - Mint Chocolate (feat. 박재범)",
      artist: "염따, 박재범",
      songNumber: "MV-004",
      thumbnail: "https://i.ytimg.com/vi/ArmDp-zijuc/maxresdefault.jpg",
    },
  ],
  indie: [
    {
      id: "pC6tPEaAiYU",
      title: "아이유(IU) - Love wins all",
      artist: "IU",
      songNumber: "MV-005",
      thumbnail: "https://i.ytimg.com/vi/pC6tPEaAiYU/maxresdefault.jpg",
    },
    {
      id: "6H1e8I1kMEU",
      title: "10CM - 부동의 첫사랑",
      artist: "10CM",
      songNumber: "MV-006",
      thumbnail: "https://i.ytimg.com/vi/6H1e8I1kMEU/maxresdefault.jpg",
    },
  ],
};

const GenreSection = ({
  title,
  songs,
  navigate,
  genre,
}: {
  title: string;
  songs: YouTubeVideo[];
  navigate: (path: string) => void;
  genre: string;
}) => {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const handleImageError = (songId: string) => {
    setFailedImages((prev) => ({ ...prev, [songId]: true }));
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <ChartBar className="w-5 h-5 text-purple-400" />
        <h2 className="text-xl font-semibold text-white">{title}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {songs.map((song) => (
          <Card
            key={song.id}
            className="bg-gray-800/50 border-purple-500/30 hover:border-purple-400 transition-colors cursor-pointer"
            onClick={() => navigate(`/video/${song.id}`)}
          >
            <div className="flex items-start p-4 gap-4">
              <div className="w-24 flex-shrink-0">
                <img
                  src={
                    failedImages[song.id]
                      ? getPlaceholderImage(genre)
                      : song.thumbnail
                  }
                  alt={song.title}
                  className="w-full aspect-video object-cover rounded-lg"
                  onError={() => handleImageError(song.id)}
                />
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  {song.songNumber && (
                    <span className="bg-purple-600/80 px-2 py-1 rounded text-sm">
                      {song.songNumber}
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-white">
                    {song.title}
                  </h3>
                </div>
                {song.artist && (
                  <p className="text-purple-300 text-sm">
                    아티스트: {song.artist}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const results = await searchVideos(searchQuery);
      setVideos(results);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

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
            onKeyPress={handleKeyPress}
            className="flex-1 bg-gray-800/50 border-purple-500/30 focus:border-purple-400"
          />
          <Button
            onClick={handleSearch}
            className="bg-purple-600 hover:bg-purple-700"
          >
            검색
          </Button>
        </div>

        {searchQuery ? (
          <div className="grid grid-cols-1 gap-4">
            {videos.map((video) => (
              <Card
                key={video.id}
                className="bg-gray-800/50 border-purple-500/30 hover:border-purple-400 transition-colors cursor-pointer"
                onClick={() => navigate(`/video/${video.id}`)}
              >
                <div className="flex items-start p-4 gap-4">
                  <div className="w-48 flex-shrink-0">
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
                    <div className="flex items-center gap-2 mb-2">
                      {video.songNumber && (
                        <span className="bg-purple-600/80 px-2 py-1 rounded text-sm">
                          {video.songNumber}
                        </span>
                      )}
                      <h3 className="text-lg font-semibold text-white">
                        {video.title}
                      </h3>
                    </div>
                    {video.artist && (
                      <p className="text-purple-300 text-sm">
                        아티스트: {video.artist}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <GenreSection
              title="K-POP 인기차트"
              songs={popularSongs.kpop}
              navigate={navigate}
              genre="kpop"
            />
            <GenreSection
              title="힙합 인기차트"
              songs={popularSongs.hiphop}
              navigate={navigate}
              genre="hiphop"
            />
            <GenreSection
              title="인디 인기차트"
              songs={popularSongs.indie}
              navigate={navigate}
              genre="indie"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
