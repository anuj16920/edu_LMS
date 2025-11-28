import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";

interface VideoPlayerProps {
  src: string;
  title: string;
  onTimeUpdate?: (currentTime: number) => void;
}

export const VideoPlayer = ({ src, title, onTimeUpdate }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (onTimeUpdate && video.currentTime) {
        onTimeUpdate(video.currentTime);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [onTimeUpdate]);

  return (
    <Card className="overflow-hidden border-border/50 bg-black">
      <video
        ref={videoRef}
        controls
        className="w-full aspect-video"
        controlsList="nodownload"
      >
        <source src={src} type="video/mp4" />
        <source src={src} type="video/mov" />
        Your browser does not support the video tag.
      </video>
    </Card>
  );
};
