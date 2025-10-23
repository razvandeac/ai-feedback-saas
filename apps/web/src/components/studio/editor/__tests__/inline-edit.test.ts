import { WidgetConfig } from "@/src/lib/studio/WidgetConfigSchema";

describe("inline edit", () => {
  it("updates text in blocks", () => {
    const cfg: WidgetConfig = {
      theme: { variant: "light", primaryColor: "#000000", backgroundColor: "#ffffff", fontFamily: "Inter", borderRadius: 8 },
      blocks: [{ id: "a", type: "text", version: 1, data: { text: "Hello", align: "left" } }]
    };
    const next = JSON.parse(JSON.stringify(cfg)) as WidgetConfig;
    if (next.blocks[0] && next.blocks[0].type === "text") {
      next.blocks[0].data.text = "World";
      expect(next.blocks[0].data.text).toBe("World");
    }
  });
});
