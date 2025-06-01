// src/components/ArticleBody.tsx
"use client";

import Link from "next/link";
import { CalendarPlus, ClockClockwise } from "@/components/Icons";
import SocialShareLinks from "@/components/SocialShareLinks";

export default function ArticleBody({
  title,
  contentHtml,
  publishDate,
  updateDate,
  category,
  showShareLinks = true,
}: {
  title: string;
  contentHtml: string;
  publishDate?: string;
  updateDate?: string;
  category?: string;
  showShareLinks?: boolean;
}) {
  return (
    <article className="prose dark:prose-invert max-w-full">
      <header className="mb-6 pb-4 border-b">
        <h1 className="text-4xl mb-2">{title || "Untitled Post"}</h1>
        {(publishDate || updateDate) && (
          <div className="text-sm text-muted-foreground flex items-center">
            {publishDate && (
              <span>
                <CalendarPlus className="inline-block w-5 h-5" />{" "}
                <span className="ml-1">{publishDate}</span>
              </span>
            )}
            {updateDate && (
              <span className="ml-4">
                <ClockClockwise className="inline-block w-5 h-5" />{" "}
                <span className="ml-1">{updateDate}</span>
              </span>
            )}
          </div>
        )}
        {category && (
          <div className="text-sm text-muted-foreground">
            <span>
              カテゴリー：
              <Link
                href={`/categories/${encodeURIComponent(
                  category.toLowerCase()
                )}`}
                className="!text-muted-foreground"
              >
                <span className="font-bold">{category}</span>
              </Link>
            </span>
          </div>
        )}
      </header>
      <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
      {showShareLinks && (
        <footer className="mt-12 pt-4 border-t text-sm">
          <p className="text-muted-foreground">この記事を共有する:</p>
          <SocialShareLinks title={title} />
        </footer>
      )}
    </article>
  );
}
