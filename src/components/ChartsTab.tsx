import { useMemo } from 'react';
import { ChartBar as BarChart3, TrendingUp, Sigma, Award } from 'lucide-react';
import { FREQ_DISTRIBUTION, MODAL_CLASS, MODAL_FREQUENCY, TOTAL_STUDENTS } from '@/data/students';

export function ChartsTab() {
  const maxFreq = Math.max(...FREQ_DISTRIBUTION.map((f) => f.frequency));
  const totalFreq = FREQ_DISTRIBUTION.reduce((sum, f) => sum + f.frequency, 0);

  const probs = FREQ_DISTRIBUTION.map((f) => ({
    ...f,
    p: f.frequency / totalFreq,
  }));
  const maxP = Math.max(...probs.map((p) => p.p));

  const curvePoints = useMemo(() => {
    return probs.map((p) => {
      const mid = (p.lower + p.upper) / 2;
      const x = ((mid - 1.2) / 0.3) * 100;
      const y = 100 - (p.p / maxP) * 80 - 10;
      return { x, y, mid, p };
    });
  }, [probs, maxP]);

  const pathD = curvePoints
    .map((pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = curvePoints[i - 1];
      const cx = (prev.x + pt.x) / 2;
      return `Q ${cx} ${prev.y} ${pt.x} ${pt.y}`;
    })
    .join(' ');

  const areaD = `${pathD} L 100 100 L 0 100 Z`;

  return (
    <div className="space-y-4">
      {/* Section title */}
      <div className="white-card-lg flex items-center gap-3 px-5 py-4">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-royal to-accent-blue text-white shadow-card-md">
          <Sigma className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-base font-extrabold text-slate-900">
            Section 6.3: Continuous Statistical Frequency Modeling
          </h2>
          <p className="text-sm text-slate-500">
            Distribution of facial scale index ratios across {TOTAL_STUDENTS} enrolled student profile vectors
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Histogram */}
        <div className="white-card-lg overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
            <BarChart3 className="h-4 w-4 text-royal" />
            <h3 className="font-display text-sm font-bold text-slate-900">Interactive Frequency Histogram</h3>
          </div>
          <div className="p-5">
            <div className="relative flex h-64 items-end justify-between gap-2 sm:gap-3">
              {FREQ_DISTRIBUTION.map((f, i) => {
                const h = (f.frequency / maxFreq) * 100;
                const isModal = f.label === MODAL_CLASS;
                return (
                  <div key={f.label} className="relative flex flex-1 flex-col items-center justify-end gap-1.5">
                    {/* Modal pointer badge */}
                    {isModal && (
                      <div className="absolute -top-2 z-10 flex flex-col items-center">
                        <div className="flex items-center gap-1 rounded-full border border-emerald-mid/30 bg-emerald-mint px-2.5 py-1 text-[10px] font-bold text-emerald-deep shadow-card">
                          <Award className="h-3 w-3" />
                          MODAL CLASS
                        </div>
                        <div className="mt-0.5 h-4 w-px bg-emerald-mid/50" />
                      </div>
                    )}
                    <span className={`text-xs font-bold ${isModal ? 'text-emerald-deep' : 'text-slate-700'}`}>
                      {f.frequency}
                    </span>
                    <div
                      className={`w-full origin-bottom rounded-t-lg transition-all duration-500 ${
                        isModal ? 'bar-teal-royal-modal shadow-emerald-glow' : 'bar-teal-royal'
                      }`}
                      style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }}
                    />
                    <span className="font-mono text-[9px] text-slate-500 sm:text-[10px]">
                      {f.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3">
              <span className="font-mono text-xs text-slate-500">N = {totalFreq}</span>
              <span className="rounded-full bg-emerald-mint px-3 py-1 text-xs font-bold text-emerald-deep">
                Modal Class: {MODAL_CLASS} · f = {MODAL_FREQUENCY}
              </span>
              <span className="font-mono text-xs text-slate-500">Class Width = 0.05</span>
            </div>
          </div>
        </div>

        {/* Probability Distribution Curve */}
        <div className="white-card-lg overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
            <TrendingUp className="h-4 w-4 text-royal" />
            <h3 className="font-display text-sm font-bold text-slate-900">Probability Distribution Curve P(E)</h3>
          </div>
          <div className="p-5">
            <svg viewBox="0 0 100 100" className="h-64 w-full" preserveAspectRatio="none">
              {[20, 40, 60, 80].map((y) => (
                <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#E2E8F0" strokeWidth="0.3" />
              ))}
              <defs>
                <linearGradient id="probGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(30,58,138,0.30)" />
                  <stop offset="50%" stopColor="rgba(13,148,136,0.20)" />
                  <stop offset="100%" stopColor="rgba(13,148,136,0)" />
                </linearGradient>
              </defs>
              <path d={areaD} fill="url(#probGrad)" />
              <path d={pathD} fill="none" stroke="#1E3A8A" strokeWidth="0.8" />
              {curvePoints.map((pt, i) => {
                const isModal = pt.mid === 1.375;
                return (
                  <g key={i}>
                    <circle cx={pt.x} cy={pt.y} r={isModal ? '1.8' : '1'} fill={isModal ? '#065F46' : '#2563EB'} />
                    {isModal && (
                      <circle cx={pt.x} cy={pt.y} r="3.5" fill="none" stroke="#065F46" strokeWidth="0.4" opacity="0.6" />
                    )}
                  </g>
                );
              })}
              {curvePoints
                .filter((pt) => pt.mid === 1.375)
                .map((pt, i) => (
                  <line key={`m${i}`} x1={pt.x} y1={pt.y} x2={pt.x} y2="100" stroke="#065F46" strokeWidth="0.3" strokeDasharray="1 1" opacity="0.5" />
                ))}
            </svg>
            <div className="mt-2 flex justify-between font-mono text-[9px] text-slate-500">
              {FREQ_DISTRIBUTION.map((f) => (
                <span key={f.label} className="flex-1 text-center">{f.label}</span>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3">
              <span className="font-mono text-xs text-slate-500">P(E) = f / N</span>
              <span className="flex items-center gap-1 rounded-full bg-emerald-mint px-3 py-1 text-xs font-bold text-emerald-deep">
                <Sigma className="h-3 w-3" /> Peak @ Modal Class {MODAL_CLASS}
              </span>
              <span className="font-mono text-xs text-slate-500">ΣP = 1.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
