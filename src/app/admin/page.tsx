"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { CaretUpIcon, CaretDownIcon } from "@phosphor-icons/react";
import withAdminAuth from "@/components/withAdminAuth";
import { db } from "@/lib/firebase";
import {
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  OrderByDirection,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { PostWithId } from "@/types/post";
import { formatJpDateFromTimestamp } from "@/lib/format";
// Remove the import since we'll use API route

function sortPosts(
  postsToSort: PostWithId[],
  field: "publishDate" | "updateDate",
  direction: OrderByDirection
) {
  return [...postsToSort].sort((a, b) => {
    if (
      field === "publishDate" &&
      direction === "desc" &&
      a.isPublic !== b.isPublic
    ) {
      return a.isPublic ? 1 : -1; // Drafts first when sorting by publishDate desc
    }

    const aDate = a[field];
    const bDate = b[field];
    const aVal = aDate ? aDate.toMillis() : Number.POSITIVE_INFINITY;
    const bVal = bDate ? bDate.toMillis() : Number.POSITIVE_INFINITY;

    return direction === "asc" ? aVal - bVal : bVal - aVal;
  });
}

function AdminPage() {
  const [posts, setPosts] = useState<PostWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {}
  );
  const [sortField, setSortField] = useState<string>("publishDate");
  const [sortDirection, setSortDirection] = useState<OrderByDirection>("desc");
  const [itemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageDocCursors, setPageDocCursors] = useState<
    (QueryDocumentSnapshot | null)[]
  >([null]);
  const [queryLastDoc, setQueryLastDoc] =
    useState<QueryDocumentSnapshot | null>(null);
  const [isNextPageAvailable, setIsNextPageAvailable] = useState(true);

  // Simplified fetchPosts using only API route
  const fetchPosts = useCallback(
    async (fetchOptions: {
      sortField: string;
      sortDirection: OrderByDirection;
      pageAction: "first" | "next" | "prev";
      currentQueryLastDoc: QueryDocumentSnapshot | null;
      currentPage: number;
      currentPageDocCursors: (QueryDocumentSnapshot | null)[];
    }) => {
      const {
        sortField: currentSortField,
        sortDirection: currentSortDirection,
      } = fetchOptions;

      setLoading(true);
      setError(null);
      try {
        // Fetch posts from API route instead of direct Firestore access
        const response = await fetch("/api/admin/posts");
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        const fetchedPosts: PostWithId[] = await response.json();

        // Store original posts data for display
        const originalPosts = [...fetchedPosts];

        // Convert string dates back to Timestamp-like objects for sorting
        const postsWithTimestamps = fetchedPosts.map((post) => ({
          ...post,
          publishDate: post.publishDate
            ? {
                toMillis: () =>
                  new Date(post.publishDate as unknown as string).getTime(),
              }
            : null,
          updateDate: post.updateDate
            ? {
                toMillis: () =>
                  new Date(post.updateDate as unknown as string).getTime(),
              }
            : null,
        }));

        const sortedPosts = sortPosts(
          postsWithTimestamps as PostWithId[],
          currentSortField as "publishDate" | "updateDate",
          currentSortDirection
        );

        // For simplicity, we'll implement client-side pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedPosts = sortedPosts.slice(startIndex, endIndex);

        // Map back to original data for display while keeping sort order
        const displayPosts = paginatedPosts.map((sortedPost) => {
          const originalPost = originalPosts.find(
            (p) => p.id === sortedPost.id
          );
          return originalPost || sortedPost;
        });

        setPosts(displayPosts);
        setIsNextPageAvailable(endIndex < sortedPosts.length);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [itemsPerPage, currentPage]
  );

  useEffect(() => {
    // Reset pagination state before fetching on sort change
    setCurrentPage(1);
    setQueryLastDoc(null);
    setPageDocCursors([null]);
    fetchPosts({
      sortField: sortField,
      sortDirection: sortDirection,
      pageAction: "first",
      currentQueryLastDoc: null,
      currentPage: 1,
      currentPageDocCursors: [null],
    });
  }, [sortField, sortDirection, fetchPosts]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prevDirection) =>
        prevDirection === "asc" ? "desc" : "asc"
      );
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };
  const renderSortIcon = (field: string) => {
    if (sortField === field) {
      return sortDirection === "asc" ? (
        <CaretUpIcon className="inline ml-1 h-4 w-4" />
      ) : (
        <CaretDownIcon className="inline ml-1 h-4 w-4" />
      );
    }
    return null;
  };
  const handleTogglePublishState = async (
    postId: string,
    currentIsPublic: boolean
  ) => {
    setActionLoading((prev) => ({ ...prev, [postId]: true }));
    try {
      const postRef = doc(db, "posts", postId);

      // Data to update in Firestore
      const updateData: {
        isPublic: boolean;
        publishDate?: Timestamp | import("firebase/firestore").FieldValue;
      } = {
        // Using correct type for serverTimestamp flexibility
        isPublic: !currentIsPublic,
      };

      // If we are publishing the post (i.e., currentIsPublic is false, so !currentIsPublic is true)
      if (!currentIsPublic) {
        // Find the post in the local state to check its current publishDate
        const postToToggle = posts.find((p) => p.id === postId);
        // If the post is found and its publishDate is null (or undefined), set it
        // This assumes 'Post' interface has 'publishDate: Timestamp | null;'
        if (postToToggle && !postToToggle.publishDate) {
          updateData.publishDate = serverTimestamp();
        }
      }
      // No changes to updateDate in this operation

      await updateDoc(postRef, updateData);

      // Refetch the first page to reflect changes
      setCurrentPage(1);
      setQueryLastDoc(null);
      setPageDocCursors([null]);
      await fetchPosts({
        sortField: sortField,
        sortDirection: sortDirection,
        pageAction: "first",
        currentQueryLastDoc: null,
        currentPage: 1,
        currentPageDocCursors: [null],
      });
    } catch (err) {
      console.error("Error toggling publish state:", err);
      setError("Failed to update post status.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [postId]: false }));
    }
  };
  const handleDeletePost = async (postId: string) => {
    if (window.confirm("本当にこの投稿を削除しますか？")) {
      setActionLoading((prev) => ({ ...prev, [`delete-${postId}`]: true }));
      try {
        const postRef = doc(db, "posts", postId);
        await deleteDoc(postRef);
        // Refetch the first page to reflect changes
        setCurrentPage(1);
        setQueryLastDoc(null);
        setPageDocCursors([null]);
        await fetchPosts({
          sortField: sortField,
          sortDirection: sortDirection,
          pageAction: "first",
          currentQueryLastDoc: null,
          currentPage: 1,
          currentPageDocCursors: [null],
        });
      } catch (err) {
        console.error("Error deleting post:", err);
        setError("Failed to delete post."); // Provide user feedback
      } finally {
        setActionLoading((prev) => ({ ...prev, [`delete-${postId}`]: false }));
      }
    }
  };
  const handleNextPage = () => {
    if (isNextPageAvailable) {
      const nextPageToFetch = currentPage + 1;
      fetchPosts({
        sortField: sortField,
        sortDirection: sortDirection,
        pageAction: "next",
        currentQueryLastDoc: queryLastDoc, // Current last doc from state
        currentPage: nextPageToFetch, // The page number we are about to fetch
        currentPageDocCursors: pageDocCursors, // Current cursors state
      });
      setCurrentPage(nextPageToFetch); // Update current page optimistically or after fetch
    }
  };
  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevPageToFetch = currentPage - 1;
      // For 'prev', currentQueryLastDoc is the cursor for the document *before* the first document of `prevPageToFetch`.
      // This is pageDocCursors[prevPageToFetch - 1].
      // E.g., to get page 2 (prevPageToFetch = 2), we need to startAfter pageDocCursors[1-1] = pageDocCursors[0] (which is null for page 1).
      // To get page 1 (prevPageToFetch = 1), this implies pageDocCursors[-1] which is not right.
      // The logic inside fetchPosts for 'prev' uses `currentPageDocCursors[pageToFetch -1]`.
      // So, currentQueryLastDoc for options should be the cursor for the page *before* prevPageToFetch.
      const cursorForPrevPageStart = pageDocCursors[prevPageToFetch - 1];

      fetchPosts({
        sortField: sortField,
        sortDirection: sortDirection,
        pageAction: "prev",
        currentQueryLastDoc: cursorForPrevPageStart, // This is the key for 'prev'
        currentPage: prevPageToFetch, // The page number we are about to fetch
        currentPageDocCursors: pageDocCursors, // Current cursors state
      });
      setCurrentPage(prevPageToFetch); // Update current page optimistically or after fetch
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">管理ダッシュボード</h1>
      <div className="mb-6 flex space-x-4">
        <Link href="/admin/post" className="!text-foreground">
          <Button>新しい投稿</Button>
        </Link>
        <Link href="/admin/images" className="!text-foreground">
          <Button variant="outline">画像管理</Button>
        </Link>
        <Link
          href="/admin/users"
          className="!text-foreground"
        >
          <Button variant="outline">ユーザ管理</Button>
        </Link>
      </div>
      {loading && <p>投稿を読み込み中...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>記事タイトル</TableHead>
              <TableHead>カテゴリー</TableHead>
              <TableHead>公開状態</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted-foreground hover:text-background"
                onClick={() => handleSort("publishDate")}
              >
                投稿日時{renderSortIcon("publishDate")}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted-foreground hover:text-background"
                onClick={() => handleSort("updateDate")}
              >
                更新日時{renderSortIcon("updateDate")}
              </TableHead>
              <TableHead>ページを見る</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <Link
                    href={`/admin/post?id=${post.id}`}
                    className="hover:underline"
                  >
                    {post.title}
                  </Link>
                </TableCell>
                <TableCell>{post.category}</TableCell>
                <TableCell>{post.isPublic ? "公開中" : "下書き"}</TableCell>
                <TableCell>
                  {formatJpDateFromTimestamp(post.publishDate) || "---"}
                </TableCell>
                <TableCell>
                  {formatJpDateFromTimestamp(post.updateDate) || "---"}
                </TableCell>
                <TableCell>
                  {post.slug && post.isPublic ? (
                    <Link
                      href={`/posts/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        見る
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      見る
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleTogglePublishState(post.id, post.isPublic)
                    }
                    disabled={actionLoading[post.id]}
                  >
                    {actionLoading[post.id]
                      ? "処理中..."
                      : post.isPublic
                      ? "下書きに戻す"
                      : "公開する"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="ml-2"
                    onClick={() => handleDeletePost(post.id)}
                    disabled={actionLoading[`delete-${post.id}`]}
                  >
                    {actionLoading[`delete-${post.id}`] ? "削除中..." : "削除"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {posts.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  投稿が見つかりません。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
      {!loading && !error && posts.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <Button
            onClick={handlePrevPage}
            disabled={currentPage === 1 || loading}
          >
            前へ
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentPage}ページ目
          </span>
          <Button
            onClick={handleNextPage}
            disabled={!isNextPageAvailable || loading}
          >
            次へ
          </Button>
        </div>
      )}
    </div>
  );
}

export default withAdminAuth(AdminPage);
