import React, { useState } from "react";
import { Award, Cake, Calendar, CalendarDays, Camera, CheckSquare, ChevronRight, Download, FileText, Home, LayoutDashboard, LogOut, Megaphone, Menu, MessageSquare, Settings, ShieldCheck, Sprout, Trophy, Users, UserRound, Wallet, X } from "lucide-react";

export const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "myprofile", label: "My Profile", icon: UserRound },
  { key: "birthday", label: "Birthdays", icon: Cake },
  { key: "announcements", label: "Announcements", icon: Megaphone },
  { key: "snapshots", label: "Snapshots", icon: Camera },
  { key: "members", label: "Members", icon: Users },
  { key: "attendance", label: "Attendance", icon: CheckSquare },
  { key: "events", label: "Events", icon: Calendar },
  { key: "calendar", label: "Event Calendar", icon: CalendarDays },
  { key: "leaderboard", label: "Leaderboard", icon: Trophy },
  { key: "report", label: "Attendance Report", icon: FileText },
  { key: "certificates", label: "Certificates", icon: Award },
  { key: "achievements", label: "Achievements", icon: Trophy },
  { key: "finance", label: "Finance", icon: Wallet },
  { key: "suggestions", label: "Suggestions", icon: MessageSquare },
  { key: "donate", label: "Donate", icon: Wallet },
  { key: "pendingUsers", label: "Pending Users", icon: Users },
  { key: "accountRequests", label: "Account Requests", icon: MessageSquare },
  { key: "users", label: "User Management", icon: Settings },
  { key: "access", label: "Feature Access", icon: ShieldCheck },
  { key: "backup", label: "Backup & Export", icon: Download },
  { key: "welcome", label: "Welcome Page", icon: Home },
];

// Pangkat ng menu para madaling i-scan ang 20+ items (hindi binabago ang NAV order).
const NAV_GROUPS = [
  { label: "Main", keys: ["dashboard", "myprofile", "birthday", "announcements", "snapshots"] },
  { label: "Community", keys: ["members", "attendance", "events", "calendar", "leaderboard", "report"] },
  { label: "Organization", keys: ["certificates", "achievements", "finance", "suggestions", "donate"] },
  { label: "Admin", keys: ["pendingUsers", "accountRequests", "users", "access", "backup", "welcome"] },
];

// Profile photo sa sidebar; kung wala o hindi mag-load, initials ang fallback.
function SidebarAvatar({ src, name, initial }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name ? `${name} profile photo` : "Profile photo"}
        onError={() => setFailed(true)}
        className="w-8 h-8 rounded-full object-cover bg-emerald-800 ring-1 ring-white/20 shrink-0"
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-emerald-700 ring-1 ring-white/20 flex items-center justify-center text-xs font-bold shrink-0">{initial}</div>
  );
}

