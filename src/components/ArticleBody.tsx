// src/components/ArticleBody.tsx
import Link from "next/link";
import { CalendarPlus, ClockClockwise } from "@/components/Icons";
import SocialShareLinks from "@/components/SocialShareLinks";
import { formatJpDateFromDate } from "@/lib/format";

interface ArticleBodyProps {
  title: string;
  contentHtml: string;
  category?: string;
  publishDate?: Date;
  updateDate?: Date;
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

  return (
    <article className="prose dark:prose-invert max-w-full">
      <header className="mb-6 pb-4 border-b">
        <h1 className="text-4xl mb-2">{title || "Untitled Post"}</h1>
        {(publishDate || updateDate) && (
          <div className="text-sm text-muted-foreground flex items-center">
            {publishDate && (
              <span>
                <CalendarPlus className="inline-block w-5 h-5" />{" "}
                <span className="ml-1">{formatJpDateFromDate(publishDate)}</span>
              </span>
            )}
            {updateDate && (
              <span className="ml-4">
                <ClockClockwise className="inline-block w-5 h-5" />{" "}
                <span className="ml-1">{formatJpDateFromDate(updateDate)}</span>
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
