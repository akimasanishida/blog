import fs from "fs";
import path from "path";
import toml from "toml";
import deepmerge from "deepmerge";

const configPath = path.join(process.cwd(), "config.toml");
const configText = fs.readFileSync(configPath, "utf-8");
const appConfigInput = toml.parse(configText);

// appConfig に未定義のプロパティがある場合のデフォルト値を設定
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
        hp_url: "https://example.com",  // ホームページURL
    },
    archive: {
        posts_per_page: 7,
    },
};

const appConfig = deepmerge(defaultConfig, appConfigInput);

export default appConfig;
