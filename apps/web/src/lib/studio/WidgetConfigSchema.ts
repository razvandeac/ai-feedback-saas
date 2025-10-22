import { z } from "zod";
import { ThemeSchema } from "./schema";
import { BlocksArray } from "./blocks/types";

export const WidgetConfigSchema = z.object({
  theme: ThemeSchema,
  blocks: BlocksArray,
});
export type WidgetConfig = z.infer<typeof WidgetConfigSchema>;
