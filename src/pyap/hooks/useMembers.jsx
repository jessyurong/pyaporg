import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const add = async (member, silent = false) => {
    const { error } = await supabase.from("members").insert({
      full_name: member.name,
      position: member.position || null,
      phone: member.contact || null,
      birthday: member.birthday || null,
      address: member.address || null,
      email: member.email || null,
    });
    if (error) { toast.error("Failed to add member: " + error.message); return false; }
    await refresh();
    if (!silent) toast.success("Member added.");
    return true;
  };
  const remove = async (id) => {
    const { error } = await supabase.from("members").delete().eq("id", id);
    if (error) { toast.error("Failed to delete member: " + error.message); return; }
    await refresh();
    toast.success("Member deleted.");
  };
  return { items, loading, add, remove, refresh };
}
