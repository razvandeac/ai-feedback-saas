function arrayMove<T>(arr: T[], from: number, to: number) {
  const a = arr.slice();
  const [x] = a.splice(from, 1);
  a.splice(to, 0, x);
  return a;
}

describe("dnd reorder", () => {
  it("reorders", () => {
    const ids = ["a","b","c"];
    expect(arrayMove(ids, 0, 2)).toEqual(["b","c","a"]);
  });
});
