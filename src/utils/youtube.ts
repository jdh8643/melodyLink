import { useState, useEffect } from 'react';

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  songNumber?: string;
  artist?: string;
  composer?: string;
  lyricist?: string;
}

const YOUTUBE_API_KEY = 'AIzaSyCI9QQU8N-4_PrPDnWLxiaIgFPGQrzd5LM';

export const searchVideos = async (query: string): Promise<YouTubeVideo[]> => {
  try {
    const searchQuery = `MR ${query}`;
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(
        searchQuery
      )}&type=video&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('YouTube API request failed');
    }
    
    const data = await response.json();
    
    return data.items.map((item: any) => {
      const title = item.snippet.title;
      const songNumberMatch = title.match(/(\d{5})/);
      const songNumber = songNumberMatch ? songNumberMatch[1] : '';
      
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        songNumber,
        artist: item.snippet.channelTitle,
      };
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
};

export const useYouTubePlayer = (videoId: string) => {
  const [player, setPlayer] = useState<any>(null);

  useEffect(() => {
    const cleanupPlayer = () => {
      if (player) {
        try {
          player.destroy();
        } catch (error) {
          console.error('Error destroying player:', error);
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
        
        const newPlayer = new window.YT.Player('youtube-player', {
          height: '360',
          width: '640',
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            enablejsapi: 1,
            origin: window.location.origin,
            host: 'https://www.youtube.com',
            widget_referrer: window.location.origin,
            playsinline: 1
          },
          events: {
            onReady: (event: any) => {
              console.log('Player ready:', event);
              event.target.playVideo();
            },
            onError: (error: any) => {
              console.error('YouTube Player Error:', error);
              console.log('Error details:', {
                videoId,
                error: error.data,
                playerState: error.target.getPlayerState(),
                url: error.target.getVideoUrl()
              });
            },
            onStateChange: (event: any) => {
              console.log('Player state changed:', event.data);
            }
          }
        });
        
        setPlayer(newPlayer);
      } catch (error) {
        console.error('Error initializing player:', error);
      }
    };

    if (window.YT && window.YT.Player) {
      loadVideo();
    } else {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = loadVideo;
    }

    return cleanupPlayer;
  }, [videoId]);

  return player;
};