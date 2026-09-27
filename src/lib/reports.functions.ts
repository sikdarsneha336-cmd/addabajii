import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createSupabaseClient, hashSecret } from "@/lib/supabase.server";

const locationSchema = z.object({ mode: z.enum(["gps", "approximate", "manual"]), label: z.string().trim().max(160).nullable(), latitude: z.number().min(-90).max(90).nullable(), longitude: z.number().min(-180).max(180).nullable() });
const reportSchema = z.object({ category: z.enum(["violence", "harassment", "theft", "safety-hazard", "suspicious-activity", "other"]), incidentDate: z.string().trim().min(1).max(80), location: locationSchema, description: z.string().trim().min(20).max(4000), supportingDetails: z.string().trim().max(1600).nullable() });
const accessCodeSchema = z.object({ code: z.string().trim().regex(/^[A-Z0-9-]{8,32}$/) });
const categoryLabels: Record<z.infer<typeof reportSchema>["category"], string> = { violence: "Violence or threat", harassment: "Harassment or intimidation", theft: "Theft or property loss", "safety-hazard": "Public safety hazard", "suspicious-activity": "Suspicious activity", other: "Other unsafe situation" };
type SimulatedAnalysis = { mode: string; status: string; classification: { label: string; rationale: string }; extraction: { incident_type: string; summary: string; time_reference: string }; duplicates: { assessed: boolean; possible_matches: { report_id: string; reason: string }[] }; priority: { suggestion: string; rationale: string }; human_review_required: boolean; disclaimer: string };
type RetrievedReport = { id: string; category: string; incidentDate: string; locationMode: string; locationLabel: string | null; status: string; analysis: SimulatedAnalysis; submittedAt: string; retentionUntil: string };

function createRetrievalCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const values = crypto.getRandomValues(new Uint32Array(12));
  const raw = Array.from(values, (value) => alphabet[value % alphabet.length]).join("");
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8)}`;
}

function simulatedAnalysis(category: keyof typeof categoryLabels): SimulatedAnalysis {
  const label = categoryLabels[category];
  return { mode: "simulated", status: "ready", classification: { label, rationale: "Copied from the selected report category; no AI model was called." }, extraction: { incident_type: label, summary: "No automatic summary was generated.", time_reference: "See submitted date." }, duplicates: { assessed: false, possible_matches: [] }, priority: { suggestion: ["violence", "safety-hazard"].includes(category) ? "Review promptly" : "Standard review", rationale: "Simple category-based placeholder only." }, human_review_required: true, disclaimer: "These are simulated placeholders. They are not AI findings and must not guide real-world decisions." };
}

export const submitAnonymousReport = createServerFn({ method: "POST" }).inputValidator((input: unknown) => reportSchema.parse(input)).handler(async ({ data }) => {
  const retrievalCode = createRetrievalCode();
  const submittedAt = new Date();
  const retentionUntil = new Date(submittedAt.getTime() + 90 * 24 * 60 * 60 * 1000);
  const id = crypto.randomUUID();
  const analysis = simulatedAnalysis(data.category);
  const retrievalCodeHash = await hashSecret(retrievalCode);
  const { error } = await createSupabaseClient().from("reports").insert({ id, incident_category: data.category, incident_date: data.incidentDate, location_mode: data.location.mode, location_label: data.location.label, latitude: data.location.latitude, longitude: data.location.longitude, description: data.description, supporting_details: data.supportingDetails, retrieval_code_hash: retrievalCodeHash, retrieval_code_hint: `${retrievalCode.slice(0, 4)}••••••••`, status: "received", ai_analysis: analysis, submitted_at: submittedAt.toISOString(), retention_until: retentionUntil.toISOString() });
  if (error) throw new Error(`The report could not be saved to Supabase: ${error.message}`);
  return { reportId: id, retrievalCode, submittedAt: submittedAt.toISOString(), retentionUntil: retentionUntil.toISOString(), analysis };
});

export const retrieveAnonymousReport = createServerFn({ method: "POST" }).inputValidator((input: unknown) => accessCodeSchema.parse(input)).handler(async ({ data }) => {
  const retrievalCodeHash = await hashSecret(data.code.toUpperCase());
  const { data: report, error } = await createSupabaseClient().rpc("retrieve_anonymous_report", { p_retrieval_code_hash: retrievalCodeHash });
  if (error) throw new Error(`Report lookup failed: ${error.message}`);
  if (!report) return { found: false as const };
  return { found: true as const, report: report as RetrievedReport };
});
