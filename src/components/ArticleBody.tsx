// src/components/ArticleBody.tsx
import Link from "next/link";
import { CalendarPlus, ClockClockwise } from "@/components/Icons";
import { formatJpDate } from "@/lib/format";
import SocialShareLinks from "@/components/SocialShareLinks";

interface ArticleBodyProps {
  title: string;
  contentHtml: string;
  category?: string;
  publishDate?: string | Date;
  updateDate?: string | Date;
  showCategoryLink?: boolean; // true: category名をリンクにする
  showShareLinks?: boolean;   // true: フッターにシェアリンクを表示
}

export default function ArticleBody({
  title,
  contentHtml,
  category,
  publishDate,
  updateDate,
  showCategoryLink = false,
  showShareLinks = false,
}: ArticleBodyProps) {
  let publishDateStr = "";
  if (publishDate) {
    if (publishDate instanceof Date) {
      publishDateStr = formatJpDate(publishDate.toISOString());
    } else {
      const d = new Date(publishDate);
      publishDateStr = isNaN(d.getTime()) ? String(publishDate) : formatJpDate(d.toISOString());
    }
  }
  let updateDateStr = "";
  if (updateDate) {
    if (updateDate instanceof Date) {
      updateDateStr = formatJpDate(updateDate.toISOString());
    } else {
      const d = new Date(updateDate);
      updateDateStr = isNaN(d.getTime()) ? String(updateDate) : formatJpDate(d.toISOString());
    }
  }

  return (
    <article className="prose dark:prose-invert max-w-full">
      <header className="mb-6 pb-4 border-b">
        <h1 className="text-4xl mb-2">{title || "Untitled Post"}</h1>
        {(publishDateStr || updateDateStr) && (
          <div className="text-sm text-muted-foreground flex items-center">
            {publishDateStr && (
              <span>
                <CalendarPlus className="inline-block w-5 h-5" />{" "}
                <span className="ml-1">{publishDateStr}</span>
              </span>
            )}
            {updateDateStr && (
              <span className="ml-4">
                <ClockClockwise className="inline-block w-5 h-5" />{" "}
                <span className="ml-1">{updateDateStr}</span>
              </span>
            )}
          </div>
        )}
        {category && (
          <div className="text-sm text-muted-foreground">
            <span>
              カテゴリー：
              {showCategoryLink ? (
                <Link
                  href={`/categories/${encodeURIComponent(
                    category.toLowerCase()
                  )}`}
                  className="!text-muted-foreground"
                >
                  <span className="font-bold">{category}</span>
                </Link>
              ) : (
                <span className="font-bold">{category}</span>
              )}
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
