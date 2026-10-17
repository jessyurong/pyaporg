import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useAnnouncements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    if (!error) {
      setItems((data || []).map((a) => ({
        id: a.id,
        title: a.title,
        content: a.body,
        urgency: a.urgency || "normal",
        date: (a.created_at || "").slice(0, 10),
      })));
    }
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);
  const add = async ({ title, content, urgency }) => {
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("announcements").insert({
      title, body: content || "", urgency: urgency || "normal", created_by: u?.user?.id ?? null,
    });
    if (error) { toast.error("Failed to post announcement: " + error.message); return false; }
    await refresh();
    toast.success("Announcement posted.");
    return true;
  };
  const remove = async (id) => {
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) { toast.error("Failed to delete: " + error.message); return; }
    await refresh();
    toast.success("Announcement deleted.");
  };
  return { items, loading, add, remove, refresh };
}
