import { Users, UserCheck, UserX, Timer } from 'lucide-react';

interface StatsGridProps {
  total: number;
  present: number;
  absent: number;
  latency: number;
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent: 'royal' | 'emerald' | 'amber' | 'indigo';
}) {
  const colorMap = {
    royal: {
      iconBg: 'bg-royal',
      iconText: 'text-white',
      valueText: 'text-royal',
      ring: 'ring-royal/15',
    },
    emerald: {
      iconBg: 'bg-gradient-to-br from-emerald-bright to-emerald-mid',
      iconText: 'text-white',
      valueText: 'text-emerald-mid',
      ring: 'ring-emerald-bright/15',
    },
    amber: {
      iconBg: 'bg-gradient-to-br from-amber-light to-amber-rich',
      iconText: 'text-white',
      valueText: 'text-amber-rich',
      ring: 'ring-amber-light/15',
    },
    indigo: {
      iconBg: 'bg-gradient-to-br from-indigo-light to-indigo-deep',
      iconText: 'text-white',
      valueText: 'text-indigo-deep',
      ring: 'ring-indigo-light/15',
    },
  }[accent];

  return (
    <div className="white-card group p-4 transition-all hover:shadow-card-lg hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div>
          <p className="section-label">{label}</p>
          <p className={`mt-1.5 font-display text-3xl font-extrabold tracking-tight ${colorMap.valueText} animate-count-pop`}>
            {value}
          </p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">{sub}</p>
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-xl ${colorMap.iconBg} ${colorMap.iconText} ring-2 ${colorMap.ring} shadow-card`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function StatsGrid({ total, present, absent, latency }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      <StatCard
        icon={<Users className="h-5 w-5" />}
        label="Total Database Records"
        value={String(total)}
        sub="Active Student Profiles"
        accent="royal"
      />
      <StatCard
        icon={<UserCheck className="h-5 w-5" />}
        label="Checked-In Today"
        value={String(present)}
        sub="Verified Biometric Match"
        accent="emerald"
      />
      <StatCard
        icon={<UserX className="h-5 w-5" />}
        label="Absent Queue"
        value={String(absent)}
        sub="Pending Check-in"
        accent="amber"
      />
      <StatCard
        icon={<Timer className="h-5 w-5" />}
        label="Core Latency Vector"
        value={`${latency.toFixed(3)} ms`}
        sub="Database Match Cycle"
        accent="indigo"
      />
    </div>
  );
}
