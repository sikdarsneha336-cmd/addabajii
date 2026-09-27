import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase-auth-middleware";
import { createSupabaseClient } from "@/lib/supabase.server";

export const AUTHORITY_STATUSES = ["received", "under-review", "action-taken", "closed"] as const;
export type AuthorityStatus = (typeof AUTHORITY_STATUSES)[number];
const updateSchema = z.object({ reportId: z.string().uuid(), status: z.enum(AUTHORITY_STATUSES) });
const noteSchema = z.object({ reportId: z.string().uuid(), note: z.string().trim().min(1).max(1600) });
const updatesSchema = z.object({ reportId: z.string().uuid() });

export type ReportAnalysis = { mode?: string; status?: string; classification?: { label?: string; rationale?: string } | null; extraction?: { incident_type?: string; time_reference?: string; location_reference?: string; summary?: string } | null; duplicates?: { assessed?: boolean; possible_matches?: Array<{ report_id: string; reason: string }> } | null; priority?: { suggestion?: string; rationale?: string } | null; human_review_required?: boolean; disclaimer?: string; note?: string };
export type AuthorityReport = { id: string; category: string; incidentDate: string; locationMode: string; locationLabel: string | null; status: string; analysis: ReportAnalysis; description: string; supportingDetails: string | null; submittedAt: string; retentionUntil: string };
export type ReportUpdate = { id: string; kind: string; officerLabel: string; oldStatus: string | null; newStatus: string | null; note: string | null; createdAt: string };

function requireAuthority(roles: string[]) { if (!roles.some((role) => role === "authority" || role === "admin")) throw new Error("Forbidden"); }

export const listAuthorityReports = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }): Promise<AuthorityReport[]> => {
  requireAuthority(context.staff.roles);
  const { data, error } = await createSupabaseClient(context.staff.accessToken).from("reports").select("id,incident_category,incident_date,location_mode,location_label,status,ai_analysis,description,supporting_details,submitted_at,retention_until").gt("retention_until", new Date().toISOString()).order("submitted_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((report) => ({ id: report.id, category: report.incident_category, incidentDate: report.incident_date, locationMode: report.location_mode, locationLabel: report.location_label, status: report.status, analysis: report.ai_analysis as ReportAnalysis, description: report.description, supportingDetails: report.supporting_details, submittedAt: report.submitted_at, retentionUntil: report.retention_until }));
});

export const updateReportStatus = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => updateSchema.parse(input)).handler(async ({ data, context }) => {
  requireAuthority(context.staff.roles);
  const supabase = createSupabaseClient(context.staff.accessToken);
  const { data: previous, error: readError } = await supabase.from("reports").select("status").eq("id", data.reportId).gt("retention_until", new Date().toISOString()).maybeSingle();
  if (readError) throw new Error(readError.message);
  if (!previous) throw new Error("This report could not be updated. It may no longer be active.");
  if (previous.status === data.status) return { id: data.reportId, status: data.status };
  const { data: report, error } = await supabase.from("reports").update({ status: data.status }).eq("id", data.reportId).gt("retention_until", new Date().toISOString()).select("id,status").maybeSingle();
  if (error) throw new Error(error.message);
  if (!report) throw new Error("This report could not be updated. It may no longer be active.");
  const { error: updateError } = await supabase.from("report_updates").insert({ report_id: report.id, kind: "status_change", officer_user_id: context.staff.id, officer_label: context.staff.email, old_status: previous.status, new_status: data.status });
  if (updateError) throw new Error(updateError.message);
  return { id: report.id, status: report.status };
});

export const addReportNote = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => noteSchema.parse(input)).handler(async ({ data, context }) => {
  requireAuthority(context.staff.roles);
  const { error } = await createSupabaseClient(context.staff.accessToken).from("report_updates").insert({ report_id: data.reportId, kind: "note", officer_user_id: context.staff.id, officer_label: context.staff.email, note: data.note });
  if (error) throw new Error(error.message);
  return { ok: true };
});

export const getReportUpdates = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => updatesSchema.parse(input)).handler(async ({ data, context }): Promise<ReportUpdate[]> => {
  requireAuthority(context.staff.roles);
  const { data: updates, error } = await createSupabaseClient(context.staff.accessToken).from("report_updates").select("id,kind,officer_label,old_status,new_status,note,created_at").eq("report_id", data.reportId).order("created_at", { ascending: false }).limit(50);
  if (error) throw new Error(error.message);
  return (updates ?? []).map((item) => ({ id: item.id, kind: item.kind, officerLabel: item.officer_label, oldStatus: item.old_status, newStatus: item.new_status, note: item.note, createdAt: item.created_at }));
});
