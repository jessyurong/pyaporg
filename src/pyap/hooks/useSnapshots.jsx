import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function useSnapshots() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("snapshots").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to load snapshots:", error);
      setItems([]);
    } else {
      setItems((data || []).map((s) => ({
        id: s.id,
        title: s.title || "",
        album: s.album || "",
        path: s.image_path,
        url: supabase.storage.from("snapshots").getPublicUrl(s.image_path).data.publicUrl,
        createdAt: (s.created_at || "").slice(0, 10),
      })));
    }
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);
  const add = async (files, meta = {}) => {
    const { data: u } = await supabase.auth.getUser();
    let failed = 0;
    for (const file of files) {
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;
      const up = await supabase.storage.from("snapshots").upload(path, file, { cacheControl: "3600" });
      if (up.error) { console.error("Upload failed:", up.error); failed += 1; continue; }
      const { error } = await supabase.from("snapshots").insert({
        title: meta.title || null,
        album: meta.album || null,
        image_path: path,
        uploaded_by: u?.user?.id ?? null,
      });
      if (error) {
        console.error("Failed to save snapshot:", error);
        failed += 1;
        await supabase.storage.from("snapshots").remove([path]);
      }
    }
    if (failed > 0) toast.error(`Sorry — ${failed} photo(s) failed to upload.`);
    else toast.success("Upload complete.");
    await refresh();
    return failed === 0;
  };
  const remove = async (id) => {
    const item = items.find((s) => s.id === id);
    const { error } = await supabase.from("snapshots").delete().eq("id", id);
    if (error) { toast.error("Failed to delete photo: " + error.message); return; }
    if (item?.path) await supabase.storage.from("snapshots").remove([item.path]);
    await refresh();
    toast.success("Photo deleted.");
  };
  return { items, loading, add, remove, refresh };
}
