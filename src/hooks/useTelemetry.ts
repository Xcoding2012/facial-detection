import { useEffect, useRef, useState } from 'react';

export interface Telemetry {
  bufferW: number;
  bufferH: number;
  gradient: number;
  ratio: number;
  confidence: number;
  confidenceLabel: string;
  fps: number;
  latency: number;
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function useTelemetry(active: boolean) {
  const [t, setT] = useState<Telemetry>({
    bufferW: 1920,
    bufferH: 1080,
    gradient: 0,
    ratio: 1.37,
    confidence: 0,
    confidenceLabel: 'Standby',
    fps: 0,
    latency: 0.024,
  });
  const confRef = useRef(0);

  useEffect(() => {
    if (!active) {
      setT((prev) => ({ ...prev, confidence: 0, confidenceLabel: 'Standby', fps: 0 }));
      confRef.current = 0;
      return;
    }
    const id = setInterval(() => {
      confRef.current = Math.min(100, confRef.current + rand(2, 7));
      const c = confRef.current;
      let label = 'Acquiring Geometric Landmarks...';
      if (c > 20) label = 'Mapping Edge Boundaries...';
      if (c > 45) label = 'Computing Scale Invariants...';
      if (c > 70) label = 'Matching Biometric Template...';
      if (c >= 100) label = '100% Verified Profile Match';
      setT({
        bufferW: 1920,
        bufferH: 1080,
        gradient: Math.round(rand(0, 255)),
        ratio: Number(rand(1.2, 1.5).toFixed(4)),
        confidence: Number(c.toFixed(1)),
        confidenceLabel: label,
        fps: Math.round(rand(28, 32)),
        latency: Number(rand(0.020, 0.034).toFixed(3)),
      });
    }, 180);
    return () => clearInterval(id);
  }, [active]);

  return t;
}
