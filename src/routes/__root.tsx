import * as React from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { useThemeContext } from "../context/ThemeContext";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { theme } = useThemeContext();
  return (
    <React.Fragment>
      <main className="relative mx-auto w-11/12 sm:w-10/12 md:w-8/12 lg:w-7/12 xl:w-6/12 2xl:w-5/12">
        <Outlet />
      </main>
      <Toaster richColors theme={theme} toastOptions={{}} />
    </React.Fragment>
  );
}
