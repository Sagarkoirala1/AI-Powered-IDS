import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, ShieldAlert, User, LogOut, Radar } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/alerts", label: "Alerts", icon: ShieldAlert },
  { to: "/profile", label: "Profile", icon: User },
];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-base text-ink">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-base-line bg-base-panel/60 px-4 py-5 sm:flex">
        <div className="mb-8 flex items-center gap-2 px-1">
          <Radar className="text-signal" size={20} strokeWidth={1.75} />
          <div className="leading-tight">
            <p className="font-display text-sm font-semibold tracking-wide">Sentry IDS</p>
            <p className="font-mono text-[10px] text-ink-faint">v1.0 console</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-signal/10 text-signal"
                    : "text-ink-muted hover:bg-base-alt hover:text-ink"
                }`
              }
            >
              <Icon size={16} strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto border-t border-base-line pt-4">
          <p className="truncate px-1 text-sm text-ink">{user?.username}</p>
          <p className="truncate px-1 font-mono text-xs text-ink-faint">{user?.role}</p>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="mt-3 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-ink-muted hover:bg-state-critical/10 hover:text-state-critical transition-colors"
          >
            <LogOut size={16} strokeWidth={1.75} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-base-line bg-base-panel/40 px-4 py-3 sm:hidden">
          <div className="flex items-center gap-2">
            <Radar className="text-signal" size={18} />
            <span className="font-display text-sm font-semibold">Sentry IDS</span>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="text-ink-muted"
            aria-label="Sign out"
          >
            <LogOut size={18} />
          </button>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
