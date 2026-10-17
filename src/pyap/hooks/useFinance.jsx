import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useFinance(active = true) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    if (!active) { setItems([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from("finance_transactions").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to load finance:", error);
      setItems([]);
    } else {
      setItems((data || []).map((t) => ({
        id: t.id,
        type: t.type,
        category: t.description || "",
        amount: Number(t.amount) || 0,
        date: (t.transaction_date || "").slice(0, 10),
      })));
    }
    setLoading(false);
  };
  useEffect(() => { refresh(); }, [active]);
  const add = async (entry) => {
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("finance_transactions").insert({
      type: entry.type,
      amount: entry.amount,
      description: entry.category || null,
      created_by: u?.user?.id ?? null,
    });
    if (error) { toast.error("Failed to add finance entry: " + error.message); return false; }
    await refresh();
    toast.success("Finance entry added.");
    return true;
  };
  const remove = async (id) => {
    const { error } = await supabase.from("finance_transactions").delete().eq("id", id);
    if (error) { toast.error("Failed to delete finance entry: " + error.message); return; }
    await refresh();
    toast.success("Finance entry deleted.");
  };
  return { items, loading, add, remove, refresh };
}
