import { z } from "zod";

export const ThemeSchema = z.object({
  variant: z.enum(["light","dark"]).default("light"),
  primaryColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/).default("#000000"),
  backgroundColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/).default("#ffffff"),
  fontFamily: z.string().default("Inter"),
  borderRadius: z.number().int().min(0).max(32).default(8),
});
export type Theme = z.infer<typeof ThemeSchema>;
