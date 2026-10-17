import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const DEFAULT_WIDGETS = { totalMembers: true, activeMembers: true, totalEvents: true, attendanceRate: true, fundBalance: true, birthdays: true, birthdayList: true, recentAnnouncements: true, snapshots: true, upcomingEvents: true, topAttenders: true, attendanceTrend: true };

export function useDashboardSettings() {
  const [widgets, setWidgets] = useState(DEFAULT_WIDGETS);
  const refresh = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) { setWidgets(DEFAULT_WIDGETS); return; }
    const { data, error } = await supabase.from("dashboard_settings").select("visible_widgets").eq("user_id", u.user.id).maybeSingle();
    if (error) { console.error("Failed to load dashboard settings:", error); return; }
    const vw = data?.visible_widgets;
    if (vw && !Array.isArray(vw) && typeof vw === "object" && Object.keys(vw).length > 0) {
      setWidgets({ ...DEFAULT_WIDGETS, ...vw });
    } else {
      setWidgets(DEFAULT_WIDGETS);
    }
  };
  useEffect(() => { refresh(); }, []);
  const save = async (next) => {
    setWidgets(next);
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return false;
    const { error } = await supabase.from("dashboard_settings").upsert(
      { user_id: u.user.id, visible_widgets: next, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );
    if (error) { toast.error("Failed to save dashboard settings: " + error.message); return false; }
    toast.success("Dashboard layout saved.");
    return true;
  };
  return { widgets, save, refresh };
}
