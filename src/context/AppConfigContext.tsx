"use client";

import { createContext, useContext } from "react";

type AppConfig = typeof import("@/lib/appConfig").default;

const AppConfigContext = createContext<AppConfig | null>(null);

export function useAppConfig() {
  const context = useContext(AppConfigContext);
  if (!context) throw new Error("AppConfigContext not provided");
  return context;
}

export default AppConfigContext;