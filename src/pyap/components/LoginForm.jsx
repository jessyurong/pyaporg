import React from "react";
import { Camera, CheckCircle, KeyRound, X } from "lucide-react";

export function LoginDetailsCard({ email, password }) {
  return (
    <div className="text-left">
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-500 uppercase tracking-wide mb-2.5">
          <KeyRound size={13} /> Your Login Details
        </div>
        <div className="space-y-2.5 text-sm">
          <div>
            <div className="text-[11px] text-stone-500">Email</div>
            <div className="font-semibold text-emerald-900 break-all">{email}</div>
          </div>
          <div>
            <div className="text-[11px] text-stone-500">Password</div>
            <div className="font-mono font-semibold text-emerald-900 break-all">{password}</div>
          </div>
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl p-3.5 mt-3 flex items-start gap-2.5">
        <Camera size={15} className="mt-0.5 shrink-0" />
        <span><b>Screenshot this now</b> so you won't forget your email and password — you will use these to log in after the leaders approve your account. Keep them private and don't share them with others.</span>
      </div>
    </div>
  );
}

export function LoginModal({ logo, error, busy, onSubmit, onClose, onRequestClick, onGuestClick }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 sm:p-8 text-center relative my-auto max-h-[90dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 h-0 flex justify-end pointer-events-none">
          <button type="button" onClick={onClose} className="pointer-events-auto -mt-1 -mr-1 p-1 text-stone-400 hover:text-stone-700" aria-label="Close"><X size={18} /></button>
        </div>
        <img src={logo} alt="PYAP Samac Logo" className="w-20 h-20 mx-auto mb-4" />
        <h1 className="text-lg font-bold text-emerald-900">Member Login</h1>
        <p className="text-xs text-stone-500 mt-1 mb-5">Existing members only. New users should request access.</p>

        {error && <div className="bg-rose-50 text-rose-700 text-xs rounded-lg p-2.5 mb-4 text-left">{error}</div>}

        <form onSubmit={onSubmit} className="space-y-3 text-left" autoComplete="off">
          <input name="email" type="email" placeholder="Email" required autoComplete="email" className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm" />
          <input name="password" type="password" placeholder="Password" required minLength={6} autoComplete="current-password" className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm" />
          <button type="submit" disabled={busy} className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-lg transition">
            {busy ? "Please wait…" : "Login"}
          </button>
        </form>

        <button type="button" onClick={onRequestClick} className="w-full mt-3 text-xs text-emerald-700 hover:underline">
          New member? Request account access
        </button>

        <button type="button" onClick={onGuestClick} className="w-full mt-3 border border-emerald-700 text-emerald-700 hover:bg-emerald-700 hover:text-white font-semibold text-sm py-2.5 rounded-lg transition">
          Continue as Guest
        </button>
      </div>
    </div>
  );
}

export function RequestAccountModal({ error, busy, done, onSubmit, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5 sm:p-8 text-center relative my-auto max-h-[90dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 h-0 flex justify-end pointer-events-none">
          <button type="button" onClick={onClose} className="pointer-events-auto -mt-1 -mr-1 p-1 text-stone-400 hover:text-stone-700" aria-label="Close"><X size={18} /></button>
        </div>
        {done ? (
          <>
            <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle size={30} />
            </div>
            <h1 className="text-lg font-bold text-emerald-900">Request Sent!</h1>
            <p className="text-xs text-stone-500 mt-1 mb-5">Please confirm your email, then log in. Wait for a leader to approve your account.</p>
            <LoginDetailsCard email={done.email} password={done.password} />
            <button type="button" onClick={onClose} className="w-full mt-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm py-2.5 rounded-lg transition">Got it</button>
          </>
        ) : (
          <>
            <h1 className="text-lg font-bold text-emerald-900">Request Account Access</h1>
            <p className="text-xs text-stone-500 mt-1 mb-5">Send a request to the leaders. Superadmin, President, and Secretary will be notified.</p>

            {error && <div className="bg-rose-50 text-rose-700 text-xs rounded-lg p-2.5 mb-4 text-left">{error}</div>}

            <form onSubmit={onSubmit} className="space-y-3 text-left" autoComplete="off">
              <input name="requestName" type="text" placeholder="Full name" required className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm" />
              <input name="requestEmail" type="email" placeholder="Email" required autoComplete="email" className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm" />
              <input name="requestPassword" type="password" placeholder="Password" required minLength={6} autoComplete="new-password" className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm" />
              <input name="requestAge" type="number" placeholder="Age" required min="10" className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm" />
              <input name="requestSex" type="text" placeholder="Sex / Gender" required className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm" />
              <label className="block">
                <span className="text-xs font-semibold text-stone-600">Birthday</span>
                <input name="requestBirthday" type="date" required max={new Date().toISOString().slice(0, 10)} className="w-full mt-1 px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm" />
              </label>
              <textarea name="requestAddress" placeholder="Address" required rows="3" className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm"></textarea>
              <button type="submit" disabled={busy} className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-lg transition">
                {busy ? "Sending request…" : "Send Request"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
