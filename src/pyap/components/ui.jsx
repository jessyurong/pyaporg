import React from "react";
import { X } from "lucide-react";

export function StatCard({ num, label, icon: Icon, color = "emerald" }) {
  const colors = {
    emerald: "from-emerald-600 to-emerald-700",
    blue: "from-blue-600 to-blue-700",
    amber: "from-amber-500 to-amber-600",
    rose: "from-rose-500 to-rose-600",
    violet: "from-violet-600 to-violet-700",
  };
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow duration-200">
      {Icon && (
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shrink-0 shadow-sm`}>
          <Icon size={20} className="text-white" />
        </div>
      )}
      <div>
        <div className="text-2xl font-bold text-stone-800 leading-none">{num}</div>
        <div className="text-xs text-stone-500 mt-1 font-medium">{label}</div>
      </div>
    </div>
  );
}

export function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
      {/* max-h-dvh (hindi vh): sa Android, ang 90vh ay mas mataas pa sa totoong
          nakikitang screen kapag may address bar, kaya napuputol ang modal. */}
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl my-auto max-h-[90dvh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-stone-100">
          <h3 className="font-bold text-emerald-900 text-base">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X size={16} className="text-stone-400" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export const inputCls = "w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm bg-stone-50 focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all duration-150 placeholder:text-stone-400";

export const btnPrimary = "inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-150";

export const btnDanger = "inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-150";

export const btnSecondary = "inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-sm font-semibold rounded-xl transition-all duration-150";

export function Badge({ children, tone = "neutral" }) {
  const tones = {
    active: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
    inactive: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
    present: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
    absent: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
    excused: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
    neutral: "bg-stone-100 text-stone-600",
    pending: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${tones[tone] || tones.neutral}`}>
      {children}
    </span>
  );
}

export function SectionCard({ title, icon: Icon, children, action }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 bg-stone-50/60">
        <h3 className="font-semibold text-emerald-900 text-sm flex items-center gap-2">
          {Icon && <Icon size={15} className="text-emerald-600" />}
          {title}
        </h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && <Icon size={36} className="text-stone-300 mb-3" />}
      <p className="text-sm text-stone-400 font-medium">{message}</p>
    </div>
  );
}
