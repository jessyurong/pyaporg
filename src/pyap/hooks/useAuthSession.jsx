import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAuthSession() {
  const [state, setState] = useState({ loading: true, session: null, role: null, name: null, status: null });
  useEffect(() => {
    let mounted = true;
    async function loadProfile(userId) {
      const [{ data: rr }, { data: pp }] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
        supabase.from("profiles").select("full_name, status").eq("user_id", userId).maybeSingle(),
      ]);
      return {
        role: rr?.role || "member",
        name: pp?.full_name || null,
        status: pp?.status ?? "active",
      };
    }
    const applySession = async (s) => {
      const { role, name, status } = await loadProfile(s.user.id);
      if (mounted) setState({ loading: false, session: s, role, name, status });
    };
    const applyFallback = (s) => {
      if (mounted) setState({ loading: false, session: s, role: "member", name: null, status: "active" });
    };
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!mounted) return;
      if (!s) { setState({ loading: false, session: null, role: null, name: null, status: null }); return; }
      setState((prev) => ({ ...prev, loading: true, session: s }));
      setTimeout(async () => {
        try { await applySession(s); } catch (err) { console.error("Failed to load user profile:", err); applyFallback(s); }
      }, 0);
    });
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      if (!data.session) { setState({ loading: false, session: null, role: null, name: null, status: null }); return; }
      try { await applySession(data.session); } catch (err) { console.error("Failed to load user profile:", err); applyFallback(data.session); }
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);
  return state;
}
