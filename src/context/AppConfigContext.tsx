"use client";

import { createContext, useContext } from "react";

type AppConfig = typeof import("@/lib/appConfig").default;

// デフォルト設定を定義（appConfig.ts の defaultConfig と同じ構造）
const defaultConfig = {
  site: {
    title: "Next.js Markdown ブログ",
    description: "Next.js で構築された Markdown ブログです。",
    base_url: "https://example.com",
    og_image: "og-image.jpg",
    locale: "ja_JP",
    author: "著者名",
    social: {
      x: "",
      github: "",
    },
    hp_url: "https://example.com",
  },
  archive: {
    posts_per_page: 7,
  },
} as AppConfig;

const AppConfigContext = createContext<AppConfig>(defaultConfig);

export function useAppConfig() {
  const context = useContext(AppConfigContext);
  return context || defaultConfig;
}

export default AppConfigContext;
