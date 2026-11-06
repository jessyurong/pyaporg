import React, { useState } from "react";
import { Award, Cake, Calendar, CalendarDays, Camera, CheckSquare, ChevronRight, Download, FileText, Home, LayoutDashboard, LogOut, Megaphone, Menu, MessageSquare, Settings, ShieldCheck, Sprout, Trophy, Users, UserRound, Wallet, X } from "lucide-react";
import { LOGO_B64 } from "../constants.js";

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

const NAV_GROUPS = [
  { label: "Main", keys: ["dashboard", "myprofile", "birthday", "announcements", "snapshots"] },
  { label: "Community", keys: ["members", "attendance", "events", "calendar", "leaderboard", "report"] },
  { label: "Organization", keys: ["certificates", "achievements", "finance", "suggestions", "donate"] },
  { label: "Admin", keys: ["pendingUsers", "accountRequests", "users", "access", "backup", "welcome"] },
];

function SidebarAvatar({ src, name, initial }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name ? `${name} profile photo` : "Profile photo"}
        onError={() => setFailed(true)}
        className="w-9 h-9 rounded-full object-cover bg-emerald-800 ring-2 ring-white/20 shrink-0"
      />
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 to-emerald-600 ring-2 ring-white/20 flex items-center justify-center text-xs font-bold text-white shrink-0">{initial}</div>
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
      <div className="flex items-center justify-between px-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5 min-w-0">
          <img src={LOGO_B64} alt="" className="w-9 h-9 rounded-xl bg-white/10 p-0.5 shrink-0" />
          <div className="min-w-0">
            <h2 className="text-sm font-semibold tracking-tight">PYAP Samac</h2>
            <p className="text-[10px] uppercase tracking-[0.16em] text-emerald-200/55">Barangay Chapter</p>
          </div>
        </div>
        {closeOnClick && (
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="px-2.5 pt-3 pb-2">
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
          const baseCls = `w-full flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left transition-colors duration-150 ${
            isCurrent && canOpenProfile ? "bg-white/14 ring-1 ring-white/15" : "bg-white/6"
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

      <nav className="flex-1 overflow-y-auto px-2.5 pb-2">
        {groups.map(g => (
          <div key={g.label}>
            <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200/35">{g.label}</p>
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
                  className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 md:py-2 text-sm text-left transition-all duration-150 active:bg-white/20 ${
                    isActive
                      ? "bg-white text-emerald-950 font-semibold shadow-sm"
                      : "text-emerald-50/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={16} className={`shrink-0 ${isActive ? "text-emerald-800" : "opacity-80"}`} />
                  <span className="flex-1 text-left truncate">{n.label}</span>
                  {badgeCount > 0 && (
                    <span className={`ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold shadow-sm ${isActive ? "bg-rose-500 text-white" : "bg-rose-500 text-white"}`}>{badgeCount}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="px-2.5 pt-2 mt-1 border-t border-white/10">
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
        <div className="pt-3 pb-1 text-[10px] tracking-wide text-emerald-200/35 text-center">Developed by Jessie</div>
      </div>
    </>
  );

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-emerald-950/90 text-white flex items-center px-4 z-30 backdrop-blur-md border-b border-white/10">
        <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 -ml-2 flex items-center justify-center rounded-xl hover:bg-white/10" aria-label="Open menu"><Menu size={22} /></button>
        <img src={LOGO_B64} alt="" className="w-7 h-7 rounded-lg ml-1" />
        <span className="ml-2 font-semibold text-sm tracking-tight">PYAP Samac</span>
      </div>

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="md:hidden fixed inset-0 bg-emerald-950/50 backdrop-blur-sm z-40" />
      )}

      <div className={`md:hidden w-72 bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white flex flex-col py-5 fixed top-0 left-0 h-dvh z-50 shadow-2xl transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {sidebarInner(true)}
      </div>

      <div className="hidden md:flex md:w-64 bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white flex-col py-5 flex-shrink-0 md:sticky md:top-0 md:h-dvh md:self-start overflow-y-auto border-r border-white/5">
        {sidebarInner(false)}
      </div>
    </>
  );
}
