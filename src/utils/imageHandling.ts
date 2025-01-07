export const getPlaceholderImage = (genre: string): string => {
  const placeholders = {
    ballad: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=450&fit=crop",
    dance: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=450&fit=crop",
    trot: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=450&fit=crop"
  };
  
  return placeholders[genre as keyof typeof placeholders] || placeholders.ballad;
};