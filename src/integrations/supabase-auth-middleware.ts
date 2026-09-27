import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createSupabaseClient } from "@/lib/supabase.server";

export type StaffContext = { id: string; email: string; roles: string[]; accessToken: string };

export const requireSupabaseAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const request = getRequest();
  const authorization = request?.headers.get("authorization") ?? "";
  const accessToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!accessToken) throw new Error("Unauthorized — sign in to the authority desk.");

  const supabase = createSupabaseClient(accessToken);
  const { data: userData, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !userData.user) throw new Error("Your session expired. Please sign in again.");
  const { data: staff, error: staffError } = await supabase.from("staff").select("user_id,email,roles").eq("user_id", userData.user.id).maybeSingle();
  if (staffError || !staff) throw new Error("This account is not authorized for the review desk.");

  const context: StaffContext = { id: staff.user_id, email: staff.email, roles: staff.roles, accessToken };
  return next({ context: { staff: context } });
});
