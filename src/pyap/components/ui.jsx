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
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-5 flex items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow duration-200 min-w-0">
      {Icon && (
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shrink-0 shadow-sm`}>
          <Icon size={20} className="text-white" />
        </div>
      )}
      <div className="min-w-0">
        <div className="text-xl sm:text-2xl font-bold text-stone-800 leading-none break-words">{num}</div>
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
            aria-label="Close"
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X size={18} className="text-stone-400" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// 16px sa mobile para hindi mag-auto-zoom ang iOS kapag nag-focus sa input.
export const inputCls = "w-full px-3.5 py-2.5 min-h-11 border border-stone-200 rounded-xl text-base sm:text-sm bg-stone-50 focus:bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all duration-150 placeholder:text-stone-400";

export const btnPrimary = "inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-11 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-150";

export const btnDanger = "inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-11 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-150";

export const btnSecondary = "inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-11 border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-sm font-semibold rounded-xl transition-all duration-150";

// Shared mobile card primitives. Desktop tables stay as-is; these keep every
// mobile list consistent and make sure actions are visible without sideways scroll.
export function MobileCard({ children, className = "", onClick, ...props }) {
  const interactive = typeof onClick === "function";
  return (
    <div
      onClick={onClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
      className={`bg-white rounded-xl border border-stone-200 p-4 min-w-0 ${
        interactive ? "cursor-pointer hover:border-emerald-200 active:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function MobileFields({ children, className = "" }) {
  return <dl className={`mt-3 grid grid-cols-2 gap-x-4 gap-y-3 ${className}`}>{children}</dl>;
}

export function MobileField({ label, children, wide = false, className = "" }) {
  return (
    <div className={`${wide ? "col-span-2" : ""} ${className}`}>
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-stone-700 break-words">{children}</dd>
    </div>
  );
}

export function MobileActions({ children, className = "" }) {
  return <div className={`mt-4 grid grid-cols-2 gap-2 ${className}`}>{children}</div>;
}

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
