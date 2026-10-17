import React, { useState } from "react";
import { Check, Lock, ShieldCheck } from "lucide-react";
import { GRANTABLE_FEATURES, MANAGED_ROLES, PRESETS, ROLE_LABELS, ROLE_OPTIONS } from "../constants.js";
import { fmtBirthday } from "../lib/utils.js";
import { Badge } from "./ui.jsx";

export function PendingUsers({ pendingUsers, loading, roleSelection, onRoleChange, onApprove, onReject }) {
  const roleOptions = ["superadmin", "president", "secretary", "treasurer", "organizer", "member"];
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-xl font-bold text-emerald-900">Pending User Approvals</h1>
          <p className="text-sm text-stone-500">Tingnan ang buong info ng nag-request (edad, kasarian, address, birthday) bago i-approve. Pumili ng role bago pindutin ang Approve.</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[1080px]">
          <thead><tr className="bg-emerald-50 text-emerald-900 text-left"><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Age</th><th className="p-3">Sex</th><th className="p-3">Birthday</th><th className="p-3">Address</th><th className="p-3">Requested</th><th className="p-3">Role</th><th className="p-3">Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" className="p-4 text-stone-500">Loading pending users…</td></tr>
            ) : pendingUsers.length === 0 ? (
              <tr><td colSpan="9" className="p-4 text-stone-500">No pending users at the moment.</td></tr>
            ) : pendingUsers.map(u => (
              <tr key={u.id} className="border-t border-stone-100">
                <td className="p-3 font-medium">{u.full_name || "Unknown"}</td>
                <td className="p-3 text-stone-500">{u.email || "-"}</td>
                <td className="p-3 text-stone-500">{u.age || "-"}</td>
                <td className="p-3 text-stone-500">{u.sex || "-"}</td>
                <td className="p-3 text-stone-500">{fmtBirthday(u.birthday)}</td>
                <td className="p-3 text-stone-500 max-w-[220px] break-words">{u.address || "-"}</td>
                <td className="p-3 text-stone-500">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}</td>
                <td className="p-3">
                  <select className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm" value={roleSelection[u.user_id] || "member"} onChange={(e) => onRoleChange(u.user_id, e.target.value)}>
                    {roleOptions.map(role => <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>)}
                  </select>
                </td>
                <td className="p-3 space-x-2">
                  <button onClick={() => onApprove(u.user_id)} className="bg-emerald-700 text-white text-xs px-3 py-2 rounded-lg">Approve</button>
                  <button onClick={() => onReject(u.user_id)} className="bg-rose-50 text-rose-700 text-xs px-3 py-2 rounded-lg">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AccountRequests({ requests }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-xl font-bold text-emerald-900">Account Requests</h1>
          <p className="text-sm text-stone-500">Requests sent by new members. Notify leaders to approve them manually.</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-stone-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="bg-emerald-50 text-emerald-900 text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Age</th>
              <th className="p-3">Birthday</th>
              <th className="p-3">Sex</th>
              <th className="p-3">Address</th>
              <th className="p-3">Requested</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr><td colSpan="7" className="p-4 text-stone-500">No account requests yet.</td></tr>
            ) : requests.map((req) => (
              <tr key={req.id} className="border-t border-stone-100">
                <td className="p-3 font-medium">{req.name}</td>
                <td className="p-3 text-stone-500">{req.age}</td>
                <td className="p-3 text-stone-500">{fmtBirthday(req.birthday)}</td>
                <td className="p-3 text-stone-500">{req.sex}</td>
                <td className="p-3 text-stone-500">{req.address}</td>
                <td className="p-3 text-stone-500">{req.created_at ? new Date(req.created_at).toLocaleDateString() : "-"}</td>
                <td className="p-3 text-stone-500">{req.status || "new"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function FeatureAccess({ extras, onSave }) {
  const [selectedRole, setSelectedRole] = useState("member");
  const [busy, setBusy] = useState("");
  const baseline = PRESETS[selectedRole] || {};
  const extra = extras[selectedRole] || [];
  const isOn = (key) => !!baseline[key] || extra.includes(key);
  const isLeaderRole = ["president", "secretary", "organizer"].includes(selectedRole);

  async function toggle(key) {
    if (baseline[key] || busy) return;
    const next = isOn(key) ? extra.filter((k) => k !== key) : [...extra, key];
    setBusy(key);
    try {
      await onSave(selectedRole, next);
    } finally {
      setBusy("");
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-emerald-900 mb-1">Feature Access</h1>
      <p className="text-sm text-stone-500 mb-5">Piliin kung anong mga feature (screens) ang makikita ng bawat role. Ang naka-lock na "Default" ay laging kasama — i-tick ang iba para idagdag. Awtomatikong nase-save.</p>

      <div className="flex flex-wrap gap-2 mb-5">
        {MANAGED_ROLES.map((r) => (
          <button
            key={r}
            onClick={() => setSelectedRole(r)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${selectedRole === r ? "bg-emerald-700 border-emerald-700 text-white" : "bg-white border-stone-200 text-stone-600 hover:border-emerald-600"}`}
          >
            {ROLE_LABELS[r]}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden mb-4">
        {GRANTABLE_FEATURES.map((f) => {
          const on = isOn(f.key);
          const locked = !!baseline[f.key];
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => toggle(f.key)}
              disabled={locked || busy === f.key}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 border-b border-stone-100 last:border-0 text-left transition enabled:hover:bg-stone-50 disabled:opacity-70"
            >
              <span className="text-sm text-stone-700 flex items-center gap-2">
                {f.label}
                {locked && <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-stone-400 bg-stone-100 rounded-full px-2 py-0.5"><Lock size={10} /> Default</span>}
                {busy === f.key && <span className="text-[10px] text-stone-400">saving…</span>}
              </span>
              <span className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition ${on ? "bg-emerald-700 border-emerald-700 text-white" : "border-stone-300 bg-white"}`}>
                {on && <Check size={13} />}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs text-stone-500 leading-relaxed">
        <div className="flex items-center gap-1.5 font-semibold text-stone-600 mb-1.5"><ShieldCheck size={13} /> Palaging kasama (hindi mailalabas)</div>
        <p>
          Dashboard para sa lahat.
          {isLeaderRole ? " Pending Users at Account Requests para sa mga leader." : ""}
          {selectedRole === "president" ? " Backup & Export para sa president." : ""}
          {" "}Ang User Management at itong Feature Access ay para lang sa superadmin.
        </p>
      </div>
    </div>
  );
}

export function UserManagement({ accounts, loading, selfId, onSetRole, onSetStatus, onSetBirthday }) {
  const activeSuperadmins = accounts.filter(a => a.role === "superadmin" && a.status === "active").length;
  const statusLabels = { active: "Active", pending: "Pending", rejected: "Rejected", inactive: "Inactive" };
  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-xl font-bold text-emerald-900">User Management</h1>
      </div>
      <p className="text-sm text-stone-500 mb-5">Lahat ng accounts ng organisasyon. Baguhin ang role, i-activate / i-deactivate ang account, o ayusin ang birthday (kung nagkamali ang member ng nailagay).</p>
      {loading ? (
        <p className="text-sm text-stone-400">Loading…</p>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead><tr className="bg-emerald-50 text-emerald-900 text-left"><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Birthday</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead>
            <tbody>{accounts.map(a => {
              const isSelf = a.userId === selfId;
              const isLastSuperadmin = a.role === "superadmin" && a.status === "active" && activeSuperadmins <= 1;
              const locked = isSelf || isLastSuperadmin;
              return (
                <tr key={a.userId} className="border-t border-stone-100">
                  <td className="p-3">{a.name}{isSelf && <span className="text-[10px] text-emerald-700 font-semibold ml-1.5">(You)</span>}</td>
                  <td className="p-3 text-stone-500">{a.email || "—"}</td>
                  <td className="p-3">
                    <input
                      type="date"
                      value={a.birthday || ""}
                      max={new Date().toISOString().slice(0, 10)}
                      onChange={e => onSetBirthday(a.userId, e.target.value)}
                      className="px-2 py-1 border border-stone-200 rounded-lg text-sm text-stone-600"
                    />
                  </td>
                  <td className="p-3">
                    {locked ? (
                      <span>{ROLE_LABELS[a.role] || a.role}</span>
                    ) : (
                      <select className="px-2 py-1 border border-stone-200 rounded-lg text-sm" value={a.role} onChange={e => onSetRole(a.userId, e.target.value)}>
                        {ROLE_OPTIONS.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                      </select>
                    )}
                  </td>
                  <td className="p-3"><Badge tone={a.status === "active" ? "active" : a.status === "pending" ? "neutral" : "inactive"}>{statusLabels[a.status] || a.status}</Badge></td>
                  <td className="p-3 whitespace-nowrap">
                    {locked ? (
                      <span className="text-xs text-stone-400">{isSelf ? "Ikaw ito" : "Huling superadmin"}</span>
                    ) : a.status === "active" ? (
                      <button onClick={() => onSetStatus(a.userId, "inactive")} className="text-rose-600 text-xs font-medium">Deactivate</button>
                    ) : a.status === "pending" ? (
                      <span className="text-xs text-stone-400">I-approve sa Pending Users</span>
                    ) : (
                      <button onClick={() => onSetStatus(a.userId, "active")} className="text-emerald-700 text-xs font-medium">Activate</button>
                    )}
                  </td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
