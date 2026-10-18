import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Badge, ModalShell, StatCard, inputCls } from "./ui.jsx";
import { useSubmitLock, submittingCls } from "../hooks/useSubmitLock.jsx";

export function Finance({ finance, onAdd, onDelete }) {
  const income = finance.filter(f => f.type === "income").reduce((s, f) => s + f.amount, 0);
  const expense = finance.filter(f => f.type === "expense").reduce((s, f) => s + f.amount, 0);
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-bold text-emerald-900">Finance Tracker</h1>
        {onAdd && <button onClick={onAdd} className="bg-emerald-700 text-white text-sm px-3 py-2 rounded-lg flex items-center gap-1.5"><Plus size={14} /> Add Entry</button>}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-5">
        <StatCard num={`₱${income}`} label="Total Income" />
        <StatCard num={`₱${expense}`} label="Total Expense" />
        <StatCard num={`₱${income - expense}`} label="Balance" />
      </div>
      <div className="bg-white rounded-xl border border-stone-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead><tr className="bg-emerald-50 text-emerald-900 text-left"><th className="p-3">Type</th><th className="p-3">Category</th><th className="p-3">Amount</th><th className="p-3">Date</th><th className="p-3"></th></tr></thead>
          <tbody>{finance.map(f => (
            <tr key={f.id} className="border-t border-stone-100">
              <td className="p-3"><Badge tone={f.type === "income" ? "active" : "inactive"}>{f.type}</Badge></td>
              <td className="p-3">{f.category}</td><td className="p-3">₱{f.amount}</td><td className="p-3 text-stone-500">{f.date}</td>
              <td className="p-3">{onDelete && <button onClick={() => onDelete(f.id)} className="text-rose-600"><Trash2 size={14} /></button>}</td>
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
