import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import { AppRouter } from "./router";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <ModalsProvider>
          <Notifications position="top-right" autoClose={3000} />
          <AppRouter />
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  </StrictMode>,
);
