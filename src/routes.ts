import { type RouteObject } from "react-router";

import BaseLayout from "@/layouts/BaseLayout.tsx";
import Home from "@/routes/index.tsx";
import About from "@/routes/about.tsx";
import { getSystemInfo } from "@/ipc/renderer.ts";

export const routes: RouteObject[] = [
  {
    Component: BaseLayout,
    children: [
      { index: true, Component: Home },
      { path: "/about", loader: async () => getSystemInfo(), Component: About },
    ],
  },
];
