"use client";

import { ReactNode } from "react";
import AppConfigContext from "@/context/AppConfigContext";

type Props = {
  children: ReactNode;
  config: typeof import("@/lib/appConfig").default;
};

export default function AppConfigProvider({ children, config }: Props) {
  return (
    <AppConfigContext.Provider value={config}>
      {children}
    </AppConfigContext.Provider>
  );
}