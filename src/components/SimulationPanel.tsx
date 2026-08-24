import { useEffect, useRef } from 'react';
import { Zap, Square, Radio, Download } from 'lucide-react';
import type { StudentProfile } from '@/data/students';

export interface LogEntry {
  id: number;
  studentId: string;
  name: string;
  regNo: string;
  section: string;
  time: string;
  ratio: number;
  confidence: number;
}

interface SimulationPanelProps {
  running: boolean;
  onToggle: () => void;
  log: LogEntry[];
  students: StudentProfile[];
  onExport: () => void;
}

export function SimulationPanel({ running, onToggle, log, students, onExport }: SimulationPanelProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [log]);

  const presentCount = students.filter((s) => s.present).length;
  const absentCount = students.length - presentCount;

  return (
    <div className="white-card-lg overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-royal" />
          <h2 className="font-display text-sm font-bold text-slate-900">High-Traffic Input Simulator</h2>
          <span className="font-mono text-[11px] text-slate-500">
            {running ? 'Simulating peak entry...' : 'Idle'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onExport}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:shadow-card"
          >
            <Download className="h-4 w-4 text-emerald-mid" />
            Export Verified Attendance Summary Ledger (.CSV)
          </button>
          <button
            onClick={onToggle}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
              running
                ? 'border border-rose-500/30 bg-white text-rose-500 hover:bg-rose-50'
                : 'bg-gradient-to-r from-amber-light to-amber-rich text-white shadow-card-md hover:shadow-card-lg hover:scale-[1.02]'
            }`}
          >
            {running ? <Square className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
            {running ? 'Stop Simulation' : 'Execute Peak Campus Rush-Hour Traffic Simulation'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_1.4fr]">
        {/* Terminal feed */}
        <div className="rounded-xl border border-slate-200 bg-slate-100">
          <div className="border-b border-slate-200 px-3 py-2 section-label text-emerald-mid">
            Check-in Log Stream
          </div>
          <div className="h-64 overflow-auto p-3 font-mono text-[11px] leading-relaxed">
            {log.length === 0 && (
              <p className="text-slate-400">// Awaiting simulation start...</p>
            )}
            {log.map((e) => (
              <div key={e.id} className="flex items-center gap-2 border-b border-slate-200 py-1">
                <span className="text-slate-400">[{e.time}]</span>
                <span className="font-semibold text-emerald-mid">MATCH</span>
                <span className="text-slate-600">{e.studentId}</span>
                <span className="text-slate-900">{e.name}</span>
                <span className="ml-auto text-amber-rich">R={e.ratio.toFixed(2)}</span>
                <span className="text-emerald-mid">{e.confidence.toFixed(0)}%</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>

        {/* Live stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-card">
            <div className="section-label">Log Entries</div>
            <div className="mt-1 font-display text-2xl font-bold text-slate-900">{log.length}</div>
          </div>
          <div className="rounded-xl border border-emerald-bright/20 bg-emerald-50 p-3 shadow-card">
            <div className="section-label text-emerald-mid">Checked In</div>
            <div className="mt-1 font-display text-2xl font-bold text-emerald-mid">{presentCount}</div>
          </div>
          <div className="rounded-xl border border-amber-rich/20 bg-amber-50 p-3 shadow-card">
            <div className="section-label text-amber-rich">Absent</div>
            <div className="mt-1 font-display text-2xl font-bold text-amber-rich">{absentCount}</div>
          </div>
          <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-3 shadow-card sm:col-span-3">
            <div className="section-label">System Status</div>
            <div className="mt-1.5 flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${running ? 'bg-emerald-bright shadow-emerald-glow blink' : 'bg-slate-300'}`} />
              <span className={`text-sm font-semibold ${running ? 'text-emerald-mid' : 'text-slate-500'}`}>
                {running ? 'Peak Entry Simulation Active — Processing Queue' : 'Simulation Halted'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
