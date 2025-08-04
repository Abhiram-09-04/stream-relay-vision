import { useEffect, useRef, forwardRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface VideoPreviewProps {
  isStreaming: boolean;
  videoEnabled: boolean;
  stream?: MediaStream;
}

const VideoPreview = forwardRef<HTMLVideoElement, VideoPreviewProps>(
  ({ isStreaming, videoEnabled, stream }, ref) => {
    const internalRef = useRef<HTMLVideoElement>(null);
    const videoRef = ref || internalRef;

  useEffect(() => {
    if (videoRef && 'current' in videoRef && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef]);

  return (
    <Card className="relative overflow-hidden bg-card/50 backdrop-blur-sm border border-border/50">
      <div className="aspect-video bg-muted/20 flex items-center justify-center relative">
        {stream && videoEnabled ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              📹
            </div>
            <p className="text-sm">
              {!videoEnabled ? "Camera is off" : "No camera access"}
            </p>
          </div>
        )}
        
        {isStreaming && (
          <Badge 
            variant="destructive" 
            className="absolute top-4 left-4 animate-pulse-live bg-live text-live-foreground"
          >
            🔴 LIVE
          </Badge>
        )}
      </div>
    </Card>
  );
});

VideoPreview.displayName = "VideoPreview";

export { VideoPreview };