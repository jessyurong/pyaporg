import React, { useState } from "react";
import { Banknote, Plus, Trash2 } from "lucide-react";
import { Badge, EmptyState, MobileCard, ModalShell, StatCard, inputCls } from "./ui.jsx";
import { useSubmitLock, submittingCls } from "../hooks/useSubmitLock.jsx";

export function Finance({ finance, onAdd, onDelete }) {
  const income = finance.filter(f => f.type === "income").reduce((s, f) => s + f.amount, 0);
  const expense = finance.filter(f => f.type === "expense").reduce((s, f) => s + f.amount, 0);
  return (
    <div>
      <div className="flex justify-between items-center gap-3 mb-5">
        <h1 className="text-xl font-bold text-emerald-900">Finance Tracker</h1>
        {onAdd && <button onClick={onAdd} className="min-h-11 bg-emerald-700 text-white text-sm px-3 py-2 rounded-lg flex items-center gap-1.5 shrink-0"><Plus size={14} /> Add Entry</button>}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-5">
        <StatCard num={`₱${income}`} label="Total Income" />
        <StatCard num={`₱${expense}`} label="Total Expense" />
        <div className="col-span-2 md:col-span-1">
          <StatCard num={`₱${income - expense}`} label="Balance" />
        </div>
      </div>

      <div className="lg:hidden grid gap-3">
        {finance.length === 0 ? (
          <MobileCard>
            <EmptyState icon={Banknote} message="No finance entries yet." />
          </MobileCard>
        ) : finance.map((f) => (
          <MobileCard key={f.id} className="flex items-start gap-3">
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${f.type === "income" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
              <Banknote size={19} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-base font-bold text-stone-800">₱{f.amount}</p>
                <Badge tone={f.type === "income" ? "active" : "inactive"}>{f.type}</Badge>
              </div>
              <p className="text-sm text-stone-600 break-words mt-0.5">{f.category || "Uncategorized"}</p>
              <p className="text-xs text-stone-400 mt-0.5">{f.date || "No date"}</p>
            </div>
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(f.id)}
                aria-label={`Delete ${f.category || "finance entry"}`}
                className="min-h-11 min-w-11 flex items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50 shrink-0"
              >
                <Trash2 size={17} />
              </button>
            )}
          </MobileCard>
        ))}
      </div>

      <div className="hidden lg:block bg-white rounded-xl border border-stone-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead><tr className="bg-emerald-50 text-emerald-900 text-left"><th className="p-3">Type</th><th className="p-3">Category</th><th className="p-3">Amount</th><th className="p-3">Date</th><th className="p-3"></th></tr></thead>
          <tbody>{finance.map(f => (
            <tr key={f.id} className="border-t border-stone-100">
              <td className="p-3"><Badge tone={f.type === "income" ? "active" : "inactive"}>{f.type}</Badge></td>
              <td className="p-3">{f.category}</td><td className="p-3">₱{f.amount}</td><td className="p-3 text-stone-500">{f.date}</td>
              <td className="p-3">{onDelete && <button onClick={() => onDelete(f.id)} aria-label={`Delete ${f.category || "finance entry"}`} className="text-rose-600"><Trash2 size={14} /></button>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

export function FinanceFormModal({ onClose, onSave }) {
  const [f, setF] = useState({ type: "income", category: "", amount: "", note: "" });
  const { run, isBusy } = useSubmitLock();
  const busy = isBusy();
  return (
    <ModalShell title="Add Finance Entry" onClose={onClose}>
      <div className="space-y-3">
        <select className={inputCls} value={f.type} onChange={e => setF({ ...f, type: e.target.value })}>
          <option value="income">Income</option><option value="expense">Expense</option>
        </select>
        <input className={inputCls} placeholder="Category" value={f.category} onChange={e => setF({ ...f, category: e.target.value })} />
        <input className={inputCls} type="number" placeholder="Amount" value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} />
        <button
          disabled={busy || !f.category.trim() || !f.amount}
          onClick={() => run(null, () => onSave({ ...f, amount: Number(f.amount) }))}
          className={`w-full bg-emerald-700 hover:bg-emerald-800 text-white text-sm py-2 rounded-lg ${submittingCls}`}
        >
          {busy ? "Saving…" : "Save Entry"}
        </button>
      </div>
    </ModalShell>
  );
}
