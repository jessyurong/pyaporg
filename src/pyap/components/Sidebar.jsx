import React from "react";
import { Award, Calendar, Camera, CheckSquare, Download, Home, LayoutDashboard, LogOut, Megaphone, Menu, MessageSquare, Settings, ShieldCheck, Sprout, Trophy, Users, UserRound, Wallet, X } from "lucide-react";

export const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "myprofile", label: "My Profile", icon: UserRound },
  { key: "announcements", label: "Announcements", icon: Megaphone },
  { key: "snapshots", label: "Snapshots", icon: Camera },
  { key: "members", label: "Members", icon: Users },
  { key: "attendance", label: "Attendance", icon: CheckSquare },
  { key: "events", label: "Events", icon: Calendar },
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

export function Sidebar({ featureAccess, screen, isGuest, displayName, role, suggestionCount, pendingCount, accountRequestCount, sidebarOpen, setSidebarOpen, onNavigate, onLogout, onShowAbout }) {
  const sidebarInner = (closeOnClick) => (
    <>
      <div className="flex items-center justify-between px-5 pb-4 border-b border-white/15">
        <h2 className="text-sm font-bold">PYAP Samac</h2>
        {closeOnClick && <button onClick={() => setSidebarOpen(false)} className="md:hidden"><X size={18} /></button>}
      </div>
      <span className="px-5 py-3 text-[11px] text-white/60">
        {isGuest ? "Guest Mode" : `${displayName} (${role})`}
      </span>
      <nav className="flex-1 overflow-y-auto">
        {NAV.filter(n => featureAccess[n.key]).map(n => {
          const Icon = n.icon;
          const badgeCount = n.key === "suggestions" ? suggestionCount
            : n.key === "pendingUsers" ? pendingCount
            : n.key === "accountRequests" ? accountRequestCount
            : 0;
          const badge = badgeCount > 0
            ? <span className="ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-2 text-[11px] font-semibold text-white">{badgeCount}</span>
            : null;
          return (
            <button
              key={n.key}
              onClick={() => onNavigate(n.key)}
              className={`w-full flex items-center gap-2.5 px-5 py-2.5 text-sm text-left transition ${screen === n.key ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10"}`}
            >
              <Icon size={15} />
              <span className="flex-1 text-left">{n.label}</span>
              {badge}
            </button>
          );
        })}
      </nav>
      <button onClick={onShowAbout} className="flex items-center gap-2.5 px-5 py-2.5 text-sm text-white/80 hover:bg-white/10 border-t border-white/15">
        <Sprout size={15} /> Mission & Vision
      </button>
      <button onClick={onLogout} className="flex items-center gap-2.5 px-5 py-2.5 text-sm text-white/80 hover:bg-white/10 border-t border-white/15">
        <LogOut size={15} /> Logout
      </button>
      <div className="px-5 pt-4 pb-1 text-[10px] text-white/40 text-center">
        Developed by Jessie
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-emerald-900 text-white flex items-center px-4 z-30">
        <button onClick={() => setSidebarOpen(true)} className="p-1"><Menu size={22} /></button>
        <span className="ml-3 font-bold text-sm">PYAP Samac</span>
      </div>

      {/* Overlay when sidebar open on mobile */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="md:hidden fixed inset-0 bg-black/40 z-40" />
      )}

      {/* Mobile drawer sidebar (small screens only) */}
      <div className={`md:hidden w-64 bg-emerald-900 text-white flex flex-col py-5 fixed top-0 left-0 h-screen z-50 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {sidebarInner(true)}
      </div>

      {/* Permanent desktop sidebar (always visible on md and up, normal flow — not fixed/sticky) */}
      <div className="hidden md:flex md:w-56 bg-emerald-900 text-white flex-col py-5 flex-shrink-0 min-h-screen">
        {sidebarInner(false)}
      </div>
    </>
  );
}
