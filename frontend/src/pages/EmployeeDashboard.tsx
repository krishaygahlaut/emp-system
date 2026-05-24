import { useEffect, useState } from 'react';
import { CalendarCheck, FileText, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Profile {
  name: string;
  employeeId: string;
  department: string;
  position: string;
  status: string;
}

export default function EmployeeDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({ present: 0, absent: 0, pendingLeaves: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const now = new Date();
        const [profileRes, attRes, leaveRes] = await Promise.all([
          api.get('/employee-auth/me'),
          api.get('/attendance', { params: { month: now.getMonth() + 1, year: now.getFullYear() } }),
          api.get('/employee-auth/my-leaves'),
        ]);
        setProfile(profileRes.data);
        const att = attRes.data;
        setStats({
          present: att.filter((r: any) => r.status === 'Present').length,
          absent: att.filter((r: any) => r.status === 'Absent').length,
          pendingLeaves: leaveRes.data.filter((l: any) => l.status === 'Pending').length,
        });
      } catch { toast.error('Failed to load dashboard'); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" /></div>;

  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long' });

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="card p-5 flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-emerald-600/20 flex items-center justify-center flex-shrink-0">
          <User size={24} className="text-emerald-400" />
        </div>
        <div>
          <p className="text-lg font-semibold text-white">{profile?.name}</p>
          <p className="text-sm text-slate-400">{profile?.position} · {profile?.department}</p>
          <p className="text-xs text-slate-600 font-mono mt-0.5">{profile?.employeeId}</p>
        </div>
        <div className="ml-auto">
          <span className="badge-active">{profile?.status}</span>
        </div>
      </div>

      <div>
        <p className="text-xs text-slate-500 mb-3 uppercase tracking-wide">{monthName} Overview</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Days Present', value: stats.present, color: 'text-emerald-400' },
            { label: 'Days Absent', value: stats.absent, color: 'text-red-400' },
            { label: 'Pending Leaves', value: stats.pendingLeaves, color: 'text-amber-400' },
          ].map((s) => (
            <div key={s.label} className="card p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-slate-500 mb-3 uppercase tracking-wide">Quick Actions</p>
        <div className="grid grid-cols-1 gap-3">
          <Link to="/employee/attendance" className="card p-4 flex items-center gap-4 hover:bg-slate-800 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CalendarCheck size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Mark Today's Attendance</p>
              <p className="text-xs text-slate-500">Take a selfie and mark present or absent</p>
            </div>
          </Link>
          <Link to="/employee/leaves" className="card p-4 flex items-center gap-4 hover:bg-slate-800 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <FileText size={18} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Apply for Leave</p>
              <p className="text-xs text-slate-500">Submit sick leave with medical certificate</p>
            </div>
          </Link>
          <Link to="/employee/schedule" className="card p-4 flex items-center gap-4 hover:bg-slate-800 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Clock size={18} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">View My Schedule</p>
              <p className="text-xs text-slate-500">Check your assigned shifts</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
