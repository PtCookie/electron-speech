import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { SystemInfo } from "@/components/SystemInfo.tsx";

describe("SystemInfo", () => {
  test("renders platform and architecture correctly", () => {
    render(<SystemInfo platform="linux" arch="x64" />);

    expect(screen.getByText("linux")).toBeInTheDocument();
    expect(screen.getByText("x64")).toBeInTheDocument();
  });

  test("handles empty props gracefully", () => {
    render(<SystemInfo platform="" arch="" />);

    expect(screen.queryByText("linux")).not.toBeInTheDocument();
    expect(screen.queryByText("x64")).not.toBeInTheDocument();
  });
});
