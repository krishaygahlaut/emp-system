import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarCheck, FileText,
  Clock, BarChart2, LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/employees', icon: Users, label: 'Employees' },
  { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/leaves', icon: FileText, label: 'Leave' },
  { to: '/schedules', icon: Clock, label: 'Schedules' },
  { to: '/reports', icon: BarChart2, label: 'Reports' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-800 ${collapsed ? 'justify-center' : ''}`}>
        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">E</span>
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-semibold text-white">EmpDesk</p>
            <p className="text-xs text-slate-500">Management</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              } ${collapsed ? 'justify-center' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className={isActive ? 'text-indigo-400' : ''} />
                {!collapsed && <span>{label}</span>}
                {!collapsed && isActive && <ChevronRight size={12} className="ml-auto" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className={`p-3 border-t border-slate-800 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed && (
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={15} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-4 left-0 z-10 translate-x-full ml-1 p-1 rounded bg-slate-800 text-slate-400 hover:text-white hidden md:block"
          style={{ left: collapsed ? '52px' : '212px', transition: 'left 0.2s' }}
        >
          {collapsed ? <ChevronRight size={14} /> : <X size={14} />}
        </button>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 bg-slate-900 border-r border-slate-800 flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800">
          <button onClick={() => setMobileOpen(true)} className="text-slate-400">
            <Menu size={20} />
          </button>
          <span className="font-semibold text-white text-sm">EmpDesk</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
