"use client";
import React from "react";
import { register } from "./registry";
import { TextBlock, ImageBlock, ContainerBlock, LegacyBlock } from "./types";

register({
  type: "text",
  schema: TextBlock,
  render: (b) => <p className={`text-${b.data.align}`}>{b.data.text}</p>,
});

register({
  type: "image",
  schema: ImageBlock,
  render: (b) => <img src={b.data.url} alt={b.data.alt ?? ""} width={b.data.width} height={b.data.height} />,
});

register({
  type: "container",
  schema: ContainerBlock,
  render: (b) => (
    <div className={b.data.direction === "horizontal" ? "flex gap-2" : "flex flex-col gap-2"}>
      {b.data.children?.map((child) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
        const def = child ? register as any : null; // placeholder to satisfy types
        return null; // actual nested rendering is handled in BlockRenderer
      })}
    </div>
  ),
});

register({
  type: "legacy",
  schema: LegacyBlock,
  render: () => <div className="opacity-60 italic">Legacy content</div>,
});
