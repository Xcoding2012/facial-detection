import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Crosshair, CircleCheck as CheckCircle2, Fingerprint, UserX } from 'lucide-react';
import type { StudentProfile } from '@/data/students';
import type { Telemetry } from '@/hooks/useTelemetry';
import {
  loadFaceModels,
  areModelsLoaded,
  detectFace,
  findBestMatch,
  computeGeometricRatio,
  type EnrolledFace,
} from '@/lib/faceEngine';

interface CameraViewProps {
  active: boolean;
  onToggle: () => void;
  telemetry: Telemetry;
  students: StudentProfile[];
  onMatch: (studentId: string, ratio: number) => void;
}

const CONSECUTIVE_HITS_TO_LOCK = 4; // ~4 detection cycles of the same person confirms a lock
const DETECTION_INTERVAL_MS = 350;

export function CameraView({ active, onToggle, telemetry, students, onMatch }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const runningDetection = useRef(false);

  const [modelsReady, setModelsReady] = useState(areModelsLoaded());
  const [error, setError] = useState<string | null>(null);
  const [lockProgress, setLockProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [matchedName, setMatchedName] = useState<string | null>(null);
  const [faceState, setFaceState] = useState<'idle' | 'no-face' | 'unknown' | 'matching'>('idle');

  const streakRef = useRef<{ id: string | null; count: number }>({ id: null, count: 0 });
  const lockedRef = useRef(false);

  // Preload models as soon as the component mounts, so activating the camera is instant.
  useEffect(() => {
    loadFaceModels().then(() => setModelsReady(true));
  }, []);

  // Camera stream
  useEffect(() => {
    if (active) {
      let cancelled = false;
      setError(null);
      navigator.mediaDevices
        .getUserMedia({ video: { width: 1280, height: 720 }, audio: false })
        .then((stream) => {
          if (cancelled) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(() => setError('Camera access denied'));
      return () => {
        cancelled = true;
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      };
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setLockProgress(0);
      setShowSuccess(false);
      setFaceState('idle');
      streakRef.current = { id: null, count: 0 };
      lockedRef.current = false;
    }
  }, [active]);

  // Real detection loop
  useEffect(() => {
    if (!active || !modelsReady || error) return;

    const enrolled: EnrolledFace[] = students
      .filter((s): s is StudentProfile & { descriptor: number[] } => Array.isArray(s.descriptor))
      .map((s) => ({ id: s.id, descriptor: s.descriptor }));

    detectTimer.current = setInterval(async () => {
      if (runningDetection.current) return;
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;
      runningDetection.current = true;

      try {
        const result = await detectFace(video);
        const canvas = canvasRef.current;

        if (!result) {
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
          }
          setFaceState('no-face');
          streakRef.current = { id: null, count: 0 };
          if (!lockedRef.current) setLockProgress(0);
          return;
        }

        const match = findBestMatch(result.descriptor, enrolled);
        const ratio = computeGeometricRatio(result.landmarks);

        drawOverlay(canvas, video, result, !!match, !!lockedRef.current);

        if (!match) {
          setFaceState('unknown');
          streakRef.current = { id: null, count: 0 };
          if (!lockedRef.current) setLockProgress(0);
          return;
        }

        setFaceState('matching');
        if (streakRef.current.id === match.id) {
          streakRef.current.count += 1;
        } else {
          streakRef.current = { id: match.id, count: 1 };
        }

        const pct = Math.min(100, (streakRef.current.count / CONSECUTIVE_HITS_TO_LOCK) * 100);
        setLockProgress(pct);

        if (streakRef.current.count >= CONSECUTIVE_HITS_TO_LOCK && !lockedRef.current) {
          lockedRef.current = true;
          const student = students.find((s) => s.id === match.id);
          setMatchedName(student?.name ?? match.id);
          setShowSuccess(true);
          playBeep();
          onMatch(match.id, ratio);
          setTimeout(() => {
            setShowSuccess(false);
            lockedRef.current = false;
            streakRef.current = { id: null, count: 0 };
            setLockProgress(0);
          }, 2500);
        }
      } finally {
        runningDetection.current = false;
      }
    }, DETECTION_INTERVAL_MS);

    return () => {
      if (detectTimer.current) clearInterval(detectTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, modelsReady, error, students]);

  const locked = lockProgress >= 100;

  return (
    <div className="white-card-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <Fingerprint className="h-4 w-4 text-teal-corporate" />
          <h2 className="font-display text-sm font-bold text-slate-900">Biometric Matrix Sensor Input</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${active ? 'bg-emerald-bright shadow-emerald-glow blink' : 'bg-slate-300'}`} />
          <span className="font-mono text-[11px] font-medium text-slate-500">
            {active ? 'STREAMING' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {/* Video stage */}
      <div className="relative aspect-video w-full bg-slate-900">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`h-full w-full object-cover ${active && !error ? 'opacity-95' : 'opacity-0'}`}
        />

        {active && !error && (
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            className="pointer-events-none absolute inset-0 h-full w-full"
          />
        )}

        {(!active || error) && (
          <div className="absolute inset-0 grid place-items-center bg-slate-100">
            <div className="text-center">
              <CameraOff className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-600">
                {error ?? 'Biometric Sensor Standby'}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {active && !modelsReady
                  ? 'Loading detection models…'
                  : 'Press "Initialize Webcam Face Scanner" to begin'}
              </p>
            </div>
          </div>
        )}

        {active && (
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 cam-scanline opacity-40" />
            <div className="absolute inset-x-0 top-0 h-px bg-teal-corporate/60 animate-scan" />
          </div>
        )}

        {active && (
          <div className="pointer-events-none absolute bottom-3 left-3 flex gap-2">
            <span className="rounded-md bg-slate-900/70 px-2 py-0.5 font-mono text-[10px] text-teal-light">FPS {telemetry.fps}</span>
            <span className="rounded-md bg-slate-900/70 px-2 py-0.5 font-mono text-[10px] text-slate-200">{telemetry.bufferW}×{telemetry.bufferH}</span>
          </div>
        )}
        {active && (
          <div className="pointer-events-none absolute bottom-3 right-3 rounded-md bg-slate-900/70 px-2 py-0.5 font-mono text-[10px] text-gold-light">
            LAT {telemetry.latency.toFixed(3)}ms
          </div>
        )}
        {active && (
          <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-slate-900/70 px-2.5 py-0.5 font-mono text-[10px] font-medium">
            {faceState === 'no-face' && <span className="text-slate-300">NO FACE DETECTED</span>}
            {faceState === 'unknown' && (
              <span className="inline-flex items-center gap-1 text-amber-300">
                <UserX className="h-3 w-3" /> FACE NOT ENROLLED
              </span>
            )}
            {faceState === 'matching' && (
              <span className={locked ? 'text-emerald-light' : 'text-accent-sky'}>
                {locked ? 'TARGET LOCKED' : 'MATCHING'} {lockProgress.toFixed(0)}%
              </span>
            )}
            {faceState === 'idle' && <span className="text-slate-300">INITIALIZING…</span>}
          </div>
        )}

        {/* Success overlay */}
        {showSuccess && (
          <div className="absolute inset-0 z-20 grid place-items-center bg-slate-900/60 backdrop-blur-md success-fade">
            <div className="relative text-center">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="h-44 w-44 rounded-full border-2 border-emerald-bright ring-expand" />
              </div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="h-44 w-44 rounded-full border border-emerald-bright/50 ring-expand" style={{ animationDelay: '0.5s' }} />
              </div>
              <div className="relative">
                <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-bright" />
                <h2 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-emerald-bright sm:text-3xl">
                  BIOMETRIC ATTENDANCE RECORDED
                </h2>
                <div className="mx-auto mt-3 w-fit rounded-xl border border-emerald-bright/40 bg-emerald-bright/15 px-4 py-2 font-mono text-sm font-semibold text-emerald-light">
                  PROFILE REGISTERED: {matchedName}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2 font-mono text-[11px] font-medium text-slate-500">
          <Crosshair className="h-3.5 w-3.5 text-emerald-mid" />
          Facial Lock: {active ? `${lockProgress.toFixed(0)}%` : 'IDLE'}
        </div>
        <button
          onClick={onToggle}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
            active
              ? 'border border-rose-500/30 bg-white text-rose-500 hover:bg-rose-50'
              : 'bg-gradient-to-r from-royal to-accent-blue text-white shadow-card-md hover:shadow-card-lg hover:scale-[1.02]'
          }`}
        >
          {active ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
          {active ? 'Terminate Feed' : 'Initialize Webcam Face Scanner'}
        </button>
      </div>
    </div>
  );
}

function drawOverlay(
  canvas: HTMLCanvasElement | null,
  video: HTMLVideoElement,
  result: NonNullable<Awaited<ReturnType<typeof detectFace>>>,
  matched: boolean,
  locked: boolean,
) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const scaleX = canvas.width / video.videoWidth;
  const scaleY = canvas.height / video.videoHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const accent = locked ? '#10B981' : matched ? '#0EA5E9' : '#F59E0B';
  const accentDim = locked ? 'rgba(16,185,129,0.35)' : matched ? 'rgba(14,165,233,0.25)' : 'rgba(245,158,11,0.25)';

  // 68-point landmark mesh (real, detected)
  const pts = result.landmarks.positions.map((p) => ({ x: p.x * scaleX, y: p.y * scaleY }));
  ctx.fillStyle = accent;
  pts.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
    ctx.fill();
  });

  // Jawline + features as connected strokes for a "scanned mesh" look
  const chains = [
    [0, 16], // jaw
    [17, 21], // left brow
    [22, 26], // right brow
    [27, 30], // nose bridge
    [31, 35], // nose base
    [36, 41, 36], // left eye
    [42, 47, 42], // right eye
    [48, 59, 48], // outer lip
    [60, 67, 60], // inner lip
  ];
  ctx.strokeStyle = accentDim;
  ctx.lineWidth = 1.2;
  chains.forEach((chain) => {
    ctx.beginPath();
    for (let i = 0; i < chain.length; i++) {
      const idx = chain[i];
      const p = pts[idx];
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  });

  // Real bounding box from the detector
  const box = result.detection.box;
  const bx = box.x * scaleX;
  const by = box.y * scaleY;
  const bw = box.width * scaleX;
  const bh = box.height * scaleY;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 10);
  ctx.stroke();

  const cl = 18;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(bx, by + cl); ctx.lineTo(bx, by); ctx.lineTo(bx + cl, by);
  ctx.moveTo(bx + bw - cl, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + cl);
  ctx.moveTo(bx, by + bh - cl); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + cl, by + bh);
  ctx.moveTo(bx + bw - cl, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - cl);
  ctx.stroke();
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.setValueAtTime(1320, ctx.currentTime + 0.12);
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o.start();
    o.stop(ctx.currentTime + 0.4);
  } catch {
    // ignore
  }
}
