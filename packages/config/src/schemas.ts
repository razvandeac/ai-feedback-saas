import { z } from "zod";

export const FeedbackIngestSchema = z.object({
  project_id: z.string().uuid("project_id must be a UUID"),
  text: z.string().min(1, "text is required").max(10_000, "text too long"),
  metadata: z.record(z.unknown()).default({})
});

export type FeedbackIngest = z.infer<typeof FeedbackIngestSchema>;
