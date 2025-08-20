// appConfig に未定義のプロパティがある場合のデフォルト値を設定
const appConfig = {
    site: {
        title: process.env.NEXT_PUBLIC_SITE_TITLE || "Next.js Markdown ブログ",
        description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "Next.js で構築された Markdown ブログです。",
        base_url: process.env.NEXT_PUBLIC_SITE_URL || "https://example.com",
        og_image: process.env.NEXT_PUBLIC_SITE_OG_IMAGE || "og-image.jpg",
        locale: process.env.NEXT_PUBLIC_SITE_LOCALE || "ja_JP",
        author: process.env.NEXT_PUBLIC_SITE_AUTHOR || "著者名",
        social: {
            x: process.env.NEXT_PUBLIC_SITE_SOCIAL_X || "",
            github: process.env.NEXT_PUBLIC_SITE_SOCIAL_GITHUB || "",
        },
        hp_url: process.env.NEXT_PUBLIC_SITE_HP_URL || "https://example.com",  // ホームページURL
    },
    archive: {
        posts_per_page: parseInt(process.env.NEXT_PUBLIC_ARCHIVE_POSTS_PER_PAGE || "7", 10),
    },
};

export default appConfig;
