import React, { useState } from "react";
import { Check, Lock, ShieldCheck, UserCheck } from "lucide-react";
import { GRANTABLE_FEATURES, MANAGED_ROLES, PRESETS, ROLE_LABELS, ROLE_OPTIONS } from "../constants.js";
import { fmtBirthday } from "../lib/utils.js";
import { Badge, EmptyState, MobileActions, MobileCard, MobileField, MobileFields, inputCls } from "./ui.jsx";
import { useSubmitLock, submittingCls } from "../hooks/useSubmitLock.jsx";

function initialsOf(name, email) {
  const source = (name || email || "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function requestedDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function roleSelectCls() {
  return "w-full min-h-11 px-3 py-2 border border-stone-200 rounded-lg text-base sm:text-sm text-stone-700 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none";
}

export function PendingUsers({ pendingUsers, loading, roleSelection, onRoleChange, onApprove, onReject }) {
  // Keyed sa user_id: habang tumatakbo ang approve/reject ng isang row,
  // naka-lock ang row na iyon — isang approval lang kapag double-tap.
  const { run, isBusy } = useSubmitLock();
  const [busyAction, setBusyAction] = useState({});

  function runAction(user, action) {
    setBusyAction((prev) => ({ ...prev, [user.user_id]: action }));
    run(user.user_id, () => (action === "approve" ? onApprove(user.user_id) : onReject(user.user_id))).finally(() => {
      setBusyAction((prev) => {
        const next = { ...prev };
        delete next[user.user_id];
        return next;
      });
    });
  }

  const total = pendingUsers.length;

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-emerald-900">Pending User Approvals</h1>
            {total > 0 && <Badge tone="pending">{total} pending</Badge>}
          </div>
          <p className="text-sm text-stone-500 mt-1">Review the details, choose a role, then approve or reject.</p>
        </div>
      </div>

      {/* Mobile / tablet cards */}
      <div className="xl:hidden grid gap-3 lg:grid-cols-2">
        {loading ? (
          <MobileCard className="lg:col-span-2">
            <p className="text-sm text-stone-500">Loading pending users…</p>
          </MobileCard>
        ) : total === 0 ? (
          <MobileCard className="lg:col-span-2">
            <EmptyState icon={UserCheck} message="No pending users at the moment." />
          </MobileCard>
        ) : pendingUsers.map((u) => {
          const role = roleSelection[u.user_id] || "member";
          const busy = isBusy(u.user_id);
          return (
            <MobileCard key={u.id}>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                  {initialsOf(u.full_name, u.email)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-emerald-950 break-words">{u.full_name || "Unknown"}</p>
                  <p className="text-xs text-stone-500 break-all">{u.email || "—"}</p>
                  <p className="mt-1 text-[10px] text-stone-400">Requested {requestedDate(u.created_at)}</p>
                </div>
              </div>

              <MobileFields>
                <MobileField label="Age">{u.age || "—"}</MobileField>
                <MobileField label="Sex">{u.sex || "—"}</MobileField>
                <MobileField label="Birthday" wide>{fmtBirthday(u.birthday)}</MobileField>
                <MobileField label="Address" wide>{u.address || "—"}</MobileField>
              </MobileFields>

              <div className="mt-4 border-t border-stone-100 pt-4">
                <label htmlFor={`pending-role-${u.user_id}`} className="text-xs font-semibold text-stone-600">
                  Assign role
                </label>
                <select
                  id={`pending-role-${u.user_id}`}
                  value={role}
                  onChange={(e) => onRoleChange(u.user_id, e.target.value)}
                  className={`mt-1.5 ${roleSelectCls()}`}
                >
                  {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
                {role === "superadmin" && (
                  <p className="mt-1.5 text-[11px] text-amber-700">Super Admin has full access. Approve only if intended.</p>
                )}
              </div>

              <MobileActions>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => runAction(u, "reject")}
                  aria-label={`Reject ${u.full_name || "user"}`}
                  className={`min-h-11 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-semibold disabled:opacity-50 ${submittingCls}`}
                >
                  {busyAction[u.user_id] === "reject" ? "Rejecting…" : "Reject"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => runAction(u, "approve")}
                  aria-label={`Approve ${u.full_name || "user"}`}
                  className={`min-h-11 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold disabled:opacity-50 ${submittingCls}`}
                >
                  {busyAction[u.user_id] === "approve" ? "Approving…" : "Approve"}
                </button>
              </MobileActions>
            </MobileCard>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden xl:block bg-white rounded-xl border border-stone-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="bg-emerald-50 text-emerald-900 text-left">
              <th className="px-3 py-3">User</th>
              <th className="px-3 py-3">Details</th>
              <th className="px-3 py-3">Address</th>
              <th className="px-3 py-3">Requested</th>
              <th className="px-3 py-3">Role</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-4 text-stone-500">Loading pending users…</td></tr>
            ) : total === 0 ? (
              <tr><td colSpan="6" className="p-4 text-stone-500">No pending users at the moment.</td></tr>
            ) : pendingUsers.map((u) => {
              const role = roleSelection[u.user_id] || "member";
              const busy = isBusy(u.user_id);
              return (
                <tr key={u.id} className="border-t border-stone-100 align-top">
                  <td className="px-3 py-3">
                    <p className="font-medium">{u.full_name || "Unknown"}</p>
                    <p className="text-xs text-stone-500 break-all">{u.email || "—"}</p>
                  </td>
                  <td className="px-3 py-3 text-stone-500">
                    <p>Age {u.age || "—"} · {u.sex || "—"}</p>
                    <p className="text-xs mt-0.5">{fmtBirthday(u.birthday)}</p>
                  </td>
                  <td className="px-3 py-3 text-stone-500 max-w-[220px] break-words">{u.address || "—"}</td>
                  <td className="px-3 py-3 text-stone-500 whitespace-nowrap">{requestedDate(u.created_at)}</td>
                  <td className="px-3 py-3 min-w-[130px]">
                    <select
                      value={role}
                      onChange={(e) => onRoleChange(u.user_id, e.target.value)}
                      className={roleSelectCls()}
                      aria-label={`Role for ${u.full_name || "user"}`}
                    >
                      {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => runAction(u, "approve")}
                        aria-label={`Approve ${u.full_name || "user"}`}
                        className={`min-h-9 bg-emerald-700 hover:bg-emerald-800 text-white text-xs px-3 py-2 rounded-lg disabled:opacity-50 ${submittingCls}`}
                      >
                        {busyAction[u.user_id] === "approve" ? "Approving…" : "Approve"}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => runAction(u, "reject")}
                        aria-label={`Reject ${u.full_name || "user"}`}
                        className={`min-h-9 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs px-3 py-2 rounded-lg disabled:opacity-50 ${submittingCls}`}
                      >
                        {busyAction[u.user_id] === "reject" ? "Rejecting…" : "Reject"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AccountRequests({ requests }) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-emerald-900">Account Requests</h1>
            {requests.length > 0 && <Badge tone="neutral">{requests.length} request{requests.length === 1 ? "" : "s"}</Badge>}
          </div>
          <p className="text-sm text-stone-500 mt-1">Requests sent by new members. Notify leaders to approve them manually.</p>
        </div>
      </div>

      <div className="lg:hidden grid gap-3">
        {requests.length === 0 ? (
          <MobileCard>
            <EmptyState icon={UserCheck} message="No account requests yet." />
          </MobileCard>
        ) : requests.map((req) => (
          <MobileCard key={req.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-emerald-950 break-words">{req.name || "Unknown"}</p>
                <p className="mt-0.5 text-[10px] text-stone-400">Requested {requestedDate(req.created_at)}</p>
              </div>
              <Badge tone="neutral">{req.status || "new"}</Badge>
            </div>
            <MobileFields>
              <MobileField label="Age">{req.age || "—"}</MobileField>
              <MobileField label="Sex">{req.sex || "—"}</MobileField>
              <MobileField label="Birthday" wide>{fmtBirthday(req.birthday)}</MobileField>
              <MobileField label="Address" wide>{req.address || "—"}</MobileField>
            </MobileFields>
          </MobileCard>
        ))}
      </div>

      <div className="hidden lg:block bg-white rounded-xl border border-stone-200 overflow-x-auto">
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
                <td className="p-3 text-stone-500 max-w-[220px] break-words">{req.address}</td>
                <td className="p-3 text-stone-500 whitespace-nowrap">{requestedDate(req.created_at)}</td>
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
        <p className="mt-2">
          Suggestions: makakapag-send ang mga member at guest, pero Super Admin, President, Secretary, at Organizer lang ang makakabasa ng inbox.
        </p>
      </div>
    </div>
  );
}

export function UserManagement({ accounts, loading, selfId, onSetRole, onSetStatus, onSetBirthday }) {
  const activeSuperadmins = accounts.filter(a => a.role === "superadmin" && a.status === "active").length;
  const statusLabels = { active: "Active", pending: "Pending", rejected: "Rejected", inactive: "Inactive" };
  const statusTone = (status) => (status === "active" ? "active" : status === "pending" ? "neutral" : "inactive");
  const today = new Date().toISOString().slice(0, 10);

  function accountState(a) {
    const isSelf = a.userId === selfId;
    const isLastSuperadmin = a.role === "superadmin" && a.status === "active" && activeSuperadmins <= 1;
    return { isSelf, isLastSuperadmin, locked: isSelf || isLastSuperadmin };
  }

  function statusAction(a, locked, isSelf) {
    if (locked) return <span className="text-xs text-stone-400">{isSelf ? "Ikaw ito" : "Huling superadmin"}</span>;
    if (a.status === "active") {
      return (
        <button type="button" onClick={() => onSetStatus(a.userId, "inactive")} className="min-h-11 w-full rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-sm font-semibold hover:bg-rose-100">
          Deactivate
        </button>
      );
    }
    if (a.status === "pending") return <span className="text-xs text-stone-400">I-approve sa Pending Users</span>;
    return (
      <button type="button" onClick={() => onSetStatus(a.userId, "active")} className="min-h-11 w-full rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-semibold hover:bg-emerald-100">
        Activate
      </button>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-emerald-900">User Management</h1>
          <p className="text-sm text-stone-500 mt-1">Manage roles, account status, and birthdays.</p>
        </div>
      </div>

      {loading ? (
        <>
          <MobileCard className="xl:hidden"><p className="text-sm text-stone-500">Loading…</p></MobileCard>
          <div className="hidden xl:block bg-white rounded-xl border border-stone-200 p-4 text-sm text-stone-500">Loading…</div>
        </>
      ) : (
        <>
          <div className="xl:hidden grid gap-3 lg:grid-cols-2">
            {accounts.map((a) => {
              const { isSelf, locked } = accountState(a);
              return (
                <MobileCard key={a.userId}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-semibold text-emerald-950 break-words">{a.name || "Unknown"}</p>
                        {isSelf && <span className="text-[10px] text-emerald-700 font-semibold">(You)</span>}
                      </div>
                      <p className="text-xs text-stone-500 break-all">{a.email || "—"}</p>
                    </div>
                    <Badge tone={statusTone(a.status)}>{statusLabels[a.status] || a.status}</Badge>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor={`user-bday-${a.userId}`} className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">Birthday</label>
                      <input
                        id={`user-bday-${a.userId}`}
                        type="date"
                        value={a.birthday || ""}
                        max={today}
                        onChange={(e) => onSetBirthday(a.userId, e.target.value)}
                        className={`mt-1 ${inputCls}`}
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">Role</span>
                      {locked ? (
                        <div className="mt-1 min-h-11 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-500">
                          {ROLE_LABELS[a.role] || a.role}
                        </div>
                      ) : (
                        <select
                          value={a.role}
                          onChange={(e) => onSetRole(a.userId, e.target.value)}
                          aria-label={`Role for ${a.name || "user"}`}
                          className={`mt-1 ${inputCls}`}
                        >
                          {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                        </select>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 border-t border-stone-100 pt-3">
                    {statusAction(a, locked, isSelf)}
                  </div>
                </MobileCard>
              );
            })}
          </div>

          <div className="hidden xl:block bg-white rounded-xl border border-stone-200 overflow-x-auto">
            <table className="w-full text-sm min-w-[820px]">
              <thead>
                <tr className="bg-emerald-50 text-emerald-900 text-left">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Birthday</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {accounts.length === 0 ? (
                  <tr><td colSpan="6" className="p-4 text-stone-500">No accounts yet.</td></tr>
                ) : accounts.map((a) => {
                  const { isSelf, locked } = accountState(a);
                  return (
                    <tr key={a.userId} className="border-t border-stone-100">
                      <td className="p-3">{a.name}{isSelf && <span className="text-[10px] text-emerald-700 font-semibold ml-1.5">(You)</span>}</td>
                      <td className="p-3 text-stone-500 break-all">{a.email || "—"}</td>
                      <td className="p-3">
                        <input
                          type="date"
                          value={a.birthday || ""}
                          max={today}
                          onChange={(e) => onSetBirthday(a.userId, e.target.value)}
                          className="px-2 py-1 border border-stone-200 rounded-lg text-sm text-stone-600"
                        />
                      </td>
                      <td className="p-3">
                        {locked ? (
                          <span>{ROLE_LABELS[a.role] || a.role}</span>
                        ) : (
                          <select className="px-2 py-1 border border-stone-200 rounded-lg text-sm" value={a.role} onChange={(e) => onSetRole(a.userId, e.target.value)}>
                            {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                          </select>
                        )}
                      </td>
                      <td className="p-3"><Badge tone={statusTone(a.status)}>{statusLabels[a.status] || a.status}</Badge></td>
                      <td className="p-3 whitespace-nowrap">
                        {locked ? (
                          <span className="text-xs text-stone-400">{isSelf ? "Ikaw ito" : "Huling superadmin"}</span>
                        ) : a.status === "active" ? (
                          <button type="button" onClick={() => onSetStatus(a.userId, "inactive")} className="text-rose-600 text-xs font-medium">Deactivate</button>
                        ) : a.status === "pending" ? (
                          <span className="text-xs text-stone-400">I-approve sa Pending Users</span>
                        ) : (
                          <button type="button" onClick={() => onSetStatus(a.userId, "active")} className="text-emerald-700 text-xs font-medium">Activate</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
