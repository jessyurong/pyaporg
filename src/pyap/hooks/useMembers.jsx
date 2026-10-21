import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Case/space-insensitive compare para sa pangalan at email.
const normText = (value) => String(value || "").trim().toLowerCase().replace(/\s+/g, " ");

export function useMembers(active = true) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    if (!active) { setItems([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from("members").select("*").order("full_name", { ascending: true });
    if (error) {
      console.error("Failed to load members:", error);
      setItems([]);
    } else {
      setItems((data || []).map((m) => ({
        id: m.id,
        userId: m.user_id || null,
        avatarUrl: m.avatar_url || "",
        name: m.full_name,
        position: m.position || "",
        status: m.status || "active",
        contact: m.phone || "",
        birthday: m.birthday || "",
        address: m.address || "",
        joined: (m.created_at || "").slice(0, 10),
        email: m.email || "",
      })));
    }
    setLoading(false);
  };
  useEffect(() => { refresh(); }, [active]);
  const add = async (member, silent = false, userId = null) => {
    // Kung walang explicit na user_id (hal. manual Add Member), hanapin ang
    // active account na tugma sa email/name para agad na naka-link ang row.
    let linkedUserId = userId || member.userId || null;
    if (!linkedUserId) {
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .eq("status", "active");
      if (pErr) {
        console.error("Failed to look up profile for member linking:", pErr);
      } else {
        const email = normText(member.email);
        const name = normText(member.name);
        const byEmail = email ? (profiles || []).filter((p) => normText(p.email) === email) : [];
        const byName = name ? (profiles || []).filter((p) => normText(p.full_name) === name) : [];
        const matches = byEmail.length > 0 ? byEmail : byName;
        if (matches.length === 1) linkedUserId = matches[0].user_id;
      }
    }

    const { error } = await supabase.from("members").insert({
      full_name: member.name,
      position: member.position || null,
      phone: member.contact || null,
      birthday: member.birthday || null,
      address: member.address || null,
      email: member.email || null,
      user_id: linkedUserId,
    });
    if (error) { toast.error("Failed to add member: " + error.message); return false; }
    await refresh();
    if (!silent) toast.success("Member added.");
    return true;
  };
  // I-link ang existing member row sa isang account (leaders lang ang
  // pinapayagan ng RLS). Ginagamit pagkatapos mag-approve ng account.
  const link = async (id, userId) => {
    if (!id || !userId) return false;
    const { error } = await supabase.from("members").update({ user_id: userId }).eq("id", id);
    if (error) { console.error("Failed to link member account:", error); return false; }
    await refresh();
    return true;
  };
  const remove = async (id) => {
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) { toast.error("Failed to delete member: " + error.message); return; }
    await refresh();
    toast.success("Member deleted.");
  };
  const update = async (id, fields) => {
    const { error } = await supabase.from("members").update({
      full_name: (fields.name || "").trim(),
      phone: (fields.contact || "").trim() || null,
      birthday: fields.birthday || null,
      address: (fields.address || "").trim() || null,
      email: (fields.email || "").trim() || null,
    }).eq("id", id);
    if (error) { toast.error("Failed to update profile: " + error.message); return false; }
    await refresh();
    toast.success("Profile updated.");
    return true;
  };
  return { items, loading, add, update, remove, link, refresh };
}
