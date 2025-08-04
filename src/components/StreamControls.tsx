import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Settings } from "lucide-react";

interface StreamControlsProps {
  isStreaming: boolean;
  videoEnabled: boolean;
  audioEnabled: boolean;
  onToggleStream: () => void;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onEndStream: () => void;
}

export function StreamControls({
  isStreaming,
  videoEnabled,
  audioEnabled,
  onToggleStream,
  onToggleVideo,
  onToggleAudio,
  onEndStream,
}: StreamControlsProps) {
  return (
    <Card className="p-4 bg-card/80 backdrop-blur-sm border border-border/50">
      <div className="flex items-center justify-center gap-4">
        {!isStreaming ? (
          <Button
            variant="stream"
            size="lg"
            onClick={onToggleStream}
            className="px-8"
          >
            Start Streaming
          </Button>
        ) : (
          <>
            <Button
              variant={videoEnabled ? "glass" : "destructive"}
              size="icon"
              onClick={onToggleVideo}
              className="h-12 w-12"
            >
              {videoEnabled ? <Video /> : <VideoOff />}
            </Button>
            
            <Button
              variant={audioEnabled ? "glass" : "destructive"}
              size="icon"
              onClick={onToggleAudio}
              className="h-12 w-12"
            >
              {audioEnabled ? <Mic /> : <MicOff />}
            </Button>
            
            <Button
              variant="glass"
              size="icon"
              className="h-12 w-12"
            >
              <Settings />
            </Button>
            
            <Button
              variant="destructive"
              size="lg"
              onClick={onEndStream}
              className="px-6"
            >
              <PhoneOff className="mr-2 h-4 w-4" />
              End Stream
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}