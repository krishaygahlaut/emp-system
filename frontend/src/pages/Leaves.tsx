import { useEffect, useState } from 'react';
import { Plus, FileText, Check, X } from 'lucide-react';
import api from '../services/api';
import type { Leave, Employee } from '../types';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const LEAVE_TYPES = ['Sick Leave', 'Casual Leave', 'Annual Leave', 'Unpaid Leave'];

export default function Leaves() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({ employee: '', type: 'Sick Leave', startDate: '', endDate: '', reason: '' });

  const fetchLeaves = async () => {
    try {
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/leaves', { params });
      setLeaves(data);
    } catch { toast.error('Failed to load leaves'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    api.get('/employees').then((r) => setEmployees(r.data)).catch(() => {});
  }, []);

  useEffect(() => { fetchLeaves(); }, [statusFilter]);

  const handleApply = async () => {
    if (!form.employee || !form.startDate || !form.endDate || !form.reason) {
      toast.error('Fill all fields'); return;
    }
    setSaving(true);
    try {
      await api.post('/leaves', form);
      toast.success('Leave applied');
      setModal(false);
      fetchLeaves();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const updateStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await api.put(`/leaves/${id}/status`, { status });
      toast.success(`Leave ${status.toLowerCase()}`);
      fetchLeaves();
    } catch { toast.error('Failed to update status'); }
  };

  const badge = (s: string) => {
    if (s === 'Approved') return <span className="badge-approved">{s}</span>;
    if (s === 'Rejected') return <span className="badge-rejected">{s}</span>;
    return <span className="badge-pending">{s}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Leave Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">{leaves.length} requests</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={15} /> Apply Leave
        </button>
      </div>

      <div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-auto">
          <option value="">All Statuses</option>
          {['Pending', 'Approved', 'Rejected'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : leaves.length === 0 ? (
          <div className="flex flex-col h-48 items-center justify-center text-slate-600">
            <FileText size={32} className="mb-2" />
            <p className="text-sm">No leave requests</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Employee', 'Type', 'From', 'To', 'Reason', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-xs text-slate-500 font-medium px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => {
                  const emp = l.employee as Employee;
                  return (
                    <tr key={l._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">{emp?.name}</p>
                        <p className="text-xs text-slate-500">{emp?.department}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{l.type}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{format(new Date(l.startDate), 'dd MMM yyyy')}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{format(new Date(l.endDate), 'dd MMM yyyy')}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs max-w-[150px] truncate">{l.reason}</td>
                      <td className="px-4 py-3">{badge(l.status)}</td>
                      <td className="px-4 py-3">
                        {l.status === 'Pending' && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateStatus(l._id, 'Approved')}
                              className="p-1.5 rounded hover:bg-emerald-500/10 text-slate-500 hover:text-emerald-400 transition-colors"
                            >
                              <Check size={13} />
                            </button>
                            <button
                              onClick={() => updateStatus(l._id, 'Rejected')}
                              className="p-1.5 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Apply Leave">
        <div className="space-y-3">
          <div>
            <label className="label">Employee *</label>
            <select value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} className="input">
              <option value="">Select employee...</option>
              {employees.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Leave Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input">
              {LEAVE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start Date *</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">End Date *</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Reason *</label>
            <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="input" rows={3} placeholder="Reason for leave..." />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleApply} disabled={saving} className="btn-primary">
            {saving ? 'Submitting...' : 'Submit Leave'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
