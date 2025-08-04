import { useState } from "react";
import { RoomJoin } from "@/components/RoomJoin";
import { StreamerView } from "@/components/StreamerView";
import { ViewerView } from "@/components/ViewerView";

type Mode = 'join' | 'streamer' | 'viewer';

const Index = () => {
  const [mode, setMode] = useState<Mode>('join');
  const [roomId, setRoomId] = useState('');

  const handleJoinRoom = (id: string, userMode: 'streamer' | 'viewer') => {
    setRoomId(id);
    setMode(userMode);
  };

  const handleLeaveRoom = () => {
    setMode('join');
    setRoomId('');
  };

  if (mode === 'join') {
    return <RoomJoin onJoinRoom={handleJoinRoom} />;
  }

  if (mode === 'streamer') {
    return <StreamerView roomId={roomId} onLeaveRoom={handleLeaveRoom} />;
  }

  return <ViewerView roomId={roomId} onLeaveRoom={handleLeaveRoom} />;
};

export default Index;
