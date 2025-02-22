import { RouterProvider } from "@tanstack/react-router";
import { useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// App imports
import "@/globals.css";
import createRouter from "./router";
import { ThemeProvider } from "./context/ThemeContext";

const router = createRouter();

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
export default function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000 * 60,
            refetchOnWindowFocus: true,
          },
        },
      }),
  );
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} context={{ queryClient }} />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
