import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// canRead = true lang para sa Super Admin, President, Secretary, at Organizer.
// Ang ibang naka-login ay makakapag-send lang ng suggestion (tulad ng guest)
// pero hindi makikita ang inbox.
export function useSuggestions(canRead = false) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    if (!canRead) {
      setItems([]);
      setLoading(false);
      return;
    }
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
  useEffect(() => { refresh(); }, [canRead]);
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
    if (user && canRead) await refresh();
    toast.success("Suggestion sent.");
    return true;
  };
  const remove = async (id) => {
    if (!canRead) return;
    const { error } = await supabase.from("suggestions").delete().eq("id", id);
    if (error) { toast.error("Failed to delete suggestion: " + error.message); return; }
    await refresh();
    toast.success("Suggestion deleted.");
  };
  return { items, loading, add, remove, refresh };
}
