import { useEffect, useState } from 'react';
import { Users, UserCheck, FileText, Clock } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../services/api';
import type { MonthlyReport } from '../types';
import toast from 'react-hot-toast';

const DEPT_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function Dashboard() {
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();

  useEffect(() => {
    api.get(`/reports/monthly?month=${now.getMonth() + 1}&year=${now.getFullYear()}`)
      .then((r) => setReport(r.data))
      .catch(() => toast.error('Failed to load report'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  const stats = [
    { label: 'Total Employees', value: report?.totalEmployees ?? 0, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Active Employees', value: report?.activeEmployees ?? 0, icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Present Today (Month)', value: report?.attendance.present ?? 0, icon: Clock, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    { label: 'Pending Leaves', value: report?.leaves.pending ?? 0, icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  const monthName = now.toLocaleString('default', { month: 'long' });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">{monthName} {now.getFullYear()} overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
              </div>
              <div className={`${s.bg} p-2 rounded-lg`}>
                <s.icon size={16} className={s.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Attendance bar chart */}
        <div className="card p-4 lg:col-span-2">
          <h2 className="text-sm font-medium text-white mb-4">Monthly Attendance</h2>
          {report?.dailyBreakdown && report.dailyBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={report.dailyBreakdown} barSize={6}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: 12 }}
                />
                <Bar dataKey="present" name="Present" fill="#6366f1" radius={[2, 2, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[2, 2, 0, 0]} />
                <Bar dataKey="halfDay" name="Half Day" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-48 items-center justify-center text-slate-600 text-sm">
              No attendance data for this month
            </div>
          )}
        </div>

        {/* Department pie chart */}
        <div className="card p-4">
          <h2 className="text-sm font-medium text-white mb-4">By Department</h2>
          {report?.departmentBreakdown && report.departmentBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={report.departmentBreakdown}
                  dataKey="count"
                  nameKey="department"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  strokeWidth={0}
                >
                  {report.departmentBreakdown.map((_, i) => (
                    <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  iconSize={8}
                  formatter={(val) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{val}</span>}
                />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-48 items-center justify-center text-slate-600 text-sm">
              No data
            </div>
          )}
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Attendance Records', value: report?.attendance.total ?? 0, sub: `${report?.attendance.present} present` },
          { label: 'Absent Count', value: report?.attendance.absent ?? 0, sub: `${report?.attendance.halfDay} half-days` },
          { label: 'Leave Requests', value: report?.leaves.total ?? 0, sub: `${report?.leaves.approved} approved` },
        ].map((item) => (
          <div key={item.label} className="card p-4">
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className="text-3xl font-bold text-white mt-1">{item.value}</p>
            <p className="text-xs text-slate-600 mt-1">{item.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
