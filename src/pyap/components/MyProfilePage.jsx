import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, Camera, Mail, MapPin, Pencil, Phone, UserRound } from "lucide-react";
import { fmtBirthday } from "../lib/utils.js";
import { MemberAvatar } from "./MembersPage.jsx";
import { Badge, inputCls } from "./ui.jsx";

// Sariling profile screen — makikita ng LAHAT ng naka-login.
// Dito pwedeng mag-add/palit ng profile photo at i-edit ang sariling info
// (name, contact, email, birthday, address) nang hindi kailangang i-expose
// ang buong members directory.
export function MyProfile({ member, accountName, accountEmail, photoBusy = false, onPhotoChange, onPhotoRemove, onSave }) {
  const fileRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", contact: "", email: "", birthday: "", address: "" });

  if (!member) {
    return (
      <div>
        <h1 className="text-xl font-bold text-emerald-900 mb-5">My Profile</h1>
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center max-w-xl">
          <UserRound size={32} className="mx-auto text-stone-300 mb-3" />
          <p className="text-sm font-semibold text-stone-700">Wala pang naka-link na member record sa account mo</p>
          <p className="text-xs text-stone-500 mt-1.5">
            Sabihan ang isang leader o superadmin para i-link ang account mo sa Members list — pagkatapos, pwede ka nang mag-upload ng profile photo at mag-edit ng info dito mismo.
          </p>
          {(accountName || accountEmail) && <p className="text-xs text-stone-400 mt-3">Naka-login bilang {accountName || accountEmail}</p>}
        </div>
      </div>
    );
  }

  const startEdit = () => {
    setForm({
      name: member.name || "",
      contact: member.contact || "",
      email: member.email || "",
      birthday: member.birthday || "",
      address: member.address || "",
    });
    setEditing(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Ilagay ang pangalan mo.");
      return;
    }
    setSaving(true);
    const ok = await onSave?.(form);
    setSaving(false);
    if (ok) setEditing(false);
  };

  // Mga pwedeng i-edit ng sarili — position/status ay para sa leaders lang.
  const fields = [
    { key: "name", label: "Full Name", type: "text", placeholder: "Full Name" },
    { key: "contact", label: "Contact Number", type: "tel", placeholder: "09xx xxx xxxx" },
    { key: "email", label: "Email", type: "email", placeholder: "email@example.com" },
    { key: "birthday", label: "Birthday", type: "date", placeholder: "" },
    { key: "address", label: "Address", type: "text", placeholder: "Address" },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-emerald-900 mb-5">My Profile</h1>

      <div className="bg-white rounded-xl border border-stone-200 p-5 mb-5 flex items-center gap-5">
        <div className="relative shrink-0">
          <MemberAvatar member={member} size={96} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={photoBusy}
            aria-label="Change profile photo"
            title="Change profile photo"
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white flex items-center justify-center shadow disabled:opacity-60"
          >
            <Camera size={15} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) onPhotoChange?.(f);
            }}
          />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold">{member.name}</h2>
          <p className="text-sm text-stone-500 mt-0.5">
            {member.position || "Member"} — <Badge tone={member.status}>{member.status}</Badge>
          </p>
          <p className="text-[11px] text-stone-400 mt-1.5">
            {photoBusy ? "Uploading photo…" : "Tap the camera icon to add o palitan ang profile photo mo."}
          </p>
          {!photoBusy && member.avatarUrl && (
            <button type="button" onClick={onPhotoRemove} className="text-[11px] text-rose-600 hover:underline mt-0.5">
              Remove photo
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-5 text-sm max-w-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-emerald-900">Personal Info</h3>
          {!editing && onSave && (
            <button
              type="button"
              onClick={startEdit}
              className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5"
            >
              <Pencil size={12} /> Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-3 mt-3">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="block text-[11px] font-semibold text-stone-500 mb-1">{f.label}</label>
                <input
                  className={inputCls}
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              </div>
            ))}
            <p className="text-[11px] text-stone-400">Position at status ay pinamamahalaan ng mga leaders — hindi mababago dito.</p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-sm font-semibold rounded-lg px-4 py-2"
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={saving}
                className="text-sm font-semibold text-stone-600 border border-stone-200 rounded-lg px-4 py-2 hover:bg-stone-50 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 mt-2.5">
            <p className="flex items-center gap-2 text-stone-600">
              <Phone size={13} className="text-stone-400 shrink-0" /> {member.contact || "—"}
            </p>
            <p className="flex items-center gap-2 text-stone-600">
              <Mail size={13} className="text-stone-400 shrink-0" /> {member.email || accountEmail || "—"}
            </p>
            <p className="flex items-center gap-2 text-stone-600">
              <CalendarDays size={13} className="text-stone-400 shrink-0" /> {fmtBirthday(member.birthday)}
            </p>
            <p className="flex items-start gap-2 text-stone-600">
              <MapPin size={13} className="text-stone-400 mt-0.5 shrink-0" /> {member.address || "—"}
            </p>
            <p className="text-[11px] text-stone-400 pt-1">Nag-member since {member.joined || "—"}</p>
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mt-4 text-xs text-amber-800 max-w-xl">
        Ang photo ay awtomatikong pinapaliit (~20-40 KB lang) bago i-upload para hindi mapuno ang storage. JPG o PNG na litrato ang irekomenda.
      </div>
    </div>
  );
}
