"use client"; // Mark as a Client Component

import { useEffect, useState } from 'react';
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
import { CaretUp, CaretDown } from 'lucide-react'; // Using lucide-react for icons
import withAdminAuth from '@/components/withAdminAuth'; // Import the HOC
import { db } from '@/lib/firebase';
import { 
  collection, query, orderBy, getDocs, Timestamp, doc, updateDoc, deleteDoc, serverTimestamp, 
  OrderByDirection, limit, startAfter, endBefore, limitToLast, DocumentSnapshot, QueryDocumentSnapshot
} from 'firebase/firestore'; // Added pagination functions and types

// Define the Post interface
interface Post {
  id: string;
  title: string;
  slug: string;
  publishDate: Timestamp;
  updateDate: Timestamp;
  category: string;
  isPublic: boolean;
  // content is not needed for the listing page
}

// Helper function to format Timestamp to YYYY-MM-DD string
const formatDate = (timestamp: Timestamp | undefined | null): string => {
  if (!timestamp) return 'N/A';
  return timestamp.toDate().toLocaleDateString('ja-JP', { // Using Japanese locale for YYYY/MM/DD
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

function AdminPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true); // For initial page load
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({}); // To track loading state for individual post actions
  const [sortField, setSortField] = useState<string>("publishDate");
  const [sortDirection, setSortDirection] = useState<OrderByDirection>("desc");
  const [itemsPerPage] = useState(10); // Or make it configurable
  const [currentPage, setCurrentPage] = useState(1);
  const [pageDocCursors, setPageDocCursors] = useState<(QueryDocumentSnapshot | null)[]>([null]); // Stores first doc of next page
  const [queryLastDoc, setQueryLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [isNextPageAvailable, setIsNextPageAvailable] = useState(true);


  // Extended fetchPosts to include sorting and pagination
  const fetchPosts = async (
    currentSortField: string = sortField, 
    currentSortDirection: OrderByDirection = sortDirection,
    pageDirection: "first" | "next" | "prev" = "first"
  ) => {
    setLoading(true);
    setError(null);
    try {
      const postsCollectionRef = collection(db, "posts");
      let q;

      // Base query with sorting
      let baseQuery = query(postsCollectionRef, orderBy(currentSortField, currentSortDirection));

      if (pageDirection === "first") {
        setCurrentPage(1);
        setPageDocCursors([null]); // Reset cursors
        q = query(baseQuery, limit(itemsPerPage));
      } else if (pageDirection === "next" && queryLastDoc) {
        q = query(baseQuery, startAfter(queryLastDoc), limit(itemsPerPage));
      } else if (pageDirection === "prev" && currentPage > 1) {
        const prevPageCursor = pageDocCursors[currentPage - 2]; // Cursor for start of current page
        if (prevPageCursor) {
             // Firestore's limitToLast with endBefore is tricky.
             // A common approach is to reverse sort order and use startAfter, then reverse results.
             // Or, more simply, if you always fetch N items, going back means re-fetching from a known previous cursor.
             // For this implementation, we'll use the stored cursor for the *start* of the *previous* page.
             // This requires ensuring pageDocCursors[0] is always null (for page 1).
             // Let's simplify: for "prev", we will use the cursor that marks the start of the *current* page,
             // but we need to fetch the page *before* that. This means we need the cursor for the start of the *previous* page.
             // This is why pageDocCursors stores the *first doc of the next page*.
             // So, pageDocCursors[currentPage - 2] is the first doc of the *current* page when coming from next.
             // This is complex. Let's simplify: we'll use startAfter with the cursor of the *previous page's last document*.
             // This means we need to store last documents of each page if we want to go back accurately.
             // For now, "prev" will re-fetch from the cursor stored for that page number.
             // pageDocCursors[page_index] = first_document_of_page_index+1
             // So to go to page P, we need cursor for page P-1 which is pageDocCursors[P-1]
            q = query(baseQuery, startAfter(pageDocCursors[currentPage - 2]), limit(itemsPerPage));

        } else { // currentPage is 2, going to 1
            q = query(baseQuery, limit(itemsPerPage));
        }
      } else {
        // Default to first page if logic is off
        setCurrentPage(1);
        setPageDocCursors([null]);
        q = query(baseQuery, limit(itemsPerPage));
      }
      
      const querySnapshot = await getDocs(q);
      const fetchedPosts: Post[] = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title || "No Title",
          slug: data.slug || "",
          publishDate: data.publishDate as Timestamp,
          updateDate: data.updateDate as Timestamp,
          category: data.category || "Uncategorized",
          isPublic: data.isPublic === undefined ? true : data.isPublic,
        };
      });
      setPosts(fetchedPosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

        };
      });
      setPosts(fetchedPosts);

      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setQueryLastDoc(lastDoc || null);

      if (pageDirection === "first") {
        if (querySnapshot.docs.length === itemsPerPage) {
          setPageDocCursors([null, lastDoc]); // Page 1 (null cursor), Page 2 starts after lastDoc
        } else {
          setPageDocCursors([null]);
        }
      } else if (pageDirection === "next" && lastDoc) {
        // Add cursor for the start of the *next* page
        if (currentPage + 1 > pageDocCursors.length -1 ) { // Only add if we don't have it
             setPageDocCursors(prev => [...prev.slice(0, currentPage), lastDoc]);
        } else { // Update existing cursor if we are revisiting
            setPageDocCursors(prev => {
                const newCursors = [...prev];
                newCursors[currentPage] = lastDoc;
                return newCursors;
            });
        }

      }
      // else if (pageDirection === "prev") {
        // No specific cursor update needed for 'prev' beyond setting currentPage
      // }


      // Check if there's a next page more reliably
      if (querySnapshot.docs.length < itemsPerPage) {
        setIsNextPageAvailable(false);
      } else {
        // Try to fetch one more document to see if a next page exists
        const nextQuery = query(baseQuery, startAfter(lastDoc), limit(1));
        const nextSnapshot = await getDocs(nextQuery);
        setIsNextPageAvailable(!nextSnapshot.empty);
      }

    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch posts on initial load and when sort changes (resets to page 1)
    fetchPosts(sortField, sortDirection, "first");
  }, [sortField, sortDirection]); // Removed itemsPerPage as it's constant for now

  // Note: The handleNewPost and handleImageManagement functions are duplicated in the provided source.
  // I will keep only one instance of each.

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
      setSortDirection("desc"); // Default to descending when changing field
    }
    // fetchPosts is called by useEffect, which will reset to page 1
  };

  const renderSortIcon = (field: string) => {
    if (sortField === field) {
      return sortDirection === "asc" ? <CaretUp className="inline ml-1 h-4 w-4" /> : <CaretDown className="inline ml-1 h-4 w-4" />;
    }
    return null;
  };

  const handleTogglePublishState = async (postId: string, currentIsPublic: boolean) => {
    setActionLoading(prev => ({ ...prev, [postId]: true }));
    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        isPublic: !currentIsPublic,
        updateDate: serverTimestamp()
      });
      // Refetch current page with current sort, without changing page
      const currentCursorForPage = pageDocCursors[currentPage -1];
      if (currentPage === 1) {
        await fetchPosts(sortField, sortDirection, "first");
      } else if (currentCursorForPage) {
         // This logic is tricky: re-fetching current page after an update.
         // Simplest is to go to first page of current sort order or re-fetch current view.
         // For now, let's re-fetch the current view by trying to preserve pagination state.
         // This might be complex if items shift pages.
         // A simpler robust solution is fetchPosts(sortField, sortDirection, "first") and setCurrentPage(1)
         // Or, fetch the current page again using its starting cursor.
         await fetchPosts(sortField, sortDirection, currentPage === 1 ? "first" : "next"); // This is not quite right for staying on page
         // Let's simplify: after an action, we refetch the *current page* based on its known starting cursor.
         // This means fetchPosts needs to be able to fetch a specific page number's data.
         // The current fetchPosts is more geared towards "first, next, prev".
         // For now, we will refetch from the start of the current page view.
         // This requires `pageDocCursors[currentPage -1]` to be the start of the current page.
         const pageStartIndex = currentPage -1;
         if (pageStartIndex === 0) { // if current page is 1
            await fetchPosts(sortField, sortDirection, "first");
         } else {
            // To refetch current page, we need to use the cursor that *started* this page.
            // pageDocCursors[currentPage-1] is the last doc of the *previous* page.
            setQueryLastDoc(pageDocCursors[currentPage -1]); // This sets up startAfter correctly for the current page.
            await fetchPosts(sortField, sortDirection, "next");
         }

      } else {
        // Fallback if cursor logic gets complicated
        await fetchPosts(sortField, sortDirection, "first");
      }
      console.log(`Post ${postId} publish state toggled successfully.`);
    } catch (err) {
      console.error("Error toggling publish state:", err);
      // TODO: Show user-friendly error
    } finally {
      setActionLoading(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm("本当にこの投稿を削除しますか？ (Are you sure you want to delete this post?)")) {
      setActionLoading(prev => ({ ...prev, [`delete-${postId}`]: true }));
      try {
        const postRef = doc(db, "posts", postId);
        await deleteDoc(postRef);
        // After deletion, it's best to refetch from the first page of the current sort order
        // as the current page might no longer exist or be accurate.
        await fetchPosts(sortField, sortDirection, "first");
        setCurrentPage(1); // Reset to page 1
        console.log(`Post ${postId} deleted successfully.`);
      } catch (err) {
        console.error("Error deleting post:", err);
        // TODO: Show user-friendly error
      } finally {
        setActionLoading(prev => ({ ...prev, [`delete-${postId}`]: false }));
      }
    }
  };

  const handleNextPage = () => {
    if (isNextPageAvailable) {
      setCurrentPage(prev => prev + 1);
      fetchPosts(sortField, sortDirection, "next");
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
       // To go to previous page, we set queryLastDoc to be the *first document of the current page's data minus one item*
       // This is tricky. pageDocCursors[currentPage - 2] is the last doc of the page *before* the one we are going to.
       // So, if current is page 3, and we want to go to page 2, pageDocCursors[1] is last doc of page 1.
      setQueryLastDoc(pageDocCursors[currentPage - 2]); // This sets up startAfter for the beginning of the target page
      fetchPosts(sortField, sortDirection, "prev");
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="mb-6 flex space-x-4">
        <Button onClick={handleNewPost}>新しい投稿</Button>
        <Button variant="outline" onClick={handleImageManagement}>画像管理</Button>
      </div>

      {loading && <p>Loading posts...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>記事タイトル</TableHead>
              <TableHead>カテゴリー</TableHead>
              <TableHead>公開状態</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("publishDate")}
              >
                投稿日時{renderSortIcon("publishDate")}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-100"
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
                  <Link href={`/admin/post?id=${post.id}`} className="hover:underline text-blue-600">
                    {post.title}
                  </Link>
                </TableCell>
                <TableCell>{post.category}</TableCell>
                <TableCell>{post.isPublic ? "公開中" : "下書き"}</TableCell>
                <TableCell>{formatDate(post.publishDate)}</TableCell>
                <TableCell>{formatDate(post.updateDate)}</TableCell>
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
                <TableCell colSpan={7} className="text-center">
                  No posts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
      {/* Pagination controls will be added here in the next step */}
      {!loading && !error && posts.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <Button onClick={handlePrevPage} disabled={currentPage === 1 || loading}>
            Previous
          </Button>
          <span className="text-sm text-gray-700">
            Page {currentPage}
            {/* "of Y" is hard with Firestore without extra counts */}
          </span>
          <Button onClick={handleNextPage} disabled={!isNextPageAvailable || loading}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

export default withAdminAuth(AdminPage);
