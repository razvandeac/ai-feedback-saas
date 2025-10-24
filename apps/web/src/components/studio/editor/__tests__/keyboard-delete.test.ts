describe("size calc", () => {
  it("estimates config size", () => {
    const cfg = { theme: { variant: "light", primaryColor: "#000000", backgroundColor: "#ffffff", fontFamily: "Inter", borderRadius: 8 }, blocks: [] };
    const bytes = new Blob([JSON.stringify(cfg)]).size;
    expect(bytes).toBeGreaterThan(0);
  });
});
