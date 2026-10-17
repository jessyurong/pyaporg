import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_WELCOME } from "../Welcome.jsx";

export function useWelcomeContent() {
  const [content, setContent] = useState(DEFAULT_WELCOME);
  const refresh = async () => {
    const { data, error } = await supabase.from("welcome_content").select("content").eq("id", 1).maybeSingle();
    if (error) { console.error("Failed to load welcome content:", error); return; }
    if (data?.content && Object.keys(data.content).length > 0) {
      setContent({ ...DEFAULT_WELCOME, ...data.content });
    }
  };
  useEffect(() => { refresh(); }, []);
  const save = async (next) => {
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("welcome_content").upsert(
      { id: 1, content: next, updated_at: new Date().toISOString(), updated_by: u?.user?.id ?? null },
      { onConflict: "id" }
    );
    if (error) { toast.error("Failed to save welcome page: " + error.message); return false; }
    setContent({ ...DEFAULT_WELCOME, ...next });
    toast.success("Welcome page saved.");
    return true;
  };
  return { content, save, refresh };
}
