import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useEvents(active = true) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    if (!active) { setItems([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from("events").select("*").order("event_date", { ascending: false });
    if (error) {
      console.error("Failed to load events:", error);
      setItems([]);
    } else {
      setItems((data || []).map((e) => ({
        id: e.id,
        title: e.title,
        date: (e.event_date || "").slice(0, 10),
        location: e.location || "",
      })));
    }
    setLoading(false);
  };
  useEffect(() => { refresh(); }, [active]);
  const add = async (event) => {
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("events").insert({
      title: event.title,
      event_date: event.date || new Date().toISOString().slice(0, 10),
      location: event.location || null,
      created_by: u?.user?.id ?? null,
    });
    if (error) { toast.error("Failed to add event: " + error.message); return false; }
    await refresh();
    toast.success("Event added.");
    return true;
  };
  const remove = async (id) => {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) { toast.error("Failed to delete event: " + error.message); return; }
    await refresh();
    toast.success("Event deleted.");
  };
  return { items, loading, add, remove, refresh };
}
