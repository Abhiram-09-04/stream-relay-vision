import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Video } from "lucide-react";

interface RoomJoinProps {
  onJoinRoom: (roomId: string, mode: 'streamer' | 'viewer') => void;
}

export function RoomJoin({ onJoinRoom }: RoomJoinProps) {
  const [roomId, setRoomId] = useState("");

  const handleJoin = (mode: 'streamer' | 'viewer') => {
    if (roomId.trim()) {
      onJoinRoom(roomId.trim(), mode);
    }
  };

  const generateRandomRoom = () => {
    const randomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(randomId);
  };

  return (
    <div className="min-h-screen bg-stream-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-card/80 backdrop-blur-sm border border-border/50 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Video className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">LiveStream</h1>
          <p className="text-muted-foreground">
            Stream live video between devices
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Room ID</label>
            <div className="flex gap-2">
              <Input
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID"
                className="bg-input/50 border-border/50"
              />
              <Button
                variant="ghost"
                onClick={generateRandomRoom}
                className="px-3"
              >
                🎲
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Choose your role:</p>
            
            <Button
              variant="stream"
              size="lg"
              onClick={() => handleJoin('streamer')}
              disabled={!roomId.trim()}
              className="w-full"
            >
              <Video className="mr-2 h-4 w-4" />
              Start Streaming
              <Badge variant="secondary" className="ml-2">Host</Badge>
            </Button>

            <Button
              variant="glass"
              size="lg"
              onClick={() => handleJoin('viewer')}
              disabled={!roomId.trim()}
              className="w-full"
            >
              <Users className="mr-2 h-4 w-4" />
              Watch Stream
              <Badge variant="outline" className="ml-2">Viewer</Badge>
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center pt-4 border-t border-border/50">
            Share the room ID with others to let them join your stream
          </div>
        </div>
      </Card>
    </div>
  );
}