import { Cpu, Activity, Ratio, Gauge } from 'lucide-react';
import type { Telemetry } from '@/hooks/useTelemetry';

function DataBlock({
  label,
  icon,
  children,
  variant,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  variant: 'slate' | 'indigo' | 'teal' | 'emerald';
}) {
  const iconColor = {
    slate: 'text-slate-700',
    indigo: 'text-indigo-deep',
    teal: 'text-teal-corporate',
    emerald: 'text-emerald-mid',
  }[variant];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-card">
      <div className="mb-2.5 flex items-center gap-2">
        <span className={iconColor}>{icon}</span>
        <p className="section-label">{label}</p>
      </div>
      {children}
    </div>
  );
}

export function TelemetryPanel({ telemetry, active }: { telemetry: Telemetry; active: boolean }) {
  const confColor =
    telemetry.confidence >= 100
      ? 'bg-emerald-bright'
      : telemetry.confidence > 50
      ? 'bg-accent-blue'
      : 'bg-amber-light';

  const confText =
    telemetry.confidence >= 100
      ? 'text-emerald-mid'
      : telemetry.confidence > 50
      ? 'text-accent-blue'
      : 'text-amber-rich';

  return (
    <div className="white-card-lg flex flex-col">
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-slate-700" />
          <h2 className="font-display text-sm font-bold text-slate-900">Analytical Telemetry Control</h2>
        </div>
      </div>

      <div className="flex-1 space-y-3 p-4">
        {/* Frame Buffer Spec */}
        <DataBlock label="Frame Buffer Spec" icon={<Activity className="h-3.5 w-3.5" />} variant="slate">
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Webcam Stream</span>
              <span className="font-semibold text-slate-900">{telemetry.bufferW}×{telemetry.bufferH}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Grid Plane</span>
              <span className="font-semibold text-slate-900">Grayscale</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Frame Rate</span>
              <span className="font-semibold text-slate-900">{telemetry.fps} FPS</span>
            </div>
          </div>
        </DataBlock>

        {/* Edge Gradient Terminal Tracker — Electric Indigo */}
        <DataBlock label="Edge Gradient Terminal Tracker" icon={<Activity className="h-3.5 w-3.5" />} variant="indigo">
          <div className="font-mono text-xs text-slate-500">|Gx| = |I(x+1, y) - I(x, y)|</div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-indigo-electric">
              {telemetry.gradient.toString().padStart(3, '0')}
            </span>
            <span className="font-mono text-xs text-slate-400">/ 255</span>
          </div>
          <div className="mt-2 flex h-7 items-end gap-0.5">
            {Array.from({ length: 28 }).map((_, i) => (
              <span
                key={i}
                className="flex-1 rounded-sm bg-indigo-light/70"
                style={{ height: `${20 + Math.abs(Math.sin((telemetry.gradient + i * 7) / 12)) * 80}%` }}
              />
            ))}
          </div>
        </DataBlock>

        {/* Invariant Scale-Invariant Calculator — Teal/Cyan */}
        <DataBlock label="Invariant Scale-Invariant Calculator" icon={<Ratio className="h-3.5 w-3.5" />} variant="teal">
          <div className="font-mono text-xs text-slate-500">R = Dimension A ÷ Dimension B</div>
          <div className="mt-1 font-mono text-2xl font-bold text-teal-corporate">
            R = {telemetry.ratio.toFixed(4)}
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-corporate to-accent-blue transition-all duration-200"
              style={{ width: `${((telemetry.ratio - 1.2) / 0.3) * 100}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between font-mono text-[10px] text-slate-400">
            <span>1.20</span><span>1.35</span><span>1.50</span>
          </div>
        </DataBlock>

        {/* Matching Metric Status */}
        <DataBlock label="Matching Metric Status" icon={<Gauge className="h-3.5 w-3.5" />} variant="emerald">
          <div className={`text-sm font-semibold ${confText}`}>
            {active ? telemetry.confidenceLabel : 'Standby'}
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-200 ${confColor}`}
              style={{ width: `${telemetry.confidence}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between font-mono text-[10px]">
            <span className="text-slate-400">0%</span>
            <span className="font-semibold text-slate-700">{telemetry.confidence.toFixed(1)}%</span>
            <span className="text-slate-400">100%</span>
          </div>
        </DataBlock>
      </div>
    </div>
  );
}
