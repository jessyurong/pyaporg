// Superadmin-only password reset.
//
// Why this lives on the server: changing another user's password requires the
// Supabase service role key. That key must NEVER reach the browser, so the
// browser only sends its own access token and the new password here; this
// handler verifies the caller is an active superadmin and only then calls the
// Supabase Admin API.
//
// NOTE: Supabase stores passwords as bcrypt hashes. It is impossible to "view"
// an existing password — the only supported operation is replacing it.
import { createServerFn } from "@tanstack/react-start";

export type ResetPasswordResult = { ok: true } | { ok: false; error: string };

type ResetPasswordInput = {
  accessToken: string;
  userId: string;
  password: string;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const setMemberPassword = createServerFn({ method: "POST" })
  .validator((input: unknown) => input as ResetPasswordInput)
  .handler(async ({ data }): Promise<ResetPasswordResult> => {
    try {
      const accessToken = String(data?.accessToken || "");
      const userId = String(data?.userId || "");
      const password = String(data?.password || "");

      if (!accessToken) return { ok: false, error: "Session expired. Please sign in again." };
      if (!UUID_RE.test(userId)) return { ok: false, error: "Invalid member account." };
      if (password.length < 8)
        return { ok: false, error: "Password must be at least 8 characters." };
      if (password.length > 72)
        return { ok: false, error: "Password must be at most 72 characters." };
      if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
        return { ok: false, error: "Password must contain at least one letter and one number." };
      }

      // Loaded dynamically so the service role key never enters the client bundle.
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // 1) Identify the caller from their own access token.
      const { data: caller, error: callerError } = await supabaseAdmin.auth.getUser(accessToken);
      if (callerError || !caller?.user) {
        return { ok: false, error: "Session expired. Please sign in again." };
      }

      // 2) Caller must be an active superadmin.
      const [{ data: callerRole }, { data: callerProfile }] = await Promise.all([
        supabaseAdmin.from("user_roles").select("role").eq("user_id", caller.user.id).maybeSingle(),
        supabaseAdmin.from("profiles").select("status").eq("user_id", caller.user.id).maybeSingle(),
      ]);
      if (callerRole?.role !== "superadmin" || callerProfile?.status !== "active") {
        return { ok: false, error: "Only an active superadmin can reset passwords." };
      }

      // 3) Never reset another superadmin's password from this screen.
      if (userId === caller.user.id) {
        return { ok: false, error: "Use your own account settings to change your password." };
      }
      const { data: targetRole } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();
      if (targetRole?.role === "superadmin") {
        return { ok: false, error: "Superadmin accounts cannot be reset from here." };
      }

      // 4) Replace the password through the Admin API.
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password,
      });
      if (updateError) {
        console.error("[reset-password] update failed:", updateError.message);
        return { ok: false, error: updateError.message };
      }

      return { ok: true };
    } catch (error) {
      console.error("[reset-password] unexpected error:", error);
      return { ok: false, error: "Unexpected server error. Please try again." };
    }
  });
