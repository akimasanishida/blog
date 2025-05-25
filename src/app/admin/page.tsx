import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import withAdminAuth from '@/components/withAdminAuth'; // Import the HOC

function AdminPage() {
  // Placeholder data for the table
  const posts = [
    { id: "1", title: "My First Post", category: "Tech", publishDate: "2024-01-01", updateDate: "2024-01-02" },
  ];

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="mb-6 flex space-x-4">
        <Button>新しい投稿</Button>
        <Button variant="outline">画像管理</Button>
      </div>

      {/* TODO: Implement actual data fetching and table population */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>記事タイトル</TableHead>
            <TableHead>カテゴリー</TableHead>
            <TableHead>投稿日時</TableHead>
            <TableHead>更新日時</TableHead>
            <TableHead>ページを見る</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell>{/* TODO: Link to admin/post?id=[post_id] */}{post.title}</TableCell>
              <TableCell>{post.category}</TableCell>
              <TableCell>{post.publishDate}</TableCell>
              <TableCell>{post.updateDate}</TableCell>
              <TableCell>{/* TODO: Link to actual post page */}<Button variant="outline" size="sm">見る</Button></TableCell>
              <TableCell>
                {/* TODO: Implement Draft and Delete buttons */}
                <Button variant="ghost" size="sm">下書き</Button>
                <Button variant="destructive" size="sm" className="ml-2">削除</Button>
              </TableCell>
            </TableRow>
          ))}
          {posts.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No posts found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default withAdminAuth(AdminPage); // Wrap the component with the HOC
