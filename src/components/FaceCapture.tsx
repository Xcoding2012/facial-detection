import { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle } from 'lucide-react';
import { detectFace, loadFaceModels, computeGeometricRatio } from '@/lib/faceEngine';

interface FaceCaptureProps {
  onCaptured: (descriptor: number[], ratio: number) => void;
  onClear: () => void;
  captured: boolean;
}

export function FaceCapture({ onCaptured, onClear, captured }: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading-models' | 'ready' | 'scanning' | 'no-face' | 'error'>('idle');

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const start = async () => {
    setActive(true);
    setStatus('loading-models');
    try {
      await loadFaceModels();
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  const stop = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setActive(false);
    setStatus('idle');
  };

  const capture = async () => {
    if (!videoRef.current) return;
    setStatus('scanning');
    const result = await detectFace(videoRef.current);
    if (!result) {
      setStatus('no-face');
      return;
    }
    const ratio = computeGeometricRatio(result.landmarks);
    onCaptured(Array.from(result.descriptor), ratio);
    stop();
  };

  if (captured) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-bright/25 bg-emerald-50 px-3 py-2">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-mid" />
        <span className="text-sm text-slate-700">Face descriptor captured</span>
        <button
          onClick={() => {
            onClear();
          }}
          className="ml-auto text-xs font-semibold text-slate-500 underline hover:text-slate-700"
        >
          Recapture
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      {!active ? (
        <button
          onClick={start}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
        >
          <Camera className="h-4 w-4 text-royal" />
          Capture Face via Webcam
        </button>
      ) : (
        <div className="space-y-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-900">
            <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-slate-500">
              {status === 'loading-models' && 'Loading detection models…'}
              {status === 'ready' && 'Center face, then capture'}
              {status === 'scanning' && 'Extracting descriptor…'}
              {status === 'no-face' && (
                <span className="inline-flex items-center gap-1 text-rose-500">
                  <AlertTriangle className="h-3.5 w-3.5" /> No face detected — try again
                </span>
              )}
              {status === 'error' && (
                <span className="inline-flex items-center gap-1 text-rose-500">
                  <AlertTriangle className="h-3.5 w-3.5" /> Camera access denied
                </span>
              )}
            </span>
            <div className="flex gap-2">
              <button
                onClick={stop}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={capture}
                disabled={status === 'loading-models' || status === 'scanning'}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-royal to-accent-blue px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === 'scanning' ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                Capture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
