import React from "react";
import { X } from "lucide-react";

export function StatCard({ num, label }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4">
      <div className="text-2xl font-bold text-emerald-800">{num}</div>
      <div className="text-xs text-stone-500 mt-1">{label}</div>
    </div>
  );
}

export function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-emerald-900">{title}</h3>
          <button onClick={onClose}><X size={18} className="text-stone-400" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const inputCls = "w-full px-3 py-2 border border-stone-200 rounded-lg text-sm";

export function Badge({ children, tone = "neutral" }) {
  const tones = {
    active: "bg-emerald-50 text-emerald-700",
    inactive: "bg-rose-50 text-rose-700",
    present: "bg-emerald-50 text-emerald-700",
    absent: "bg-rose-50 text-rose-700",
    excused: "bg-amber-50 text-amber-700",
    neutral: "bg-stone-100 text-stone-600",
  };
  return <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${tones[tone] || tones.neutral}`}>{children}</span>;
}
