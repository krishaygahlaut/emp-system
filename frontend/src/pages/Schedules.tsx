import { useEffect, useState } from 'react';
import { Plus, Clock } from 'lucide-react';
import api from '../services/api';
import type { Schedule, Employee } from '../types';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const SHIFTS = ['Morning', 'Afternoon', 'Night', 'Flexible'];
const SHIFT_DEFAULTS: Record<string, { start: string; end: string }> = {
  Morning: { start: '09:00', end: '17:00' },
  Afternoon: { start: '13:00', end: '21:00' },
  Night: { start: '21:00', end: '05:00' },
  Flexible: { start: '10:00', end: '18:00' },
};

export default function Schedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [form, setForm] = useState({ employee: '', shift: 'Morning', startTime: '09:00', endTime: '17:00', date: '', notes: '' });

  const fetchSchedules = async () => {
    try {
      const params: any = {};
      if (dateFilter) params.date = dateFilter;
      const { data } = await api.get('/schedules', { params });
      setSchedules(data);
    } catch { toast.error('Failed to load schedules'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    api.get('/employees').then((r) => setEmployees(r.data)).catch(() => {});
  }, []);

  useEffect(() => { fetchSchedules(); }, [dateFilter]);

  const handleShiftChange = (shift: string) => {
    const def = SHIFT_DEFAULTS[shift];
    setForm({ ...form, shift, startTime: def.start, endTime: def.end });
  };

  const handleAssign = async () => {
    if (!form.employee || !form.date) { toast.error('Select employee and date'); return; }
    setSaving(true);
    try {
      await api.post('/schedules', form);
      toast.success('Schedule assigned');
      setModal(false);
      fetchSchedules();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const shiftColor = (s: string) => {
    const m: Record<string, string> = {
      Morning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      Afternoon: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      Night: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
      Flexible: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    };
    return `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${m[s] || 'text-slate-400 bg-slate-500/10 border-slate-500/20'}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Schedules</h1>
          <p className="text-sm text-slate-500 mt-0.5">Shift assignments</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={15} /> Assign Shift
        </button>
      </div>

      <div>
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="input w-auto" placeholder="Filter by date" />
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : schedules.length === 0 ? (
          <div className="flex flex-col h-48 items-center justify-center text-slate-600">
            <Clock size={32} className="mb-2" />
            <p className="text-sm">No schedules found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Employee', 'Date', 'Shift', 'Start Time', 'End Time', 'Notes'].map((h) => (
                    <th key={h} className="text-left text-xs text-slate-500 font-medium px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => {
                  const emp = s.employee as Employee;
                  return (
                    <tr key={s._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{emp?.name}</p>
                        <p className="text-xs text-slate-500">{emp?.department}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{format(new Date(s.date), 'dd MMM yyyy')}</td>
                      <td className="px-4 py-3"><span className={shiftColor(s.shift)}>{s.shift}</span></td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">{s.startTime}</td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">{s.endTime}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{s.notes || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Assign Shift">
        <div className="space-y-3">
          <div>
            <label className="label">Employee *</label>
            <select value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} className="input">
              <option value="">Select employee...</option>
              {employees.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date *</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Shift</label>
              <select value={form.shift} onChange={(e) => handleShiftChange(e.target.value)} className="input">
                {SHIFTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Start Time</label>
              <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">End Time</label>
              <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input" placeholder="Optional notes..." />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleAssign} disabled={saving} className="btn-primary">
            {saving ? 'Assigning...' : 'Assign Shift'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
