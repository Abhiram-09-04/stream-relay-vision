import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Volume2, VolumeX } from "lucide-react";

interface ViewerViewProps {
  roomId: string;
  onLeaveRoom: () => void;
}

export function ViewerView({ roomId, onLeaveRoom }: ViewerViewProps) {
  const [isConnected] = useState(false); // Will be dynamic with real implementation
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [viewerCount] = useState(0); // Will be dynamic with real implementation

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
                <h1 className="text-xl font-bold">Watching Stream</h1>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono">
                    {roomId}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {viewerCount} viewers
              </div>
              {isConnected && (
                <Badge variant="destructive" className="animate-pulse-live bg-live text-live-foreground">
                  🔴 LIVE
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Video Player */}
        <Card className="relative overflow-hidden bg-card/50 backdrop-blur-sm border border-border/50">
          <div className="aspect-video bg-muted/20 flex items-center justify-center relative">
            {isConnected ? (
              <div className="w-full h-full flex items-center justify-center">
                {/* Placeholder for actual video stream */}
                <div className="text-center text-muted-foreground">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                    📺
                  </div>
                  <p className="text-sm">Connected to stream...</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  🔌
                </div>
                <p className="text-lg font-medium mb-2">Waiting for stream...</p>
                <p className="text-sm">
                  The streamer hasn't started broadcasting yet
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Viewer Controls */}
        <Card className="p-4 bg-card/80 backdrop-blur-sm border border-border/50">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant={audioEnabled ? "glass" : "destructive"}
              size="icon"
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="h-12 w-12"
            >
              {audioEnabled ? <Volume2 /> : <VolumeX />}
            </Button>
            
            <Button
              variant="destructive"
              size="lg"
              onClick={onLeaveRoom}
              className="px-6"
            >
              Leave Stream
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}