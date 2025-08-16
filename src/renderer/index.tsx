import * as React from "react";
import { createRoot } from "react-dom/client";
import { createMemoryRouter, RouterProvider } from "react-router";

import { routes } from "../routes.ts";
import "./index.css";

const root = document.querySelector("div#root")!;

const router = createMemoryRouter(routes);

createRoot(root).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
