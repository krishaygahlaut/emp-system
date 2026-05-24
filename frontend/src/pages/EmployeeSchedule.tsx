import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function EmployeeSchedule() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/employee-auth/my-schedule')
      .then((r) => setSchedules(r.data))
      .catch(() => toast.error('Failed to load schedule'))
      .finally(() => setLoading(false));
  }, []);

  const shiftColor = (s: string) => {
    const m: Record<string, string> = {
      Morning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      Afternoon: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      Night: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
      Flexible: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    };
    return `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${m[s] || ''}`;
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-white">My Schedule</h1>
        <p className="text-sm text-slate-500 mt-0.5">Your assigned shifts</p>
      </div>
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" /></div>
        ) : schedules.length === 0 ? (
          <div className="flex flex-col h-48 items-center justify-center text-slate-600">
            <Clock size={32} className="mb-2" /><p className="text-sm">No schedules assigned yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {schedules.map((s) => (
              <div key={s._id} className="flex items-center gap-4 px-4 py-3">
                <div className="text-center w-12 flex-shrink-0">
                  <p className="text-xs text-slate-500">{format(new Date(s.date), 'EEE')}</p>
                  <p className="text-lg font-bold text-white">{format(new Date(s.date), 'dd')}</p>
                  <p className="text-xs text-slate-500">{format(new Date(s.date), 'MMM')}</p>
                </div>
                <div className="flex-1">
                  <span className={shiftColor(s.shift)}>{s.shift}</span>
                  <p className="text-xs text-slate-400 mt-1 font-mono">{s.startTime} → {s.endTime}</p>
                  {s.notes && <p className="text-xs text-slate-500 mt-0.5">{s.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
