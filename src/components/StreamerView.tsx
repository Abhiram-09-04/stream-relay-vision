import { useState, useEffect } from "react";
import { VideoPreview } from "./VideoPreview";
import { StreamControls } from "./StreamControls";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, ArrowLeft, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StreamerViewProps {
  roomId: string;
  onLeaveRoom: () => void;
}

export function StreamerView({ roomId, onLeaveRoom }: StreamerViewProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [stream, setStream] = useState<MediaStream>();
  const [viewerCount] = useState(0); // Will be dynamic with real implementation
  const { toast } = useToast();

  useEffect(() => {
    // Get user media when component mounts
    const initializeMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(mediaStream);
      } catch (error) {
        console.error("Error accessing media devices:", error);
        toast({
          title: "Camera Access Required",
          description: "Please allow camera and microphone access to start streaming.",
          variant: "destructive",
        });
      }
    };

    initializeMedia();

    return () => {
      // Cleanup: stop all tracks when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleToggleStream = () => {
    setIsStreaming(!isStreaming);
    toast({
      title: isStreaming ? "Stream Stopped" : "Stream Started",
      description: isStreaming 
        ? "Your stream has been stopped" 
        : `You are now live in room ${roomId}`,
    });
  };

  const handleToggleVideo = () => {
    setVideoEnabled(!videoEnabled);
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoEnabled;
      }
    }
  };

  const handleToggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioEnabled;
      }
    }
  };

  const handleEndStream = () => {
    setIsStreaming(false);
    onLeaveRoom();
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast({
      title: "Room ID Copied",
      description: "Share this ID with viewers to join your stream",
    });
  };

  return (
    <div className="min-h-screen bg-stream-gradient p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="p-4 bg-card/80 backdrop-blur-sm border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onLeaveRoom}>
                <ArrowLeft />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Streaming Room</h1>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">
                    {roomId}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={copyRoomId}
                    className="h-6 px-2"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {viewerCount} viewers
              </div>
              {isStreaming && (
                <Badge variant="destructive" className="animate-pulse-live bg-live text-live-foreground">
                  🔴 LIVE
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Video Preview */}
        <VideoPreview 
          isStreaming={isStreaming}
          videoEnabled={videoEnabled}
          stream={stream}
        />

        {/* Stream Controls */}
        <StreamControls
          isStreaming={isStreaming}
          videoEnabled={videoEnabled}
          audioEnabled={audioEnabled}
          onToggleStream={handleToggleStream}
          onToggleVideo={handleToggleVideo}
          onToggleAudio={handleToggleAudio}
          onEndStream={handleEndStream}
        />
      </div>
    </div>
  );
}