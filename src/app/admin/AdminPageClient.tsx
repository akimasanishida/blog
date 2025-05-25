"use client";
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
import { CaretUpIcon, CaretDownIcon } from '@phosphor-icons/react';
import withAdminAuth from '@/components/withAdminAuth';
import { db } from '@/lib/firebase';
import { 
  collection, query, orderBy, getDocs, Timestamp, doc, updateDoc, deleteDoc, serverTimestamp, 
  OrderByDirection, limit, startAfter, QueryDocumentSnapshot
} from 'firebase/firestore';


// Define the Post interface
interface Post {
  id: string;
  title: string;
  slug: string;
  publishDate: Timestamp;
  updateDate: Timestamp;
  category: string;
  isPublic: boolean;
}

const formatDate = (timestamp: Timestamp | undefined | null): string => {
  if (!timestamp) return 'N/A';
  return timestamp.toDate().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

function AdminPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
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
      const baseQuery = query(postsCollectionRef, orderBy(currentSortField, currentSortDirection));
      if (pageDirection === "first") {
        setCurrentPage(1);
        setPageDocCursors([null]);
        q = query(baseQuery, limit(itemsPerPage));
      } else if (pageDirection === "next" && queryLastDoc) {
        q = query(baseQuery, startAfter(queryLastDoc), limit(itemsPerPage));
      } else if (pageDirection === "prev" && currentPage > 1) {
        const prevPageCursor = pageDocCursors[currentPage - 2];
        if (prevPageCursor) {
          q = query(baseQuery, startAfter(pageDocCursors[currentPage - 2]), limit(itemsPerPage));
        } else {
          q = query(baseQuery, limit(itemsPerPage));
        }
      } else {
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
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setQueryLastDoc(lastDoc || null);
      if (pageDirection === "first") {
        if (querySnapshot.docs.length === itemsPerPage) {
          setPageDocCursors([null, lastDoc]);
        } else {
          setPageDocCursors([null]);
        }
      } else if (pageDirection === "next" && lastDoc) {
        if (currentPage + 1 > pageDocCursors.length - 1) {
          setPageDocCursors(prev => [...prev.slice(0, currentPage), lastDoc]);
        } else {
          setPageDocCursors(prev => {
            const newCursors = [...prev];
            newCursors[currentPage] = lastDoc;
            return newCursors;
          });
        }
      }
      if (querySnapshot.docs.length < itemsPerPage) {
        setIsNextPageAvailable(false);
      } else {
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
    fetchPosts(sortField, sortDirection, "first");
  }, [sortField, sortDirection]);

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
      await updateDoc(postRef, {
        isPublic: !currentIsPublic,
        updateDate: serverTimestamp()
      });
      const currentCursorForPage = pageDocCursors[currentPage -1];
      if (currentPage === 1) {
        await fetchPosts(sortField, sortDirection, "first");
      } else if (currentCursorForPage) {
        setQueryLastDoc(pageDocCursors[currentPage -1]);
        await fetchPosts(sortField, sortDirection, "next");
      } else {
        await fetchPosts(sortField, sortDirection, "first");
      }
    } catch (err) {
      console.error("Error toggling publish state:", err);
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
        await fetchPosts(sortField, sortDirection, "first");
        setCurrentPage(1);
      } catch (err) {
        console.error("Error deleting post:", err);
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
      setQueryLastDoc(pageDocCursors[currentPage - 2]);
      fetchPosts(sortField, sortDirection, "prev");
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