import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAccountBirthdays(enabled) {
  const [items, setItems] = useState([]);
  const refresh = async () => {
    if (!enabled) { setItems([]); return; }
    const { data, error } = await supabase.rpc("active_birthdays");
    if (error) {
      console.error("Failed to load account birthdays:", error);
      setItems([]);
    } else {
      setItems((data || []).map((r) => ({ id: "acct-" + (r.name || "member"), name: r.name || "Member", birthday: (r.birthday || "").slice(0, 10) })));
    }
  };
  useEffect(() => { refresh(); }, [enabled]);
  return { items, refresh };
}
