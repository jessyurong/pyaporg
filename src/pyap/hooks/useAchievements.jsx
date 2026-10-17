import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useAchievements(active = true) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    if (!active) { setItems([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from("achievements").select("*").order("awarded_date", { ascending: false });
    if (error) {
      console.error("Failed to load achievements:", error);
      setItems([]);
    } else {
      setItems((data || []).map((a) => ({
        id: a.id,
        memberId: a.member_id,
        title: a.title,
        description: a.description || "",
        badge: a.badge || "medal",
        date: (a.awarded_date || "").slice(0, 10),
      })));
    }
    setLoading(false);
  };
  useEffect(() => { refresh(); }, [active]);
  const add = async (item) => {
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("achievements").insert({
      member_id: item.memberId,
      title: item.title,
      description: item.description || null,
      badge: item.badge || null,
      created_by: u?.user?.id ?? null,
    });
    if (error) { toast.error("Failed to add achievement: " + error.message); return false; }
    await refresh();
    toast.success("Achievement added.");
    return true;
  };
  const remove = async (id) => {
    const { error } = await supabase.from("achievements").delete().eq("id", id);
    if (error) { toast.error("Failed to delete achievement: " + error.message); return; }
    await refresh();
    toast.success("Achievement deleted.");
  };
  return { items, loading, add, remove, refresh };
}
