import * as React from "react";

type Props = {
  platform: string;
  arch: string;
};

export function SystemInfo({ platform, arch }: Props) {
  return (
    <ul className="list-disc p-6">
      <li>{platform}</li>
      <li>{arch}</li>
    </ul>
  );
}
