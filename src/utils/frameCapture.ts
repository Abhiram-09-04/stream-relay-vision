export interface CapturedFrame {
  id: string;
  timestamp: number;
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  processed?: {
    backgroundRemoved?: Blob;
    preprocessed?: Blob;
  };
}

export interface FrameCaptureSettings {
  quality: number; // 0.1 to 1.0
  format: 'jpeg' | 'png' | 'webp';
  width?: number;
  height?: number;
  intervalMs?: number; // for auto-capture
}

export class FrameCapture {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private autoCapture: boolean = false;
  private intervalId?: number;

  constructor() {
    this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;
  }

  captureFrame(
    video: HTMLVideoElement, 
    settings: FrameCaptureSettings = { quality: 0.8, format: 'jpeg' }
  ): Promise<CapturedFrame> {
    return new Promise((resolve, reject) => {
      try {
        // Set canvas dimensions
        const width = settings.width || video.videoWidth;
        const height = settings.height || video.videoHeight;
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Draw video frame to canvas
        this.ctx.drawImage(video, 0, 0, width, height);
        
        // Convert to blob
        this.canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create blob from canvas'));
              return;
            }

            const frame: CapturedFrame = {
              id: `frame_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              timestamp: Date.now(),
              blob,
              dataUrl: this.canvas.toDataURL(`image/${settings.format}`, settings.quality),
              width,
              height,
            };

            resolve(frame);
          },
          `image/${settings.format}`,
          settings.quality
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  startAutoCapture(
    video: HTMLVideoElement,
    settings: FrameCaptureSettings & { intervalMs: number },
    onFrame: (frame: CapturedFrame) => void
  ) {
    this.stopAutoCapture();
    this.autoCapture = true;

    const captureLoop = async () => {
      if (!this.autoCapture) return;
      
      try {
        const frame = await this.captureFrame(video, settings);
        onFrame(frame);
      } catch (error) {
        console.error('Auto capture error:', error);
      }
    };

    // Initial capture
    captureLoop();
    
    // Set up interval
    this.intervalId = window.setInterval(captureLoop, settings.intervalMs);
  }

  stopAutoCapture() {
    this.autoCapture = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  downloadFrame(frame: CapturedFrame, filename?: string) {
    const link = document.createElement('a');
    link.href = frame.dataUrl;
    link.download = filename || `frame_${frame.timestamp}.${frame.dataUrl.includes('png') ? 'png' : 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  downloadFramesAsZip(frames: CapturedFrame[], zipName: string = 'frames.zip') {
    // For now, download individually - could implement JSZip for actual zip files
    frames.forEach((frame, index) => {
      setTimeout(() => {
        this.downloadFrame(frame, `${zipName.replace('.zip', '')}_${index + 1}.jpg`);
      }, index * 100); // Stagger downloads
    });
  }

  getFrameMetadata(frame: CapturedFrame) {
    return {
      id: frame.id,
      timestamp: frame.timestamp,
      date: new Date(frame.timestamp).toISOString(),
      width: frame.width,
      height: frame.height,
      size: frame.blob.size,
      type: frame.blob.type,
    };
  }

  cleanup() {
    this.stopAutoCapture();
  }
}