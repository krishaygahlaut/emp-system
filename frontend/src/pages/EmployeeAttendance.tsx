import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function EmployeeAttendance() {
  const [records, setRecords] = useState<any[]>([]);
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [status, setStatus] = useState<'Present' | 'Absent'>('Present');
  const today = new Date();

  const fetchData = async () => {
    try {
      const now = new Date();
      const { data } = await api.get('/attendance', { params: { month: now.getMonth() + 1, year: now.getFullYear() } });
      const rec = data.find((r: any) => new Date(r.date).toDateString() === today.toDateString());
      setTodayRecord(rec || null);
      setRecords(data);
    } catch { toast.error('Failed to load attendance'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleMark = async () => {
    setMarking(true);
    try {
      const formData = new FormData();
      formData.append('status', status);
      await api.post('/attendance/selfie', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(`Marked ${status} successfully!`);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setMarking(false); }
  };

  const statusIcon = (s: string) => {
    if (s === 'Present') return <CheckCircle size={14} className="text-emerald-400" />;
    if (s === 'Absent') return <XCircle size={14} className="text-red-400" />;
    return <Clock size={14} className="text-amber-400" />;
  };

  const statusBadge = (s: string) => {
    if (s === 'Present') return <span className="badge-active">{s}</span>;
    if (s === 'Absent') return <span className="badge-inactive">{s}</span>;
    return <span className="badge-leave">{s}</span>;
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" /></div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-white">My Attendance</h1>
        <p className="text-sm text-slate-500 mt-0.5">Today: {format(today, 'dd MMM yyyy')}</p>
      </div>
      <div className="card p-5">
        {todayRecord ? (
          <div className="flex items-center gap-4">
            <div className={`h-14 w-14 rounded-full flex items-center justify-center ${todayRecord.status === 'Present' ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}>
              {statusIcon(todayRecord.status)}
            </div>
            <div>
              <p className="text-white font-semibold">Already marked for today</p>
              <div className="flex items-center gap-2 mt-1">
                {statusBadge(todayRecord.status)}
                {todayRecord.checkIn && <span className="text-xs text-slate-500">Check-in: {todayRecord.checkIn}</span>}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-white font-medium">Mark your attendance for today</p>
            <div className="flex gap-2">
              {(['Present', 'Absent'] as const).map((s) => (
                <button key={s} type="button" onClick={() => setStatus(s)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${status === s ? s === 'Present' ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400' : 'bg-red-500/15 border-red-500/50 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                  {s === 'Present' ? '✓ Present' : '✗ Absent'}
                </button>
              ))}
            </div>
            <button onClick={handleMark} disabled={marking} className="btn-primary w-full">
              {marking ? 'Submitting...' : `Mark ${status}`}
            </button>
          </div>
        )}
      </div>
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800">
          <h2 className="text-sm font-medium text-white">This Month</h2>
        </div>
        {records.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-slate-600 text-sm">No records yet</div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {records.map((r) => (
              <div key={r._id} className="flex items-center gap-3 px-4 py-3">
                <div>{statusIcon(r.status)}</div>
                <div className="flex-1">
                  <p className="text-sm text-white">{format(new Date(r.date), 'EEE, dd MMM yyyy')}</p>
                  {r.checkIn && <p className="text-xs text-slate-500">Check-in: {r.checkIn}</p>}
                </div>
                {statusBadge(r.status)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
