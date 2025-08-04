import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Download, Play, Square, Settings, Trash2, Image, Zap } from "lucide-react";
import { useState } from "react";
import type { CapturedFrame, FrameCaptureSettings } from "@/utils/frameCapture";

interface FrameCaptureControlsProps {
  onCaptureFrame: () => void;
  onStartAutoCapture: () => void;
  onStopAutoCapture: () => void;
  onDownloadFrame: (frame: CapturedFrame) => void;
  onDownloadAll: () => void;
  onClearFrames: () => void;
  onRemoveBackground: (frame: CapturedFrame) => void;
  frames: CapturedFrame[];
  isAutoCapturing: boolean;
  settings: FrameCaptureSettings;
  onSettingsChange: (settings: FrameCaptureSettings) => void;
}

export function FrameCaptureControls({
  onCaptureFrame,
  onStartAutoCapture,
  onStopAutoCapture,
  onDownloadFrame,
  onDownloadAll,
  onClearFrames,
  onRemoveBackground,
  frames,
  isAutoCapturing,
  settings,
  onSettingsChange,
}: FrameCaptureControlsProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="space-y-4">
      {/* Main Controls */}
      <Card className="p-4 bg-card/80 backdrop-blur-sm border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Frame Capture
          </h3>
          <Badge variant="outline">
            {frames.length} frames captured
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="stream"
            onClick={onCaptureFrame}
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            Capture Frame
          </Button>

          {!isAutoCapturing ? (
            <Button
              variant="glass"
              onClick={onStartAutoCapture}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Auto Capture
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={onStopAutoCapture}
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Stop Auto
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4" />
          </Button>

          {frames.length > 0 && (
            <>
              <div className="h-6 w-px bg-border mx-2" />
              <Button
                variant="ghost"
                onClick={onDownloadAll}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download All
              </Button>
              <Button
                variant="ghost"
                onClick={onClearFrames}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="p-4 bg-card/80 backdrop-blur-sm border border-border/50 animate-fade-in">
          <h4 className="text-md font-medium mb-4">Capture Settings</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quality">Quality: {Math.round(settings.quality * 100)}%</Label>
              <Slider
                id="quality"
                min={10}
                max={100}
                step={10}
                value={[settings.quality * 100]}
                onValueChange={([value]) => 
                  onSettingsChange({ ...settings, quality: value / 100 })
                }
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select 
                value={settings.format} 
                onValueChange={(value: 'jpeg' | 'png' | 'webp') => 
                  onSettingsChange({ ...settings, format: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="webp">WebP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interval">Auto Capture Interval (ms)</Label>
              <Input
                id="interval"
                type="number"
                value={settings.intervalMs || 1000}
                onChange={(e) => 
                  onSettingsChange({ 
                    ...settings, 
                    intervalMs: parseInt(e.target.value) || 1000 
                  })
                }
                min="100"
                step="100"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Captured Frames Grid */}
      {frames.length > 0 && (
        <Card className="p-4 bg-card/80 backdrop-blur-sm border border-border/50">
          <h4 className="text-md font-medium mb-4">Captured Frames</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {frames.slice(-12).map((frame) => (
              <div key={frame.id} className="relative group">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src={frame.dataUrl}
                    alt={`Frame ${frame.id}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Overlay Controls */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDownloadFrame(frame)}
                    className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30"
                  >
                    <Download className="h-3 w-3 text-white" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveBackground(frame)}
                    className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30"
                  >
                    <Zap className="h-3 w-3 text-white" />
                  </Button>
                </div>

                {/* Frame Info */}
                <div className="absolute bottom-1 left-1 right-1">
                  <Badge variant="secondary" className="text-xs w-full justify-center">
                    {new Date(frame.timestamp).toLocaleTimeString()}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}