export function Sidebar({ featureAccess, screen, isGuest, displayName, role, avatarUrl = "", suggestionCount, pendingCount, accountRequestCount, sidebarOpen, setSidebarOpen, onNavigate, onLogout, onShowAbout }) {
  const groupedKeys = new Set(NAV_GROUPS.flatMap(g => g.keys));
  const groups = NAV_GROUPS
    .map(g => ({ label: g.label, items: NAV.filter(n => g.keys.includes(n.key) && featureAccess[n.key]) }))
    .filter(g => g.items.length > 0);
  const restItems = NAV.filter(n => !groupedKeys.has(n.key) && featureAccess[n.key]);
  if (restItems.length > 0) groups.push({ label: "Others", items: restItems });

  const initial = (isGuest ? "G" : (displayName || "?").trim().charAt(0).toUpperCase()) || "?";

  const sidebarInner = (closeOnClick) => (
    <>
      <div className="flex items-center justify-between px-5 pb-4 border-b border-white/15">
        <div className="min-w-0">
          <h2 className="text-sm font-bold tracking-tight">PYAP Samac</h2>
          <p className="text-[10px] text-emerald-200/60">Barangay Samac</p>
        </div>
        {closeOnClick && (
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* User chip — clickable para diretso sa My Profile, at makikita ang
          profile photo kung meron nang naka-upload. */}
      <div className="px-2 pt-3 pb-2">
        {(() => {
          const canOpenProfile = !isGuest && !!featureAccess.myprofile;
          const isCurrent = screen === "myprofile";
          const chip = (
            <>
              <SidebarAvatar key={avatarUrl || "initials"} src={avatarUrl} name={displayName} initial={initial} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate">{isGuest ? "Guest Mode" : displayName}</p>
                {!isGuest && <p className="text-[10px] text-emerald-200/60 capitalize truncate">{role}</p>}
              </div>
              {canOpenProfile && <ChevronRight size={14} className="text-emerald-200/50 shrink-0" />}
            </>
          );
          const baseCls = `w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors duration-150 ${
            isCurrent && canOpenProfile ? "bg-white/15" : "bg-white/5"
          }`;
          return canOpenProfile ? (
            <button
              type="button"
              onClick={() => onNavigate("myprofile")}
              aria-label="Open My Profile"
              aria-current={isCurrent ? "page" : undefined}
              className={`${baseCls} hover:bg-white/10 active:bg-white/20`}
            >
              {chip}
            </button>
          ) : (
            <div className={baseCls}>{chip}</div>
          );
        })()}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-2">
        {groups.map(g => (
          <div key={g.label}>
            <p className="px-3 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-200/40">{g.label}</p>
            {g.items.map(n => {
              const Icon = n.icon;
              const badgeCount = n.key === "suggestions" ? suggestionCount
                : n.key === "pendingUsers" ? pendingCount
                : n.key === "accountRequests" ? accountRequestCount
                : 0;
              const isActive = screen === n.key;
              return (
                <button
                  key={n.key}
                  onClick={() => onNavigate(n.key)}
                  aria-current={isActive ? "page" : undefined}
                  className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-3 md:py-2 text-sm text-left transition-colors duration-150 active:bg-white/20 ${
                    isActive
                      ? "bg-white/15 text-white font-medium shadow-sm"
                      : "text-emerald-100/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={16} className="shrink-0 opacity-90" />
                  <span className="flex-1 text-left truncate">{n.label}</span>
                  {badgeCount > 0 && (
                    <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white shadow-sm">{badgeCount}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="px-2 pt-2 mt-1 border-t border-white/15">
        <button
          onClick={onShowAbout}
          className="w-full flex items-center gap-2.5 rounded-xl px-3 py-3 md:py-2 text-sm text-emerald-100/80 hover:bg-white/10 hover:text-white active:bg-white/20 transition-colors duration-150"
        >
          <Sprout size={16} className="shrink-0 opacity-90" /> Mission & Vision
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 rounded-xl px-3 py-3 md:py-2 text-sm text-emerald-100/80 hover:bg-white/10 hover:text-white active:bg-white/20 transition-colors duration-150"
        >
          <LogOut size={16} className="shrink-0 opacity-90" /> Logout
        </button>
        <div className="pt-3 pb-1 text-[10px] text-emerald-200/40 text-center">Developed by Jessie</div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-emerald-900 text-white flex items-center px-4 z-30 shadow">
        <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 -ml-2 flex items-center justify-center" aria-label="Open menu"><Menu size={22} /></button>
        <span className="ml-2 font-bold text-sm tracking-tight">PYAP Samac</span>
      </div>

      {/* Overlay when sidebar open on mobile */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="md:hidden fixed inset-0 bg-black/50 z-40" />
      )}

      {/* Mobile drawer sidebar (small screens only) */}
      {/* h-dvh (hindi h-screen): ang 100vh sa Android ay kasama ang area sa
          ilalim ng address bar, kaya napuputol ang Logout/Mission & Vision. */}
      <div className={`md:hidden w-64 bg-emerald-900 text-white flex flex-col py-5 fixed top-0 left-0 h-dvh z-50 shadow-2xl transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {sidebarInner(true)}
      </div>

      {/* Permanent desktop sidebar (always visible on md and up, sticky so it
          stays put habang nag-i-scroll ang content) */}
      <div className="hidden md:flex md:w-56 bg-emerald-900 text-white flex-col py-5 flex-shrink-0 md:sticky md:top-0 md:h-dvh md:self-start overflow-y-auto">
        {sidebarInner(false)}
      </div>
    </>
  );
}
