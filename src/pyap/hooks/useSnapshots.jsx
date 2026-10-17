import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SNAPSHOT_LIMIT } from "../constants.js";
import { compressImage, formatBytes, isHeic, isSupportedImage, MAX_INPUT_MB } from "../lib/image.js";

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
    // Limit check: pag puno na, kailangan munang mag-delete ng lumang photos.
    const remaining = SNAPSHOT_LIMIT - items.length;
    if (remaining <= 0) {
      toast.error(`Snapshot limit reached (${SNAPSHOT_LIMIT} photos). Delete old photos first bago maka-upload ulit.`);
      return false;
    }
    let queue = [...files];
    if (queue.length > remaining) {
      toast.error(`Limit is ${SNAPSHOT_LIMIT} photos — ${remaining} slot${remaining === 1 ? "" : "s"} na lang ang natitira. Ang unang ${remaining} lang ang i-a-upload.`);
      queue = queue.slice(0, remaining);
    }

    const { data: u } = await supabase.auth.getUser();
    let failed = 0;
    let tooBig = 0;
    let unsupported = 0;
    let gifStill = 0;
    let originalBytes = 0;
    let savedBytes = 0;

    for (const file of queue) {
      if (!isSupportedImage(file)) { unsupported += 1; continue; }
      if (file.size > MAX_INPUT_MB * 1024 * 1024) { tooBig += 1; continue; }

      // Auto-compress bago i-upload (~1600px, WebP/JPEG, ~0.2-0.5 MB).
      let uploadBlob = file;
      let uploadName = file.name;
      try {
        const out = await compressImage(file, { maxSize: 1600, quality: 0.8 });
        uploadBlob = out.blob;
        uploadName = out.name;
        originalBytes += file.size;
        savedBytes += out.blob.size;
        if (file.type === "image/gif") gifStill += 1;
      } catch (err) {
        console.error("Compression failed, uploading original:", err);
        // HEIC na hindi ma-decode: hindi rin ito ma-display ng browser — i-skip.
        if (isHeic(file)) { unsupported += 1; continue; }
      }

      const safe = uploadName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safe}`;
      const up = await supabase.storage.from("snapshots").upload(path, uploadBlob, {
        cacheControl: "3600",
        contentType: uploadBlob.type || file.type || "application/octet-stream",
      });
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

    if (unsupported > 0) toast.error(`${unsupported} file${unsupported === 1 ? "" : "s"} skipped — JPG, PNG, WebP, o GIF lang ang supported.`);
    if (tooBig > 0) toast.error(`${tooBig} photo${tooBig === 1 ? "" : "s"} skipped — masyadong malaki (max ${MAX_INPUT_MB} MB bago i-compress).`);
    if (failed > 0) toast.error(`Sorry — ${failed} photo${failed === 1 ? "" : "s"} failed to upload.`);
    if (gifStill > 0) toast.info("GIF saved as a still photo para maliit ang file size.");
    if (failed === 0 && tooBig === 0 && unsupported === 0 && queue.length > 0) {
      const saved = originalBytes > 0 ? ` ${formatBytes(originalBytes)} → ${formatBytes(savedBytes)} after compression.` : "";
      toast.success(`Upload complete.${saved}`);
    }
    await refresh();
    return failed === 0 && tooBig === 0 && unsupported === 0;
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
