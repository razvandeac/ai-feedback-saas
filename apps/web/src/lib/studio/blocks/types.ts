import { z } from "zod";

export const BaseBlock = z.object({
  id: z.string().uuid(),
  type: z.string(),
  version: z.number().int().min(1),
});

export const TextBlock = BaseBlock.extend({
  type: z.literal("text"),
  data: z.object({
    text: z.string(),
    align: z.enum(["left","center","right"]).default("left"),
  }),
});

export const ImageBlock = BaseBlock.extend({
  type: z.literal("image"),
  data: z.object({
    url: z.string().url(),
    alt: z.string().optional(),
    width: z.number().int().positive().optional(),
    height: z.number().int().positive().optional(),
  }),
});

export const ContainerBlock = BaseBlock.extend({
  type: z.literal("container"),
  data: z.object({
    direction: z.enum(["vertical","horizontal"]).default("vertical"),
    gap: z.number().int().min(0).max(64).default(8),
    children: z.array(BaseBlock).optional(), // validated after expand
  }),
});

export const BlockSchema = z.union([TextBlock, ImageBlock, ContainerBlock]);
export type Block = z.infer<typeof BlockSchema>;

// Migration-friendly schema that accepts unknown block types
export const BlockSchemaWithLegacy = z.union([
  TextBlock, 
  ImageBlock, 
  ContainerBlock,
  BaseBlock.extend({
    type: z.string(),
    data: z.any(),
  })
]);

export const BlocksArray = z.array(BlockSchemaWithLegacy);
export type Blocks = z.infer<typeof BlocksArray>;
export type BlockWithLegacy = z.infer<typeof BlockSchemaWithLegacy>;
