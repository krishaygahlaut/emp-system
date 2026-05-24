import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../services/api';
import type { MonthlyReport } from '../types';
import toast from 'react-hot-toast';

const DEPT_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function Reports() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/reports/monthly?month=${month}&year=${year}`);
      setReport(data);
    } catch { toast.error('Failed to load report'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReport(); }, [month, year]);

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white">Monthly Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">Attendance & leave analytics</p>
        </div>
        <div className="flex gap-2">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="input w-auto">
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="input w-auto">
            {[2023, 2024, 2025, 2026].map((y) => <option key={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Employees', value: report?.totalEmployees },
              { label: 'Present Days', value: report?.attendance.present, color: 'text-emerald-400' },
              { label: 'Absent Days', value: report?.attendance.absent, color: 'text-red-400' },
              { label: 'Approved Leaves', value: report?.leaves.approved, color: 'text-amber-400' },
            ].map((s) => (
              <div key={s.label} className="card p-4">
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className={`text-3xl font-bold mt-1 ${s.color || 'text-white'}`}>{s.value ?? 0}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-4">
              <h2 className="text-sm font-medium text-white mb-4">Daily Attendance Breakdown</h2>
              {report?.dailyBreakdown.length ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={report.dailyBreakdown} barSize={5}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: 12 }} />
                    <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>} />
                    <Bar dataKey="present" name="Present" fill="#6366f1" radius={[2,2,0,0]} />
                    <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[2,2,0,0]} />
                    <Bar dataKey="halfDay" name="Half Day" fill="#f59e0b" radius={[2,2,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-600 text-sm">No data</div>
              )}
            </div>

            <div className="card p-4">
              <h2 className="text-sm font-medium text-white mb-4">Department Distribution</h2>
              {report?.departmentBreakdown.length ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={report.departmentBreakdown} dataKey="count" nameKey="department" cx="50%" cy="50%" outerRadius={80} strokeWidth={0}>
                      {report.departmentBreakdown.map((_, i) => (
                        <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend iconSize={8} formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-600 text-sm">No data</div>
              )}
            </div>
          </div>

          {/* Leave breakdown */}
          <div className="card p-4">
            <h2 className="text-sm font-medium text-white mb-4">Leave Summary</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Requests', value: report?.leaves.total, bg: 'bg-slate-800' },
                { label: 'Approved', value: report?.leaves.approved, bg: 'bg-emerald-500/10' },
                { label: 'Pending', value: report?.leaves.pending, bg: 'bg-amber-500/10' },
              ].map((item) => (
                <div key={item.label} className={`${item.bg} rounded-lg p-3 text-center`}>
                  <p className="text-2xl font-bold text-white">{item.value ?? 0}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
