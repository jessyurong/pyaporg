import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useSuggestions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("suggestions").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to load suggestions:", error);
      setItems([]);
    } else {
      setItems((data || []).map((s) => ({
        id: s.id,
        message: s.message,
        date: (s.created_at || "").slice(0, 10),
        status: s.status,
        submitterName: s.submitter_name,
        isAnonymous: s.is_anonymous,
      })));
    }
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);
  const add = async (message) => {
    const { data: u } = await supabase.auth.getUser();
    const user = u?.user;
    const { error } = await supabase.from("suggestions").insert({
      message,
      submitted_by: user?.id ?? null,
      submitter_name: user?.user_metadata?.full_name || (user?.email ? user.email.split("@")[0] : "Guest"),
      is_anonymous: !user,
    });
    if (error) { toast.error("Failed to send suggestion: " + error.message); return false; }
    if (user) await refresh();
    toast.success("Suggestion sent.");
    return true;
  };
  const remove = async (id) => {
    const { error } = await supabase.from("suggestions").delete().eq("id", id);
    if (error) { toast.error("Failed to delete suggestion: " + error.message); return; }
    await refresh();
    toast.success("Suggestion deleted.");
  };
  return { items, loading, add, remove, refresh };
}
