import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useAttendance(active = true) {
  const [records, setRecords] = useState({});
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    if (!active) { setRecords({}); setNotes({}); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from("attendance").select("*");
    if (error) {
      console.error("Failed to load attendance:", error);
      setRecords({});
      setNotes({});
    } else {
      const rec = {};
      const nts = {};
      for (const r of data || []) {
        if (!rec[r.event_id]) rec[r.event_id] = {};
        rec[r.event_id][r.member_id] = r.status;
        if (r.note) {
          if (!nts[r.event_id]) nts[r.event_id] = {};
          nts[r.event_id][r.member_id] = r.note;
        }
      }
      setRecords(rec);
      setNotes(nts);
    }
    setLoading(false);
  };
  useEffect(() => { refresh(); }, [active]);
  const save = async (eventId, statusMap, noteMap) => {
    const rows = Object.entries(statusMap).map(([memberId, status]) => {
      const note = (noteMap?.[memberId] || "").trim();
      return { event_id: eventId, member_id: memberId, status, note: note || null };
    });
    if (rows.length === 0) return true;
    const { error } = await supabase.from("attendance").upsert(rows, { onConflict: "event_id,member_id" });
    if (error) { toast.error("Failed to save attendance: " + error.message); return false; }
    await refresh();
    toast.success("Attendance saved.");
    return true;
  };
  return { records, notes, loading, save, refresh };
}
