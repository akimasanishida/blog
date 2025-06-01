"use client";
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { CaretUpIcon, CaretDownIcon } from '@phosphor-icons/react';
import withAdminAuth from '@/components/withAdminAuth';
import { db } from '@/lib/firebase';
import { 
  collection, query, orderBy, getDocs, Timestamp, doc, updateDoc, deleteDoc, serverTimestamp, 
  OrderByDirection, limit, startAfter, QueryDocumentSnapshot
} from 'firebase/firestore';
import { PostWithId } from '@/types/post';
import { formatJpDateFromTimestamp } from '@/lib/format';
import { getAllPostsForAdmin } from '@/lib/firebase';


// const formatDate = (timestamp: Timestamp | undefined | null): string => {
//   if (timestamp === undefined || timestamp === null) return '---';
//   return timestamp.toDate().toLocaleDateString('ja-JP', {
//     year: 'numeric',
//     month: '2-digit',
//     day: '2-digit',
//   });
// };

function AdminPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<PostWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [sortField, setSortField] = useState<string>("publishDate");
  const [sortDirection, setSortDirection] = useState<OrderByDirection>("desc");
  const [itemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageDocCursors, setPageDocCursors] = useState<(QueryDocumentSnapshot | null)[]>([null]);
  const [queryLastDoc, setQueryLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [isNextPageAvailable, setIsNextPageAvailable] = useState(true);

  // Refactored fetchPosts
  const fetchPosts = useCallback(async (
    fetchOptions: {
      sortField: string;
      sortDirection: OrderByDirection;
      pageAction: "first" | "next" | "prev";
      currentQueryLastDoc: QueryDocumentSnapshot | null;
      currentPage: number; // Current page number *being fetched*
      currentPageDocCursors: (QueryDocumentSnapshot | null)[]; // Cursors array *at the time of call*
    }
  ) => {
    const { 
      sortField: currentSortField, 
      sortDirection: currentSortDirection, 
      pageAction,
      currentQueryLastDoc, // Use this instead of state queryLastDoc directly for 'next'
      currentPage: pageToFetch,    // Use this instead of state currentPage directly for 'prev' logic
      currentPageDocCursors      // Use this for 'prev' logic
    } = fetchOptions;

    setLoading(true);
    setError(null);
    try {
      const postsCollectionRef = collection(db, "posts");
      let baseQuery;

      if (currentSortField === "publishDate" && currentSortDirection === "desc") {
        // Sort by isPublic (false then true), then by publishDate descending.
        // This brings unpublished (isPublic: false) posts to the top when sorting by publishDate desc.
        baseQuery = query(postsCollectionRef, orderBy("isPublic", "asc"), orderBy(currentSortField, currentSortDirection));
      } else {
        // Standard sorting for all other cases
        baseQuery = query(postsCollectionRef, orderBy(currentSortField, currentSortDirection));
      }

      let q; // Query variable to be used for pagination

      if (pageAction === "first") {
        // setCurrentPage(1) and setPageDocCursors([null]) are handled by the caller (main useEffect)
        q = query(baseQuery, limit(itemsPerPage));
      } else if (pageAction === "next" && currentQueryLastDoc) {
        q = query(baseQuery, startAfter(currentQueryLastDoc), limit(itemsPerPage));
      } else if (pageAction === "prev" && pageToFetch > 0) { // pageToFetch is 1-indexed
        const prevPageCursorTarget = currentPageDocCursors[pageToFetch - 1]; // Cursor for the page *before* the one we want to fetch
        if (prevPageCursorTarget) { // if pageToFetch is 1, prevPageCursorTarget is pageDocCursors[0] which is null
          q = query(baseQuery, startAfter(prevPageCursorTarget), limit(itemsPerPage));
        } else { // Fetching the actual first page (pageToFetch = 1)
          q = query(baseQuery, limit(itemsPerPage));
        }
      } else { // Fallback or unexpected pageAction
        console.warn("fetchPosts called with invalid pageAction or parameters, fetching first page.", fetchOptions);
        q = query(baseQuery, limit(itemsPerPage));
      }

      const querySnapshot = await getDocs(q);
      const fetchedPosts: PostWithId[] = await getAllPostsForAdmin();
      setPosts(fetchedPosts);
      const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
      setQueryLastDoc(newLastDoc);

      if (pageAction === "first") {
        setPageDocCursors(newLastDoc ? [null, newLastDoc] : [null]);
      } else if (pageAction === "next" && newLastDoc) {
        // pageToFetch is the page number that was just fetched (e.g., if currentPage was 1, pageToFetch is 2)
        // We need to store the cursor for this newly fetched page (pageToFetch)
        // The cursor newLastDoc is the last document of pageToFetch.
        // pageDocCursors should be 0-indexed for page numbers, so pageDocCursors[0] is for page 1 (null), pageDocCursors[1] is last doc of page 1.
        // So, for page `p`, its last doc is at `pageDocCursors[p]`.
        setPageDocCursors(prev => {
            const newCursors = [...prev];
            if (pageToFetch < newCursors.length) {
                newCursors[pageToFetch] = newLastDoc;
            } else { // pageToFetch is beyond current known cursors
                // Fill any gaps if necessary, though ideally this shouldn't happen with linear next
                while(newCursors.length < pageToFetch) {
                    newCursors.push(null); // Should ideally not happen
                }
                newCursors.push(newLastDoc);
            }
            return newCursors;
        });
      }
      // For 'prev', pageDocCursors should already be populated for the target page.
      // We don't typically update pageDocCursors when navigating 'prev', as we are navigating to already known cursor states.

      // Check if a next page is available from the current (pageToFetch)
      if (newLastDoc && querySnapshot.docs.length === itemsPerPage) {
        const nextCheckQuery = query(baseQuery, startAfter(newLastDoc), limit(1));
        const nextCheckSnapshot = await getDocs(nextCheckQuery);
        setIsNextPageAvailable(!nextCheckSnapshot.empty);
      } else {
        setIsNextPageAvailable(false);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage, setPosts, setLoading, setError, setQueryLastDoc, setCurrentPage, setPageDocCursors, setIsNextPageAvailable]);

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
      currentPageDocCursors: [null]
    });
  }, [sortField, sortDirection, fetchPosts]);

  const handleNewPost = () => {
    router.push('/admin/post');
  };
  const handleImageManagement = () => {
    router.push('/admin/images');
  };
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prevDirection => prevDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };
  const renderSortIcon = (field: string) => {
    if (sortField === field) {
      return sortDirection === "asc" ? <CaretUpIcon className="inline ml-1 h-4 w-4" /> : <CaretDownIcon className="inline ml-1 h-4 w-4" />;
    }
    return null;
  };
  const handleTogglePublishState = async (postId: string, currentIsPublic: boolean) => {
    setActionLoading(prev => ({ ...prev, [postId]: true }));
    try {
      const postRef = doc(db, "posts", postId);

      // Data to update in Firestore
      const updateData: { isPublic: boolean; publishDate?: Timestamp | import("firebase/firestore").FieldValue } = { // Using correct type for serverTimestamp flexibility
        isPublic: !currentIsPublic,
      };

      // If we are publishing the post (i.e., currentIsPublic is false, so !currentIsPublic is true)
      if (!currentIsPublic) {
        // Find the post in the local state to check its current publishDate
        const postToToggle = posts.find(p => p.id === postId);
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
        currentPageDocCursors: [null]
      });
    } catch (err) {
      console.error("Error toggling publish state:", err);
      setError("Failed to update post status.");
    } finally {
      setActionLoading(prev => ({ ...prev, [postId]: false }));
    }
  };
  const handleDeletePost = async (postId: string) => {
    if (window.confirm("本当にこの投稿を削除しますか？")) {
      setActionLoading(prev => ({ ...prev, [`delete-${postId}`]: true }));
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
          currentPageDocCursors: [null]
        });
      } catch (err) {
        console.error("Error deleting post:", err);
        setError("Failed to delete post."); // Provide user feedback
      } finally {
        setActionLoading(prev => ({ ...prev, [`delete-${postId}`]: false }));
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
        currentPage: nextPageToFetch,      // The page number we are about to fetch
        currentPageDocCursors: pageDocCursors // Current cursors state
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
        currentPage: prevPageToFetch,                // The page number we are about to fetch
        currentPageDocCursors: pageDocCursors     // Current cursors state
      });
      setCurrentPage(prevPageToFetch); // Update current page optimistically or after fetch
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">管理ダッシュボード</h1>
      <div className="mb-6 flex space-x-4">
        <Button onClick={handleNewPost}>新しい投稿</Button>
        <Button variant="outline" onClick={handleImageManagement}>画像管理</Button>
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
              <TableHead className="cursor-pointer hover:bg-muted-foreground hover:text-background" onClick={() => handleSort("publishDate")}>投稿日時{renderSortIcon("publishDate")}</TableHead>
              <TableHead className="cursor-pointer hover:bg-muted-foreground hover:text-background" onClick={() => handleSort("updateDate")}>更新日時{renderSortIcon("updateDate")}</TableHead>
              <TableHead>ページを見る</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <Link href={`/admin/post?id=${post.id}`} className="hover:underline">{post.title}</Link>
                </TableCell>
                <TableCell>{post.category}</TableCell>
                <TableCell>{post.isPublic ? "公開中" : "下書き"}</TableCell>
                <TableCell>{formatJpDateFromTimestamp(post.publishDate) || "---"}</TableCell>
                <TableCell>{formatJpDateFromTimestamp(post.updateDate) || "---"}</TableCell>
                <TableCell>
                  {post.slug && post.isPublic ? (
                    <Link href={`/posts/${post.slug}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">見る</Button>
                    </Link>
                  ) : (
                    <Button variant="outline" size="sm" disabled>見る</Button>
                  )}
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleTogglePublishState(post.id, post.isPublic)}
                    disabled={actionLoading[post.id]}
                  >
                    {actionLoading[post.id] ? '処理中...' : (post.isPublic ? "下書きに戻す" : "公開する")}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="ml-2"
                    onClick={() => handleDeletePost(post.id)}
                    disabled={actionLoading[`delete-${post.id}`]}
                  >
                    {actionLoading[`delete-${post.id}`] ? '削除中...' : '削除'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {posts.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">投稿が見つかりません。</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
      {!loading && !error && posts.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <Button onClick={handlePrevPage} disabled={currentPage === 1 || loading}>前へ</Button>
          <span className="text-sm text-muted-foreground">{currentPage}ページ目</span>
          <Button onClick={handleNextPage} disabled={!isNextPageAvailable || loading}>次へ</Button>
        </div>
      )}
    </div>
  );
}

export default withAdminAuth(AdminPage);
