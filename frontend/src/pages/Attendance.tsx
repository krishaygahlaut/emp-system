import { useEffect, useState } from 'react';
import { Plus, CalendarCheck } from 'lucide-react';
import api from '../services/api';
import type { Attendance, Employee } from '../types';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

export default function AttendancePage() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [form, setForm] = useState({ employee: '', date: new Date().toISOString().split('T')[0], status: 'Present', checkIn: '', checkOut: '', notes: '' });

  const fetchRecords = async () => {
    try {
      const { data } = await api.get('/attendance', { params: { date: dateFilter } });
      setRecords(data);
    } catch { toast.error('Failed to load attendance'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    api.get('/employees').then((r) => setEmployees(r.data)).catch(() => {});
  }, []);

  useEffect(() => { fetchRecords(); }, [dateFilter]);

  const handleMark = async () => {
    if (!form.employee) { toast.error('Select an employee'); return; }
    setSaving(true);
    try {
      await api.post('/attendance', form);
      toast.success('Attendance marked');
      setModal(false);
      fetchRecords();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const statusBadge = (s: string) => {
    if (s === 'Present') return <span className="badge-active">{s}</span>;
    if (s === 'Absent') return <span className="badge-inactive">{s}</span>;
    return <span className="badge-leave">{s}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Attendance</h1>
          <p className="text-sm text-slate-500 mt-0.5">Daily records</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={15} /> Mark Attendance
        </button>
      </div>

      <div className="flex gap-2">
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="input w-auto" />
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col h-48 items-center justify-center text-slate-600">
            <CalendarCheck size={32} className="mb-2" />
            <p className="text-sm">No records for this date</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Employee', 'Department', 'Status', 'Check In', 'Check Out', 'Notes'].map((h) => (
                    <th key={h} className="text-left text-xs text-slate-500 font-medium px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r) => {
                  const emp = r.employee as Employee;
                  return (
                    <tr key={r._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{emp?.name}</p>
                        <p className="text-xs text-slate-500">{emp?.employeeId}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{emp?.department}</td>
                      <td className="px-4 py-3">{statusBadge(r.status)}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{r.checkIn || '—'}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{r.checkOut || '—'}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{r.notes || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Mark Attendance">
        <div className="space-y-3">
          <div>
            <label className="label">Employee *</label>
            <select value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} className="input">
              <option value="">Select employee...</option>
              {employees.map((e) => <option key={e._id} value={e._id}>{e.name} ({e.employeeId})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
                {['Present', 'Absent', 'Half-day'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Check In</label>
              <input type="time" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Check Out</label>
              <input type="time" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input" placeholder="Optional notes..." />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleMark} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Mark Attendance'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
