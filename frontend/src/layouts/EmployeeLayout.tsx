import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck, FileText, Clock, LogOut, Menu, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/employee/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employee/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/employee/leaves', icon: FileText, label: 'My Leaves' },
  { to: '/employee/schedule', icon: Clock, label: 'Schedule' },
];

export default function EmployeeLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); window.location.href = '/employee/login'; };

  const SidebarContent = () => (
    <>
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
        <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">E</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
          <p className="text-xs text-slate-500">Employee Portal</p>
        </div>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-emerald-600/15 text-emerald-400 font-medium' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`
            }>
            {({ isActive }) => (
              <>
                <Icon size={16} className={isActive ? 'text-emerald-400' : ''} />
                <span>{label}</span>
                {isActive && <ChevronRight size={12} className="ml-auto" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-800">
        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full">
          <LogOut size={15} /><span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <aside className="hidden md:flex flex-col w-56 bg-slate-900 border-r border-slate-800">
        <SidebarContent />
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 bg-slate-900 border-r border-slate-800 flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-6"><Outlet /></main>
      </div>
    </div>
  );
}
