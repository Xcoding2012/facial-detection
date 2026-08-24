import { useCallback, useEffect, useRef, useState } from 'react';
import { ScanFace, Database, BarChart3, Zap, Terminal } from 'lucide-react';
import { Header } from '@/components/Header';
import { StatsGrid } from '@/components/StatsGrid';
import { CameraView } from '@/components/CameraView';
import { TelemetryPanel } from '@/components/TelemetryPanel';
import { DatabaseTab } from '@/components/DatabaseTab';
import { ChartsTab } from '@/components/ChartsTab';
import { SimulationPanel, type LogEntry } from '@/components/SimulationPanel';
import { useTelemetry } from '@/hooks/useTelemetry';
import { STUDENTS, TOTAL_STUDENTS, type StudentProfile } from '@/data/students';

type Tab = 'scanner' | 'database' | 'simulation' | 'charts';

function nowTime() {
  return new Date().toLocaleTimeString('en-GB', { hour12: false });
}

function todayDate() {
  return new Date().toLocaleDateString('en-GB');
}

function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    [659, 784, 988].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.18);
      o.start(ctx.currentTime + i * 0.08);
      o.stop(ctx.currentTime + i * 0.08 + 0.2);
    });
  } catch {
    // ignore
  }
}

function App() {
  const [tab, setTab] = useState<Tab>('scanner');
  const [cameraActive, setCameraActive] = useState(false);
  const [students, setStudents] = useState<StudentProfile[]>(STUDENTS);
  const [recentlyMatched, setRecentlyMatched] = useState<Set<string>>(new Set());
  const [simRunning, setSimRunning] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const logIdRef = useRef(0);
  const enrollIdRef = useRef(21);
  const telemetry = useTelemetry(cameraActive);

  const handleFaceMatch = useCallback((studentId: string, ratio: number) => {
    setStudents((prev) => {
      const student = prev.find((s) => s.id === studentId);
      if (!student) return prev;
      const entry: LogEntry = {
        id: logIdRef.current++,
        studentId: student.id,
        name: student.name,
        regNo: student.regNo,
        section: student.section,
        time: nowTime(),
        ratio,
        confidence: 96 + Math.random() * 4,
      };
      setLog((l) => [...l.slice(-40), entry]);
      return prev.map((s) =>
        s.id === studentId ? { ...s, present: true, checkInTime: s.checkInTime ?? nowTime() } : s,
      );
    });
    setRecentlyMatched((prev) => new Set(prev).add(studentId));
    setTimeout(() => {
      setRecentlyMatched((prev) => {
        const next = new Set(prev);
        next.delete(studentId);
        return next;
      });
    }, 1800);
  }, []);

  const handleEnroll = useCallback((name: string, regNo: string, ratio: number, descriptor: number[]) => {
    const id = `P-${String(enrollIdRef.current++).padStart(2, '0')}`;
    const newStudent: StudentProfile = {
      id,
      name,
      regNo,
      section: '9-A',
      baselineIndex: ratio,
      present: false,
      checkInTime: null,
      descriptor,
    };
    setStudents((prev) => [...prev, newStudent]);
    setRecentlyMatched((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setRecentlyMatched((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 1800);
  }, []);

  const handleExportCSV = useCallback(() => {
    const headers = ['Student ID', 'Name', 'Registration No.', 'Class Section', 'Baseline Facial Ratio', 'Status', 'Check-in Time'];
    const rows = students.map((s) =>
      [s.id, s.name, s.regNo, s.section, s.baselineIndex.toFixed(2), s.present ? 'Present' : 'Absent', s.checkInTime ?? '—'].join(','),
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_ledger_${todayDate().replace(/\//g, '-')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [students]);

  useEffect(() => {
    if (!simRunning) return;
    const absentStudents = students.filter((s) => !s.present);
    if (absentStudents.length === 0) {
      setSimRunning(false);
      return;
    }
    const id = setInterval(() => {
      setStudents((prev) => {
        const absent = prev.filter((s) => !s.present);
        if (absent.length === 0) return prev;
        const target = absent[Math.floor(Math.random() * absent.length)];
        const ratio = Number((1.2 + Math.random() * 0.3).toFixed(2));
        const confidence = 90 + Math.random() * 10;
        const entry: LogEntry = {
          id: logIdRef.current++,
          studentId: target.id,
          name: target.name,
          regNo: target.regNo,
          section: target.section,
          time: nowTime(),
          ratio,
          confidence,
        };
        setLog((l) => [...l.slice(-40), entry]);
        setRecentlyMatched((prev) => new Set(prev).add(target.id));
        setTimeout(() => {
          setRecentlyMatched((prev) => {
            const next = new Set(prev);
            next.delete(target.id);
            return next;
          });
        }, 1600);
        playChime();
        return prev.map((s) =>
          s.id === target.id ? { ...s, present: true, checkInTime: nowTime() } : s,
        );
      });
    }, 900);
    return () => clearInterval(id);
  }, [simRunning, students]);

  const presentCount = students.filter((s) => s.present).length;
  const absentCount = students.length - presentCount;

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'scanner', label: 'Biometric Scanner', icon: <ScanFace className="h-4 w-4" /> },
    { id: 'database', label: 'System Database Records', icon: <Database className="h-4 w-4" /> },
    { id: 'simulation', label: 'Traffic Simulator', icon: <Zap className="h-4 w-4" /> },
    { id: 'charts', label: 'Statistical Analytics', icon: <BarChart3 className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header systemStatus={cameraActive ? 'ONLINE' : 'STANDBY'} />

      {/* Tab nav */}
      <nav className="sticky top-[61px] z-20 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 lg:px-8">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-all ${
                tab === t.id
                  ? 'border-royal text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl space-y-4 px-4 py-5 lg:px-8 lg:py-6">
        <StatsGrid
          total={students.length}
          present={presentCount}
          absent={absentCount}
          latency={telemetry.latency}
        />

        {tab === 'scanner' && (
          <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <CameraView
              active={cameraActive}
              onToggle={() => setCameraActive((v) => !v)}
              telemetry={telemetry}
              students={students}
              onMatch={handleFaceMatch}
            />
            <TelemetryPanel telemetry={telemetry} active={cameraActive} />
          </div>
        )}

        {tab === 'database' && (
          <DatabaseTab students={students} recentlyMatched={recentlyMatched} onEnroll={handleEnroll} />
        )}

        {tab === 'simulation' && (
          <div className="space-y-4">
            <SimulationPanel
              running={simRunning}
              onToggle={() => setSimRunning((v) => !v)}
              log={log}
              students={students}
              onExport={handleExportCSV}
            />
            <DatabaseTab students={students} recentlyMatched={recentlyMatched} onEnroll={handleEnroll} />
          </div>
        )}

        {tab === 'charts' && <ChartsTab />}

        {/* Footer ticker */}
        <div className="white-card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 font-mono text-[11px] text-slate-500">
            <Terminal className="h-3.5 w-3.5 shrink-0 text-royal" />
            <div className="relative flex-1 overflow-hidden">
              <div className="ticker whitespace-nowrap">
                Sentinel-Vision v4.3.1 · Executive Biometric Engineering Portfolio · Ambassador School Dubai · Inspire, Inquire, Innovate · Edge Detection: Sobel Operator · Scale Invariant: R = A/B · Modal Class Interval 1.35-1.40 · Modal Frequency: 9 · 15-Point Landmark Vector Tracking · All Systems Nominal
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
