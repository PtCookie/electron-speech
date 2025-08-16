import * as React from "react";
import { Link, Outlet } from "react-router";

import { buttonVariants } from "@/components/ui/button.tsx";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu.tsx";

export default function BaseLayout() {
  return (
    <div className="m-auto max-w-2xl p-8">
      <div className="flex gap-4">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link className={buttonVariants({ variant: "link" })} to="/">
                Home
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link className={buttonVariants({ variant: "link" })} to="/about">
                About
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link className={buttonVariants({ variant: "link" })} to="/synthesizer">
                Synthesizer
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <hr className="my-2" />
      <Outlet />
    </div>
  );
}
