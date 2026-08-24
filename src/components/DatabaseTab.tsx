import { useMemo, useState } from 'react';
import { Search, Database, CheckCircle2, Circle, UserPlus, Fingerprint } from 'lucide-react';
import type { StudentProfile } from '@/data/students';
import { FaceCapture } from '@/components/FaceCapture';

interface DatabaseTabProps {
  students: StudentProfile[];
  recentlyMatched: Set<string>;
  onEnroll: (name: string, regNo: string, ratio: number, descriptor: number[]) => void;
}

export function DatabaseTab({ students, recentlyMatched, onEnroll }: DatabaseTabProps) {
  const [query, setQuery] = useState('');
  const [enrollName, setEnrollName] = useState('');
  const [enrollReg, setEnrollReg] = useState('');
  const [capturedRatio, setCapturedRatio] = useState<number | null>(null);
  const [capturedDescriptor, setCapturedDescriptor] = useState<number[] | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toUpperCase().includes(q) ||
        s.id.toUpperCase().includes(q) ||
        s.regNo.includes(q) ||
        s.section.toUpperCase().includes(q),
    );
  }, [students, query]);

  const handleCaptured = (descriptor: number[], ratio: number) => {
    setCapturedDescriptor(descriptor);
    setCapturedRatio(ratio);
  };

  const handleEnroll = () => {
    if (!enrollName.trim() || !enrollReg.trim() || capturedRatio === null || !capturedDescriptor) return;
    onEnroll(enrollName.trim().toUpperCase(), enrollReg.trim(), capturedRatio, capturedDescriptor);
    setEnrollName('');
    setEnrollReg('');
    setCapturedRatio(null);
    setCapturedDescriptor(null);
  };

  return (
    <div className="space-y-4">
      {/* Enroll New Student Profile module */}
      <div className="white-card-lg overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
          <UserPlus className="h-4 w-4 text-royal" />
          <h2 className="font-display text-sm font-bold text-slate-900">Enroll New Student Profile</h2>
        </div>
        <div className="grid gap-4 p-4 lg:grid-cols-[1fr_1fr]">
          <div>
            <label className="section-label mb-1 block">Student Name</label>
            <input
              value={enrollName}
              onChange={(e) => setEnrollName(e.target.value)}
              placeholder="e.g. A. RAHMAN"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-royal focus:ring-2 focus:ring-royal/15 focus:outline-none"
            />
          </div>
          <div>
            <label className="section-label mb-1 block">Registration Number</label>
            <input
              value={enrollReg}
              onChange={(e) => setEnrollReg(e.target.value)}
              placeholder="e.g. 0014380"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-royal focus:ring-2 focus:ring-royal/15 focus:outline-none"
            />
          </div>
        </div>
        <div className="grid gap-4 px-4 pb-4 lg:grid-cols-[1fr_auto]">
          <div>
            <label className="section-label mb-1 block">Biometric Enrollment</label>
            <FaceCapture
              captured={capturedDescriptor !== null}
              onCaptured={handleCaptured}
              onClear={() => {
                setCapturedDescriptor(null);
                setCapturedRatio(null);
              }}
            />
          </div>
          <div className="flex flex-col justify-end">
            <button
              onClick={handleEnroll}
              disabled={!enrollName.trim() || !enrollReg.trim() || capturedRatio === null}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-royal to-accent-blue px-4 py-2 text-sm font-bold text-white shadow-card-md transition-all hover:shadow-card-lg hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Fingerprint className="h-4 w-4" />
              Enroll Profile
            </button>
          </div>
        </div>
        {capturedRatio !== null && (
          <div className="mx-4 mb-4 flex items-center gap-3 rounded-lg border border-emerald-bright/25 bg-emerald-50 px-4 py-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-mid" />
            <span className="text-sm text-slate-700">Geometric ratio measured from live landmarks:</span>
            <span className="font-mono text-sm font-bold text-emerald-mid">R = {capturedRatio.toFixed(2)}</span>
            <span className="text-xs text-slate-400">— fill in name &amp; reg. no. above, then enroll</span>
          </div>
        )}
      </div>

      {/* Database Records table */}
      <div className="white-card-lg overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-royal" />
            <h2 className="font-display text-sm font-bold text-slate-900">System Database Records</h2>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-500">
              {filtered.length} Records
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, ID, Reg. No..."
              className="w-64 max-w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 font-mono text-[11px] text-slate-900 placeholder:text-slate-400 focus:border-royal focus:ring-2 focus:ring-royal/15 focus:outline-none"
            />
          </div>
        </div>

        <div className="max-h-[440px] overflow-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="section-label border-b border-slate-200">
                <th className="px-4 py-2.5">Student ID</th>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Registration No.</th>
                <th className="px-4 py-2.5">Class Section</th>
                <th className="px-4 py-2.5">Baseline Facial Ratio</th>
                <th className="px-4 py-2.5">Biometric</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filtered.map((s, i) => {
                const flash = recentlyMatched.has(s.id);
                const alt = i % 2 === 1;
                // Highlight rows whose baseline falls in the modal class 1.35-1.40
                const isModalRow = s.baselineIndex >= 1.35 && s.baselineIndex < 1.40;
                return (
                  <tr
                    key={s.id}
                    className={`border-b border-slate-200 transition-colors ${flash ? 'row-flash' : ''} ${
                      isModalRow
                        ? 'bg-emerald-mint'
                        : s.present
                        ? 'bg-emerald-50/40'
                        : alt
                        ? 'bg-slate-100'
                        : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <td className={`px-4 py-3 font-mono text-xs font-medium ${isModalRow ? 'text-emerald-deep' : 'text-slate-700'}`}>{s.id}</td>
                    <td className={`px-4 py-3 font-semibold ${isModalRow ? 'text-emerald-deep' : 'text-slate-900'}`}>{s.name}</td>
                    <td className={`px-4 py-3 font-mono text-xs ${isModalRow ? 'text-emerald-deep' : 'text-slate-600'}`}>{s.regNo}</td>
                    <td className={`px-4 py-3 ${isModalRow ? 'text-emerald-deep' : 'text-slate-600'}`}>{s.section}</td>
                    <td className={`px-4 py-3 font-mono text-xs font-semibold ${isModalRow ? 'text-emerald-deep' : 'text-amber-rich'}`}>{s.baselineIndex.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {s.descriptor ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-royal/10 px-2 py-0.5 text-xs font-semibold text-royal">
                          Enrolled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-400">
                          No face data
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {s.present ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-mid">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Present
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-500">
                          <Circle className="h-3.5 w-3.5" /> Absent
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                    No matching records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
