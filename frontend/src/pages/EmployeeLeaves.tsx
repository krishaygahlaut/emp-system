import { useState, useEffect } from 'react';
import { Plus, FileText, X, Upload } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const LEAVE_TYPES = ['Sick Leave', 'Casual Leave', 'Annual Leave', 'Unpaid Leave'];

export default function EmployeeLeaves() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: 'Casual Leave', startDate: '', endDate: '', reason: '' });
  const [certFile, setCertFile] = useState<File | null>(null);

  const fetchLeaves = async () => {
    try {
      const { data } = await api.get('/employee-auth/my-leaves');
      setLeaves(data);
    } catch { toast.error('Failed to load leaves'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleApply = async () => {
    if (!form.startDate || !form.endDate || !form.reason) { toast.error('Fill all fields'); return; }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('type', form.type);
      formData.append('startDate', form.startDate);
      formData.append('endDate', form.endDate);
      formData.append('reason', form.reason);
      if (certFile) formData.append('certificate', certFile);
      await api.post('/leaves/apply', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Leave submitted');
      setModal(false);
      setCertFile(null);
      setForm({ type: 'Casual Leave', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setSaving(false); }
  };

  const badge = (s: string) => {
    if (s === 'Approved') return <span className="badge-approved">{s}</span>;
    if (s === 'Rejected') return <span className="badge-rejected">{s}</span>;
    return <span className="badge-pending">{s}</span>;
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">My Leaves</h1>
          <p className="text-sm text-slate-500 mt-0.5">{leaves.length} requests</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={15} /> Apply Leave
        </button>
      </div>
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" /></div>
        ) : leaves.length === 0 ? (
          <div className="flex flex-col h-48 items-center justify-center text-slate-600">
            <FileText size={32} className="mb-2" /><p className="text-sm">No leave requests yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {leaves.map((l) => (
              <div key={l._id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">{l.type}</p>
                      {badge(l.status)}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{format(new Date(l.startDate), 'dd MMM')} → {format(new Date(l.endDate), 'dd MMM yyyy')}</p>
                    <p className="text-xs text-slate-400 mt-1">{l.reason}</p>
                    {l.reviewNote && <p className="text-xs text-amber-400 mt-1">Note: {l.reviewNote}</p>}
                  </div>
                  {l.certificateUrl && (
                    <a href={l.certificateUrl} target="_blank" rel="noopener noreferrer">
                      <img src={l.certificateUrl} alt="Certificate" className="h-12 w-12 rounded-lg object-cover border border-slate-700" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Apply for Leave">
        <div className="space-y-3">
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
          <div>
            <label className="label">Certificate {form.type === 'Sick Leave' ? <span className="text-red-400">*</span> : '(optional)'}</label>
            {certFile ? (
              <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700">
                <FileText size={20} className="text-slate-400" />
                <p className="text-sm text-white flex-1 truncate">{certFile.name}</p>
                <button type="button" onClick={() => setCertFile(null)} className="text-slate-500 hover:text-red-400"><X size={15} /></button>
              </div>
            ) : (
              <label className="w-full border-2 border-dashed border-slate-700 rounded-xl p-4 flex flex-col items-center gap-1 hover:border-indigo-500 cursor-pointer transition-colors">
                <Upload size={20} className="text-slate-500" />
                <p className="text-sm text-slate-400">Click to upload photo or PDF</p>
                <input type="file" accept="image/*,.pdf" onChange={(e) => setCertFile(e.target.files?.[0] || null)} className="hidden" />
              </label>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={() => setModal(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleApply} disabled={saving} className="btn-primary">{saving ? 'Submitting...' : 'Submit Leave'}</button>
        </div>
      </Modal>
    </div>
  );
}
