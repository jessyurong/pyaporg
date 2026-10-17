import React, { useRef } from "react";
import { CalendarDays, Camera, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { fmtBirthday } from "../lib/utils.js";
import { MemberAvatar } from "./MembersPage.jsx";
import { Badge } from "./ui.jsx";

// Sariling profile screen — makikita ng LAHAT ng naka-login.
// Dito pwedeng mag-add/palit ng profile photo ang bawat member nang hindi
// kailangang i-expose ang buong members directory.
export function MyProfile({ member, accountName, accountEmail, photoBusy = false, onPhotoChange, onPhotoRemove }) {
  const fileRef = useRef(null);

  if (!member) {
    return (
      <div>
        <h1 className="text-xl font-bold text-emerald-900 mb-5">My Profile</h1>
        <div className="bg-white rounded-xl border border-stone-200 p-8 text-center max-w-xl">
          <UserRound size={32} className="mx-auto text-stone-300 mb-3" />
          <p className="text-sm font-semibold text-stone-700">Wala pang naka-link na member record sa account mo</p>
          <p className="text-xs text-stone-500 mt-1.5">
            Sabihan ang isang leader o superadmin para i-link ang account mo sa Members list — pagkatapos, pwede ka nang mag-upload ng profile photo dito mismo.
          </p>
          {(accountName || accountEmail) && <p className="text-xs text-stone-400 mt-3">Naka-login bilang {accountName || accountEmail}</p>}
        </div>
      </div>
    );
  }

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

      <div className="bg-white rounded-xl border border-stone-200 p-5 text-sm space-y-2.5 max-w-xl">
        <h3 className="font-semibold text-emerald-900 mb-1">Personal Info</h3>
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

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mt-4 text-xs text-amber-800 max-w-xl">
        Ang photo ay awtomatikong pinapaliit (~20-40 KB lang) bago i-upload para hindi mapuno ang storage. JPG o PNG na litrato ang irekomenda.
      </div>
    </div>
  );
}
