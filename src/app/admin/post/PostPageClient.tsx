"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import withAdminAuth from '@/components/withAdminAuth';

function AdminPostPage() {
  // TODO: Add logic to fetch post data if editing (e.g., from URL query id)

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">記事の作成・編集 (Create/Edit Post)</h1>
      {/* TODO: Add form handling logic (e.g., using react-hook-form) */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Pane */}
        <div className="flex-1 space-y-6">
          <div>
            <label htmlFor="postTitle" className="block text-sm font-medium text-gray-700 mb-1">タイトル (Title)</label>
            <Input id="postTitle" placeholder="Enter post title" />
          </div>

          <div>
            <label htmlFor="postContent" className="block text-sm font-medium text-gray-700 mb-1">本文 (Content - Markdown)</label>
            <Textarea id="postContent" placeholder="Write your post content here..." rows={20} />
            {/* TODO: Add Markdown preview if possible */}
            {/* TODO: Add logic for handling image selection from ScrollArea to insert into Textarea */}
          </div>
          
          <div>
            {/* TODO: Change button text based on create/edit mode (e.g., "公開する" or "更新する") */}
            {/* TODO: Implement "Publish/Update" button click (including slug validation and network requests) */}
            <Button size="lg">公開する (Publish)</Button> 
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full md:w-1/3 lg:w-1/4 space-y-6">
          <div>
            <label htmlFor="postSlug" className="block text-sm font-medium text-gray-700 mb-1">スラッグ (Slug)</label>
            <Input id="postSlug" placeholder="Enter slug (e.g., my-first-post)" />
            {/* TODO: Add slug validation logic (e.g., regex, uniqueness check) */}
          </div>

          <div>
            <label htmlFor="postCategory" className="block text-sm font-medium text-gray-700 mb-1">カテゴリー (Category)</label>
            <Input id="postCategory" placeholder="Enter category" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">画像 (Images)</h3>
            <ScrollArea className="h-72 w-full rounded-md border p-4 mb-2">
              {/* TODO: Populate with uploaded images. Each image should be clickable to insert into Textarea */}
              <p className="text-sm text-gray-500 text-center py-4">Uploaded Images Panel</p>
              <p className="text-xs text-gray-400 text-center">Uploaded images will appear here. Click to insert into content.</p>
            </ScrollArea>
            {/* TODO: Implement image upload functionality */}
            <Button variant="outline" className="w-full">画像をアップロード (Upload Image)</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAdminAuth(AdminPostPage);
