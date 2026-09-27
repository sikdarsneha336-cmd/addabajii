import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth, type StaffContext } from "@/integrations/supabase-auth-middleware";
import { createSupabaseClient, getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase.server";

export type StaffMember = { userId: string; email: string; role: string; createdAt: string | null };
export type MyProfile = { userId: string; email: string | null; roles: string[] };

const signInSchema = z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1) });

export const signInLocal = createServerFn({ method: "POST" }).inputValidator((input: unknown) => signInSchema.parse(input)).handler(async ({ data }) => {
  const { data: result, error } = await createSupabaseClient().auth.signInWithPassword({ email: data.email, password: data.password });
  if (error || !result.session || !result.user) throw new Error("That email or password did not match an authorized account.");
  return { access_token: result.session.access_token, refresh_token: result.session.refresh_token, expires_at: result.session.expires_at ?? Math.floor(Date.now() / 1000) + result.session.expires_in };
});

export const getMyProfile = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }): Promise<MyProfile> => ({ userId: context.staff.id, email: context.staff.email, roles: context.staff.roles }));

const requireAdmin = (staff: StaffContext) => { if (!staff.roles.includes("admin")) throw new Error("Forbidden — administrator access required."); };

export const listStaff = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }): Promise<StaffMember[]> => {
  requireAdmin(context.staff);
  const { data, error } = await createSupabaseClient(context.staff.accessToken).from("staff").select("user_id,email,roles,created_at").order("email");
  if (error) throw new Error(error.message);
  return (data ?? []).flatMap((member) => member.roles.map((role: string) => ({ userId: member.user_id, email: member.email, role, createdAt: member.created_at })));
});

const inviteSchema = z.object({ email: z.string().trim().toLowerCase().email() });
export const createOfficer = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => inviteSchema.parse(input)).handler(async ({ data, context }) => {
  requireAdmin(context.staff);
  const { error } = await createSupabaseClient(context.staff.accessToken).from("staff_invites").upsert({ email: data.email, roles: ["authority"], created_by: context.staff.id }, { onConflict: "email" });
  if (error) throw new Error(error.message);
  return { email: data.email };
});

const removeOfficerSchema = z.object({ userId: z.string().uuid() });
export const removeOfficer = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => removeOfficerSchema.parse(input)).handler(async ({ data, context }) => {
  requireAdmin(context.staff);
  if (data.userId === context.staff.id) throw new Error("You cannot remove your own access while signed in.");
  const { error } = await createSupabaseClient(context.staff.accessToken).from("staff").delete().eq("user_id", data.userId);
  if (error) throw new Error(error.message);
  return { ok: true };
});

const passwordSchema = z.object({ password: z.string().min(12, "Use at least 12 characters for the new password.") });
export const changeOwnPassword = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => passwordSchema.parse(input)).handler(async ({ data, context }) => {
  const response = await fetch(`${getSupabaseUrl()}/auth/v1/user`, { method: "PUT", headers: { apikey: getSupabasePublishableKey(), Authorization: `Bearer ${context.staff.accessToken}`, "content-type": "application/json" }, body: JSON.stringify({ password: data.password }) });
  if (!response.ok) throw new Error("Password change failed. Please sign in again and retry.");
  return { ok: true };
});
