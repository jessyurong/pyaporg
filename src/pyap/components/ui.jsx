import React, { useEffect } from "react";
import { X } from "lucide-react";

export function PageHeader({ title, subtitle, action, badge }) {
  return (
    <div className="page-header">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="page-title">{title}</h1>
          {badge}
        </div>
        {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function StatCard({ num, label, icon: Icon, color = "emerald" }) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-800",
    blue: "bg-sky-50 text-sky-800",
    amber: "bg-amber-50 text-amber-800",
    rose: "bg-rose-50 text-rose-800",
    violet: "bg-violet-50 text-violet-800",
  };
  return (
    <div className="surface rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 min-w-0 transition-shadow duration-200">
      {Icon && (
        <div className={`w-11 h-11 rounded-2xl ${colors[color]} flex items-center justify-center shrink-0`}>
          <Icon size={20} />
        </div>
      )}
      <div className="min-w-0">
        <div className="text-xl sm:text-2xl font-semibold tracking-tight text-emerald-950 leading-none break-words">{num}</div>
        <div className="text-xs text-stone-500 mt-1.5 font-medium">{label}</div>
      </div>
    </div>
  );
}

export function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl my-auto max-h-[90dvh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-stone-100">
        <div className="flex justify-between items-center p-5 border-b border-stone-100">
          <h3 className="font-serif font-semibold text-emerald-950 text-lg tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors"
          >
            <X size={18} className="text-stone-400" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function ImageLightbox({ src, alt, caption, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  if (!src) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={alt || "Image preview"}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close image preview"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center transition-colors"
      >
        <X size={22} />
      </button>
      <img
        src={src}
        alt={alt || "Image preview"}
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-4rem)] object-contain rounded-lg shadow-2xl"
      />
      {caption && (
        <p className="absolute bottom-4 left-4 right-4 text-center text-sm text-white/80 truncate pointer-events-none">
          {caption}
        </p>
      )}
    </div>
  );
}

// 16px sa mobile para hindi mag-auto-zoom ang iOS kapag nag-focus sa input.
export const inputCls = "w-full px-3.5 py-2.5 min-h-11 border border-stone-200/90 rounded-xl text-base sm:text-sm bg-white/80 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/80 outline-none transition-all duration-150 placeholder:text-stone-400";

export const btnPrimary = "inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-11 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white text-sm font-semibold rounded-xl shadow-[0_8px_18px_rgba(6,95,70,0.22)] hover:-translate-y-px transition-all duration-150";

export const btnDanger = "inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-11 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-150";

export const btnSecondary = "inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-11 border border-stone-200 bg-white/80 hover:bg-white text-stone-700 text-sm font-semibold rounded-xl transition-all duration-150";

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
      className={`surface rounded-2xl p-4 min-w-0 ${
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
    <div className="surface rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100/80 bg-gradient-to-r from-emerald-50/70 to-transparent">
        <h3 className="font-semibold text-emerald-950 text-sm flex items-center gap-2">
          {Icon && <Icon size={15} className="text-emerald-700" />}
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
      {Icon && (
        <div className="mb-3 w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700/70 flex items-center justify-center">
          <Icon size={22} />
        </div>
      )}
      <p className="text-sm text-stone-500 font-medium">{message}</p>
    </div>
  );
}
