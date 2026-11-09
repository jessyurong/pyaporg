import React, { useState } from "react";
import { Camera, CheckCircle, Eye, EyeOff, KeyRound, UserPlus, X } from "lucide-react";
import { inputCls, btnPrimary, btnSecondary } from "./ui.jsx";

function PasswordField({ name, placeholder = "••••••••", autoComplete, minLength = 6 }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        name={name}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        className={`${inputCls} pr-12`}
      />
      <button
        type="button"
        onClick={() => setShow((visible) => !visible)}
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg text-stone-400 hover:text-emerald-800 hover:bg-emerald-50 flex items-center justify-center"
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block text-left">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint ? <p className="mt-1 text-[11px] text-stone-400">{hint}</p> : null}
    </label>
  );
}

export function LoginDetailsCard({ email, password }) {
  return (
    <div className="text-left">
      <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 uppercase tracking-wide mb-2.5">
          <KeyRound size={13} /> Your Login Details
        </div>
        <div className="space-y-2.5 text-sm">
          <div>
            <div className="text-[11px] text-stone-500">Email</div>
            <div className="font-semibold text-emerald-950 break-all">{email}</div>
          </div>
          <div>
            <div className="text-[11px] text-stone-500">Password</div>
            <div className="font-mono font-semibold text-emerald-950 break-all">{password}</div>
          </div>
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-2xl p-3.5 mt-3 flex items-start gap-2.5">
        <Camera size={15} className="mt-0.5 shrink-0" />
        <span><b>Screenshot this now</b> so you won't forget your email and password — you will use these to log in after the leaders approve your account. Keep them private and don't share them with others.</span>
      </div>
    </div>
  );
}

export function LoginModal({ logo, error, busy, onSubmit, onClose, onRequestClick, onGuestClick }) {
  return (
    <div className="fixed inset-0 z-50 bg-emerald-950/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 sm:p-8 text-center relative my-auto max-h-[90dvh] overflow-y-auto border border-stone-100" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 h-0 flex justify-end pointer-events-none">
          <button type="button" onClick={onClose} className="pointer-events-auto -mt-1 -mr-1 w-9 h-9 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700" aria-label="Close"><X size={18} /></button>
        </div>
        <img src={logo} alt="PYAP Samac Logo" className="w-16 h-16 mx-auto mb-4 rounded-2xl ring-1 ring-emerald-100 bg-emerald-50 p-1" />
        <h1 className="font-serif text-2xl font-medium text-emerald-950">Welcome back</h1>
        <p className="text-xs text-stone-500 mt-1 mb-6">Sign in to your PYAP Samac account.</p>

        {error && <div className="bg-rose-50 text-rose-700 text-xs rounded-xl p-2.5 mb-4 text-left">{error}</div>}

        <form onSubmit={onSubmit} className="space-y-3 text-left" autoComplete="off">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Email</span>
            <input name="email" type="email" placeholder="you@email.com" required autoComplete="email" className={`${inputCls} mt-1`} />
          </label>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Password</span>
            <div className="mt-1">
              <PasswordField name="password" autoComplete="current-password" />
            </div>
          </label>
          <button type="submit" disabled={busy} className={`${btnPrimary} w-full disabled:opacity-60`}>
            {busy ? "Please wait…" : "Login"}
          </button>
        </form>

        <button type="button" onClick={onRequestClick} className="w-full mt-4 text-xs font-medium text-emerald-800 hover:underline">
          New member? Request account access
        </button>

        <button type="button" onClick={onGuestClick} className={`${btnSecondary} w-full mt-3`}>
          Continue as Guest
        </button>
      </div>
    </div>
  );
}

export function RequestAccountModal({ error, busy, done, onSubmit, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-emerald-950/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-[1.75rem] shadow-2xl w-full max-w-md relative my-auto max-h-[90dvh] overflow-hidden border border-stone-100 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 px-5 sm:px-6 pt-5 pb-4 bg-gradient-to-b from-emerald-50/90 to-white border-b border-emerald-100/70">
          <div className="flex items-start gap-3 min-w-0 text-left">
            <div className="w-11 h-11 rounded-2xl bg-emerald-900 text-amber-200 flex items-center justify-center shrink-0 shadow-sm">
              {done ? <CheckCircle size={20} /> : <UserPlus size={20} />}
            </div>
            <div className="min-w-0">
              <h1 className="font-serif text-[1.65rem] leading-tight font-medium text-emerald-950">{done ? "Request Sent" : "Request Access"}</h1>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                {done
                  ? "Please confirm your email, then log in. Wait for a leader to approve your account."
                  : "Leaders will review this. Superadmin, President, and Secretary get notified."}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-full hover:bg-white flex items-center justify-center text-stone-400 hover:text-stone-700 shrink-0" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {done ? (
          <div className="px-5 sm:px-6 py-5 overflow-y-auto">
            <LoginDetailsCard email={done.email} password={done.password} />
            <button type="button" onClick={onClose} className={`${btnPrimary} w-full mt-4`}>Got it</button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col min-h-0 flex-1" autoComplete="off">
            <div className="px-5 sm:px-6 py-4 overflow-y-auto space-y-4 text-left">
              {error && <div className="bg-rose-50 text-rose-700 text-xs rounded-xl p-2.5 text-left">{error}</div>}
              <div className="space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-800/70">Account</p>
                <Field label="Full name">
                  <input name="requestName" type="text" placeholder="Juan Dela Cruz" required className={inputCls} />
                </Field>
                <Field label="Email">
                  <input name="requestEmail" type="email" placeholder="you@email.com" required autoComplete="email" className={inputCls} />
                </Field>
                <Field label="Password" hint="At least 6 characters. Save this — you'll need it after approval.">
                  <PasswordField name="requestPassword" autoComplete="new-password" />
                </Field>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-800/70">Profile</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Age">
                    <input name="requestAge" type="number" placeholder="18" required min="10" className={inputCls} />
                  </Field>
                  <Field label="Sex / Gender">
                    <select name="requestSex" required defaultValue="" className={inputCls}>
                      <option value="" disabled>Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </Field>
                </div>
                <Field label="Birthday">
                  <input name="requestBirthday" type="date" required max={new Date().toISOString().slice(0, 10)} className={inputCls} />
                </Field>
                <Field label="Address">
                  <textarea name="requestAddress" placeholder="Street, Barangay Samac" required rows="2" className={`${inputCls} resize-none`}></textarea>
                </Field>
              </div>
            </div>
            <div className="px-5 sm:px-6 py-4 border-t border-stone-100 bg-white">
              <button type="submit" disabled={busy} className={`${btnPrimary} w-full disabled:opacity-60`}>
                {busy ? "Sending request…" : "Send Request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
