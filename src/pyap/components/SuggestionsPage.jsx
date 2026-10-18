import React, { useState } from "react";
import { FileText, Trash2 } from "lucide-react";
import { ModalShell, inputCls } from "./ui.jsx";
import { useSubmitLock, submittingCls } from "../hooks/useSubmitLock.jsx";

export const FLAGGED_WORDS = ["bobo", "gago", "tanga", "putangina", "ulol"]; // basic placeholder filter — expand as needed

export function Suggestions({ isGuest, suggestions, loading, onSubmit, onDelete }) {
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [showPolicy, setShowPolicy] = useState(false);
  const { run, isBusy } = useSubmitLock();
  const busy = isBusy();

  async function handleSend() {
    const trimmed = msg.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    const hasFlagged = FLAGGED_WORDS.some(w => lower.includes(w));
    if (hasFlagged) {
      setError("Hindi mai-send ang message mo — may laman itong salitang labag sa Policy of Use. Paki-ayos at subukan ulit.");
      return;
    }
    setError("");
    // Isang send lang kahit ilang beses i-tap habang mahina ang signal.
    await run(null, async () => {
      const ok = await onSubmit(trimmed);
      if (!ok) {
        setError("Hindi naipadala ang suggestion. Pakisubukan ulit.");
        return;
      }
      setMsg("");
      setSent(true);
      setTimeout(() => setSent(false), 2500);
    });
  }

  if (isGuest) {
    return (
      <div>
        <h1 className="text-xl font-bold text-emerald-900 mb-2">Suggestions / Feedback</h1>
        <p className="text-sm text-stone-500 mb-3">May gusto ka bang iparating sa mga officers? Ipadala mo lang dito — mababasa lang ito ng mga leaders ng organisasyon.</p>
        <button onClick={() => setShowPolicy(true)} className="text-xs text-emerald-700 underline mb-4 flex items-center gap-1.5"><FileText size={12} /> View Policy of Use</button>
        <div className="bg-white rounded-xl border border-stone-200 p-5 max-w-lg">
          {sent && <div className="bg-emerald-50 text-emerald-700 text-sm rounded-lg p-2.5 mb-3">Salamat! Naipadala na ang suggestion mo.</div>}
          {error && <div className="bg-rose-50 text-rose-700 text-sm rounded-lg p-2.5 mb-3">{error}</div>}
          <textarea className={inputCls} rows={4} placeholder="Isulat ang iyong suggestion o feedback..." value={msg} onChange={e => setMsg(e.target.value)} />
          <p className="text-[11px] text-stone-400 mt-2">Sa pag-send, sumasang-ayon ka sa aming Policy of Use — bawal ang bastos, mapanira, o hindi kaaya-ayang nilalaman.</p>
          <button
            onClick={handleSend}
            disabled={busy}
            className={`mt-3 bg-emerald-700 hover:bg-emerald-800 text-white text-sm px-4 py-2 rounded-lg ${submittingCls}`}
          >
            {busy ? "Sending…" : "Send Suggestion"}
          </button>
        </div>
        {showPolicy && <PolicyModal onClose={() => setShowPolicy(false)} />}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-emerald-900 mb-2">Suggestions Inbox</h1>
      <p className="text-sm text-stone-500 mb-5">Visible lang sa mga leaders ng organisasyon (Super Admin, President, Secretary, Organizer). Mga natanggap na suggestion/feedback mula sa Guest Mode.</p>
      {loading ? (
        <p className="text-sm text-stone-400">Loading suggestions…</p>
      ) : suggestions.length === 0 ? (
        <p className="text-sm text-stone-400">Wala pang natatanggap na suggestion.</p>
      ) : (
        suggestions.map(s => (
          <div key={s.id} className="bg-white rounded-xl border border-stone-200 p-4 mb-3 flex justify-between items-start">
            <div>
              <div className="text-[11px] text-stone-400 mb-1">{s.date} • {s.isAnonymous ? "Anonymous (Guest)" : (s.submitterName || "Member")}</div>
              <p className="text-sm text-stone-700">{s.message}</p>
            </div>
            <button onClick={() => onDelete(s.id)} className="text-rose-600 flex-shrink-0 ml-3"><Trash2 size={14} /></button>
          </div>
        ))
      )}
    </div>
  );
}

export function PolicyModal({ onClose }) {
  return (
    <ModalShell title={<span className="flex items-center gap-2"><FileText size={16} /> Policy of Use</span>} onClose={onClose}>
      <div className="space-y-3 text-sm text-stone-600">
        <p>Sa paggamit ng Suggestions Box na ito, sumasang-ayon ang bawat gumagamit sa mga sumusunod:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><b>Bawal ang bastos, mapang-insulto, o mapanirang pananalita</b> laban sa kapwa miyembro, officer, o sinuman.</li>
          <li><b>Bawal ang hate speech, discrimination, o pananakot</b> sa anumang anyo.</li>
          <li>Gamitin ito para sa <b>constructive feedback, suggestions, o katanungan</b> lamang tungkol sa organisasyon.</li>
          <li>Ang mga hindi angkop na mensahe ay awtomatikong na-fi-flag at hindi maipapadala.</li>
          <li>Ang paulit-ulit na paglabag ay maaaring humantong sa pagbabawal ng access sa Guest Mode.</li>
        </ul>
        <p className="text-xs text-stone-400 pt-2 border-t border-stone-100">Layunin ng box na ito na palakasin ang tinig ng kabataan sa paraang magalang at makabuluhan.</p>
      </div>
    </ModalShell>
  );
}
