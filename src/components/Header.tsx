import { GraduationCap, ShieldCheck, Wifi, Activity } from 'lucide-react';
import { AUTH_USER } from '@/data/students';

export function Header({ systemStatus }: { systemStatus: 'ONLINE' | 'STANDBY' }) {
  return (
    <header className="sticky top-0 z-30 bg-royal shadow-card-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 lg:px-8">
        {/* Institutional badge */}
        <div className="flex items-center gap-3">
          <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-white/15 backdrop-blur">
            <GraduationCap className="h-6 w-6 text-white" />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-bright shadow-emerald-glow blink" />
          </div>
          <div>
            <h1 className="font-display text-base font-extrabold tracking-tight text-white lg:text-lg">
              AMBASSADOR SCHOOL, DUBAI
            </h1>
            <p className="text-xs font-medium italic text-royal-50/80">
              {AUTH_USER.motto}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status pills */}
          <div className="hidden items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur sm:flex">
            <Wifi className="h-3.5 w-3.5 text-white/90" />
            <span className="font-mono text-[11px] font-medium tracking-wide text-white/90">
              Secure Link
            </span>
          </div>
          <div className="hidden items-center gap-2 rounded-xl border border-emerald-bright/40 bg-emerald-bright/15 px-3 py-1.5 backdrop-blur sm:flex">
            <Activity className="h-3.5 w-3.5 text-emerald-light" />
            <span className="font-mono text-[11px] font-medium tracking-wide text-emerald-light">
              SYS {systemStatus}
            </span>
          </div>

          {/* White identity capsule nested in blue bar */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 shadow-card">
            <div className="relative">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-royal to-accent-blue text-sm font-bold text-white">
                SY
              </div>
              <ShieldCheck className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-white p-0.5 text-emerald-mid" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-slate-900">{AUTH_USER.name}</div>
              <div className="font-mono text-[11px] text-slate-500">
                Reg. {AUTH_USER.regNo}
              </div>
              <div className="font-mono text-[11px] font-semibold text-royal">
                {AUTH_USER.grade}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
