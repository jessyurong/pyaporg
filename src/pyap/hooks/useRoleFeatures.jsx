import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { GRANTABLE_FEATURES } from "../constants.js";

export function useRoleFeatures(active) {
  const [extras, setExtras] = useState({});
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    if (!active) { setExtras({}); setLoading(false); return; }
    const { data, error } = await supabase.from("role_features").select("role, features");
    if (error) {
      console.error("Failed to load role features:", error);
      setExtras({});
    } else {
      const map = {};
      (data || []).forEach((r) => {
        map[r.role] = Array.isArray(r.features) ? r.features.filter((f) => typeof f === "string") : [];
      });
      setExtras(map);
    }
    setLoading(false);
  };
  useEffect(() => { refresh(); }, [active]);
  const save = async (roleName, features) => {
    try {
      const clean = Array.from(new Set(features)).filter((f) => GRANTABLE_FEATURES.some((g) => g.key === f));
      const { error } = await supabase.from("role_features").upsert({ role: roleName, features: clean }, { onConflict: "role" });
      if (error) { toast.error("Failed to save feature access: " + error.message); return false; }
      await refresh();
      toast.success("Feature access saved.");
      return true;
    } catch (err) {
      console.error("Failed to save feature access:", err);
      toast.error("Failed to save feature access: " + (err?.message || "Please try again."));
      return false;
    }
  };
  return { extras, loading, save, refresh };
}
