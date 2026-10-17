import React, { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { compressToSquare, formatBytes, MAX_INPUT_MB } from "../lib/image.js";

const BUCKET = "avatars";

// Profile photo upload para sa members.
//   * Ang photo ay client-side compressed (512px square, WebP, ~20-40 KB).
//   * Folder: {user_id}/ ng member. Kung hindi pa naka-link ang member row sa
//     isang account, "member-<id>" ang folder (leaders lang ang makaka-upload).
//   * Binubura ang lumang file pag nagpalit — 1 photo lang per member.
export function useAvatar() {
  const [busy, setBusy] = useState(false);

  const upload = async (member, file) => {
    if (!member?.id || !file) return null;
    if (!/^image\//i.test(file.type || "")) {
      toast.error("Please choose an image file (JPG or PNG).");
      return null;
    }
    if (file.size > MAX_INPUT_MB * 1024 * 1024) {
      toast.error(`Photo is too large — max ${MAX_INPUT_MB} MB bago i-compress.`);
      return null;
    }

    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (!uid) {
        toast.error("Please log in first.");
        return null;
      }

      let compressed;
      try {
        compressed = await compressToSquare(file, { size: 512, quality: 0.82 });
      } catch (err) {
        console.error("Avatar compression failed:", err);
        toast.error("Could not read this photo. Please use a JPG or PNG.");
        return null;
      }

      const folder = member.userId || `member-${member.id}`;
      const path = `${folder}/avatar-${Date.now()}.${compressed.ext}`;
      const up = await supabase.storage.from(BUCKET).upload(path, compressed.blob, {
        cacheControl: "31536000",
        contentType: compressed.mime,
      });
      if (up.error) {
        console.error("Avatar upload failed:", up.error);
        toast.error("Upload failed: " + up.error.message);
        return null;
      }

      const url = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      const { error: updErr } = await supabase.from("members").update({ avatar_url: url }).eq("id", member.id);
      if (updErr) {
        console.error("Failed to save avatar:", updErr);
        await supabase.storage.from(BUCKET).remove([path]);
        toast.error("Failed to save photo: " + updErr.message);
        return null;
      }

      // Burahin ang lumang file(s) para 1 photo lang per member.
      const { data: oldFiles } = await supabase.storage.from(BUCKET).list(folder);
      const stale = (oldFiles || []).map((f) => `${folder}/${f.name}`).filter((p) => p !== path);
      if (stale.length) await supabase.storage.from(BUCKET).remove(stale);

      toast.success(`Profile photo updated (${formatBytes(compressed.blob.size)}).`);
      return url;
    } finally {
      setBusy(false);
    }
  };

  const remove = async (member) => {
    if (!member?.id) return false;
    setBusy(true);
    try {
      const { error: updErr } = await supabase.from("members").update({ avatar_url: null }).eq("id", member.id);
      if (updErr) {
        toast.error("Failed to remove photo: " + updErr.message);
        return false;
      }
      const folder = member.userId || `member-${member.id}`;
      const { data: files } = await supabase.storage.from(BUCKET).list(folder);
      const paths = (files || []).map((f) => `${folder}/${f.name}`);
      if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
      toast.success("Profile photo removed.");
      return true;
    } finally {
      setBusy(false);
    }
  };

  return { busy, upload, remove };
}
