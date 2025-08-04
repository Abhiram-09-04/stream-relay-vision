import { useState, useEffect, useRef } from "react";
import { VideoPreview } from "./VideoPreview";
import { StreamControls } from "./StreamControls";
import { FrameCaptureControls } from "./FrameCaptureControls";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, ArrowLeft, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FrameCapture, type CapturedFrame, type FrameCaptureSettings } from "@/utils/frameCapture";
import { removeBackground, loadImage } from "@/utils/backgroundRemoval";

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
  const [capturedFrames, setCapturedFrames] = useState<CapturedFrame[]>([]);
  const [isAutoCapturing, setIsAutoCapturing] = useState(false);
  const [captureSettings, setCaptureSettings] = useState<FrameCaptureSettings>({
    quality: 0.8,
    format: 'jpeg',
    intervalMs: 1000,
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameCaptureRef = useRef<FrameCapture>();
  const { toast } = useToast();

  useEffect(() => {
    frameCaptureRef.current = new FrameCapture();
    return () => {
      frameCaptureRef.current?.cleanup();
    };
  }, []);

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

  // Frame capture handlers
  const handleCaptureFrame = async () => {
    if (!videoRef.current || !frameCaptureRef.current) return;
    
    try {
      const frame = await frameCaptureRef.current.captureFrame(videoRef.current, captureSettings);
      setCapturedFrames(prev => [...prev, frame]);
      toast({
        title: "Frame Captured",
        description: `Frame saved at ${new Date(frame.timestamp).toLocaleTimeString()}`,
      });
    } catch (error) {
      console.error('Frame capture error:', error);
      toast({
        title: "Capture Failed",
        description: "Could not capture frame from video",
        variant: "destructive",
      });
    }
  };

  const handleStartAutoCapture = () => {
    if (!videoRef.current || !frameCaptureRef.current) return;
    
    setIsAutoCapturing(true);
    frameCaptureRef.current.startAutoCapture(
      videoRef.current,
      { ...captureSettings, intervalMs: captureSettings.intervalMs || 1000 },
      (frame) => {
        setCapturedFrames(prev => [...prev, frame]);
      }
    );
    
    toast({
      title: "Auto Capture Started",
      description: `Capturing frames every ${captureSettings.intervalMs}ms`,
    });
  };

  const handleStopAutoCapture = () => {
    setIsAutoCapturing(false);
    frameCaptureRef.current?.stopAutoCapture();
    toast({
      title: "Auto Capture Stopped",
      description: "Frame capture has been stopped",
    });
  };

  const handleDownloadFrame = (frame: CapturedFrame) => {
    frameCaptureRef.current?.downloadFrame(frame);
  };

  const handleDownloadAll = () => {
    if (capturedFrames.length === 0) return;
    frameCaptureRef.current?.downloadFramesAsZip(capturedFrames, `rover_frames_${roomId}.zip`);
    toast({
      title: "Downloading Frames",
      description: `Downloading ${capturedFrames.length} frames`,
    });
  };

  const handleClearFrames = () => {
    setCapturedFrames([]);
    toast({
      title: "Frames Cleared",
      description: "All captured frames have been removed",
    });
  };

  const handleRemoveBackground = async (frame: CapturedFrame) => {
    try {
      toast({
        title: "Processing Frame",
        description: "Removing background... This may take a moment",
      });

      const img = await loadImage(frame.blob);
      const processedBlob = await removeBackground(img);
      
      // Update frame with processed version
      setCapturedFrames(prev => 
        prev.map(f => 
          f.id === frame.id 
            ? { ...f, processed: { ...f.processed, backgroundRemoved: processedBlob } }
            : f
        )
      );

      // Download processed frame
      const link = document.createElement('a');
      link.href = URL.createObjectURL(processedBlob);
      link.download = `processed_${frame.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Background Removed",
        description: "Processed frame downloaded successfully",
      });
    } catch (error) {
      console.error('Background removal error:', error);
      toast({
        title: "Processing Failed",
        description: "Could not remove background from frame",
        variant: "destructive",
      });
    }
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
          ref={videoRef}
        />

        {/* Frame Capture Controls */}
        <FrameCaptureControls
          onCaptureFrame={handleCaptureFrame}
          onStartAutoCapture={handleStartAutoCapture}
          onStopAutoCapture={handleStopAutoCapture}
          onDownloadFrame={handleDownloadFrame}
          onDownloadAll={handleDownloadAll}
          onClearFrames={handleClearFrames}
          onRemoveBackground={handleRemoveBackground}
          frames={capturedFrames}
          isAutoCapturing={isAutoCapturing}
          settings={captureSettings}
          onSettingsChange={setCaptureSettings}
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