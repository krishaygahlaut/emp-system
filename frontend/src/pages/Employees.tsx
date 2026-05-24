import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Filter, KeyRound } from 'lucide-react';
import api from '../services/api';
import type { Employee } from '../types';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Design'];
const STATUSES = ['Active', 'Inactive', 'On Leave'];

const empty = { name: '', email: '', phone: '', department: '', position: '', joiningDate: '', status: 'Active' };

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loginModal, setLoginModal] = useState<Employee | null>(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginSaving, setLoginSaving] = useState(false);

  const fetchEmployees = async () => {
    try {
      const params: any = {};
      if (search) params.search = search;
      if (deptFilter) params.department = deptFilter;
      if (statusFilter) params.status = statusFilter;
      const { data } = await api.get('/employees', { params });
      setEmployees(data);
    } catch {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, [search, deptFilter, statusFilter]);

  const openAdd = () => { setForm(empty); setModal('add'); };
  const openEdit = (emp: Employee) => {
    setSelected(emp);
    setForm({
      name: emp.name, email: emp.email, phone: emp.phone,
      department: emp.department, position: emp.position,
      joiningDate: emp.joiningDate.split('T')[0],
      status: emp.status,
    });
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.name || !form.email || !form.department || !form.position || !form.joiningDate) {
      toast.error('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      if (modal === 'add') {
        await api.post('/employees', form);
        toast.success('Employee added');
      } else {
        await api.put(`/employees/${selected?._id}`, form);
        toast.success('Employee updated');
      }
      setModal(null);
      fetchEmployees();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/employees/${deleteId}`);
      toast.success('Employee deleted');
      setDeleteId(null);
      fetchEmployees();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleCreateLogin = async () => {
    if (!loginModal || !loginForm.email || !loginForm.password) {
      toast.error('Email and password required'); return;
    }
    setLoginSaving(true);
    try {
      await api.post('/employee-auth/register', {
        employeeId: loginModal._id,
        email: loginForm.email,
        password: loginForm.password,
      });
      toast.success('Login created — employee can now sign in at /employee/login');
      setLoginModal(null);
      setLoginForm({ email: '', password: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create login');
    } finally {
      setLoginSaving(false);
    }
  };

  const statusBadge = (s: string) => {
    if (s === 'Active') return <span className="badge-active">{s}</span>;
    if (s === 'Inactive') return <span className="badge-inactive">{s}</span>;
    return <span className="badge-leave">{s}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Employees</h1>
          <p className="text-sm text-slate-500 mt-0.5">{employees.length} total</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={15} /> Add Employee
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-8"
            placeholder="Search name, email, ID..."
          />
        </div>
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="input w-auto">
          <option value="">All Departments</option>
          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-auto">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : employees.length === 0 ? (
          <div className="flex flex-col h-48 items-center justify-center text-slate-600">
            <Filter size={32} className="mb-2" />
            <p className="text-sm">No employees found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {['ID', 'Name', 'Department', 'Position', 'Joining Date', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-xs text-slate-500 font-medium px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{emp.employeeId}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-white">{emp.name}</p>
                        <p className="text-xs text-slate-500">{emp.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{emp.department}</td>
                    <td className="px-4 py-3 text-slate-300">{emp.position}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {format(new Date(emp.joiningDate), 'dd MMM yyyy')}
                    </td>
                    <td className="px-4 py-3">{statusBadge(emp.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(emp)} title="Edit" className="p-1.5 rounded hover:bg-slate-700 text-slate-500 hover:text-slate-200 transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setDeleteId(emp._id)} title="Delete" className="p-1.5 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                        <button onClick={() => { setLoginModal(emp); setLoginForm({ email: emp.email, password: '' }); }} title="Create employee login" className="p-1.5 rounded hover:bg-indigo-500/10 text-slate-500 hover:text-indigo-400 transition-colors">
                          <KeyRound size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'add' ? 'Add Employee' : 'Edit Employee'}>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Full Name *', key: 'name', type: 'text', placeholder: 'John Doe', col: 2 },
            { label: 'Email *', key: 'email', type: 'email', placeholder: 'john@company.com', col: 1 },
            { label: 'Phone *', key: 'phone', type: 'text', placeholder: '9876543210', col: 1 },
            { label: 'Position *', key: 'position', type: 'text', placeholder: 'Software Engineer', col: 1 },
            { label: 'Joining Date *', key: 'joiningDate', type: 'date', col: 1 },
          ].map(({ label, key, type, placeholder, col }) => (
            <div key={key} className={col === 2 ? 'col-span-2' : ''}>
              <label className="label">{label}</label>
              <input
                type={type}
                value={(form as any)[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="input"
                placeholder={placeholder}
              />
            </div>
          ))}
          <div>
            <label className="label">Department *</label>
            <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input">
              <option value="">Select...</option>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : modal === 'add' ? 'Add Employee' : 'Save Changes'}
          </button>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Employee" size="sm">
        <p className="text-sm text-slate-400">This action cannot be undone. Are you sure?</p>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} className="btn-danger">Delete</button>
        </div>
      </Modal>

      <Modal open={!!loginModal} onClose={() => setLoginModal(null)} title="Create Employee Login" size="sm">
        <p className="text-xs text-slate-500 mb-3">
          Create login for <span className="text-white font-medium">{loginModal?.name}</span> to access the employee portal at <span className="text-indigo-400">/employee/login</span>
        </p>
        <div className="space-y-3">
          <div>
            <label className="label">Login Email</label>
            <input type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} className="input" placeholder="Min 6 characters" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => setLoginModal(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleCreateLogin} disabled={loginSaving} className="btn-primary">
            {loginSaving ? 'Creating...' : 'Create Login'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
