import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useAccounts(active = true) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    if (!active) { setAccounts([]); setLoading(false); return; }
    setLoading(true);
    const [pRes, rRes] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name, email, status, created_at, birthday").order("created_at", { ascending: true }),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    if (pRes.error || rRes.error) {
      console.error("Failed to load accounts:", pRes.error || rRes.error);
      setAccounts([]);
    } else {
      const roles = Object.fromEntries((rRes.data || []).map((r) => [r.user_id, r.role]));
      setAccounts((pRes.data || []).map((p) => ({
        userId: p.user_id,
        name: p.full_name || "—",
        email: p.email || "",
        status: p.status,
        role: roles[p.user_id] || "member",
        createdAt: (p.created_at || "").slice(0, 10),
        birthday: (p.birthday || "").slice(0, 10),
      })));
    }
    setLoading(false);
  };
  useEffect(() => { refresh(); }, [active]);
  const setRole = async (userId, role) => {
    const { error } = await supabase.from("user_roles").update({ role }).eq("user_id", userId);
    if (error) { toast.error("Failed to change role: " + error.message); return false; }
    await refresh();
    toast.success("Role updated.");
    return true;
  };
  const setStatus = async (userId, status) => {
    const { error } = await supabase.from("profiles").update({ status }).eq("user_id", userId);
    if (error) { toast.error("Failed to update account status: " + error.message); return false; }
    await refresh();
    toast.success("Account status updated.");
    return true;
  };
  const setBirthday = async (userId, birthday) => {
    const { error } = await supabase.from("profiles").update({ birthday: birthday || null }).eq("user_id", userId);
    if (error) { toast.error("Failed to update birthday: " + error.message); return false; }
    setAccounts((prev) => prev.map((a) => (a.userId === userId ? { ...a, birthday: birthday || "" } : a)));
    toast.success("Birthday updated.");
    return true;
  };
  return { accounts, loading, setRole, setStatus, setBirthday, refresh };
}
