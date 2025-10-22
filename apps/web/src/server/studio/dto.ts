import { z } from "zod";
import { WidgetConfigSchema } from "@/src/lib/studio/WidgetConfigSchema";

export const WidgetUpdateDTO = z.object({
  orgId: z.string().uuid(),
  name: z.string().min(1),
  widget_config: WidgetConfigSchema,
});
export type WidgetUpdateDTO = z.infer<typeof WidgetUpdateDTO>;
