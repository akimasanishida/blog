"use client"; // Mark as a Client Component

import { useState, useEffect, ChangeEvent, useRef } from 'react'; // Added useRef
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress"; // For upload progress
import { RefreshCw, AlertCircle } from 'lucide-react'; // Icons

import withAdminAuth from '@/components/withAdminAuth'; // Import the HOC
import { db, storage } from '@/lib/firebase'; // Added storage
import {
  doc, getDoc, setDoc, addDoc, updateDoc, collection, serverTimestamp, Timestamp, query, where, getDocs
} from 'firebase/firestore';
import { 
  ref, uploadBytesResumable, getDownloadURL, listAll, deleteObject, StorageReference 
} from 'firebase/storage'; // Firebase Storage functions

// Define the Post interface
interface PostData {
  id?: string; // Optional because it's not present for new posts until save
  title: string;
  content: string;
  slug: string;
  category: string;
  publishDate?: Timestamp;
  updateDate?: Timestamp;
  isPublic: boolean;
}

// Interface for images in the panel
interface ImageInfo {
  url: string;
  name: string;
  refPath: string; // Full path in Storage, needed for deletion
}

const initialPostState: PostData = {
  title: '',
  content: '',
  slug: '',
  category: '',
  isPublic: false, // Default to draft
};

// Storage path prefix
const STORAGE_IMAGE_PATH = "images/posts/"; // Using a more specific path

function AdminPostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get('id');
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [post, setPost] = useState<PostData>(initialPostState);
  const [isLoading, setIsLoading] = useState(true); // For page data
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // For post save
  const [error, setError] = useState<string | null>(null); // For post save/load errors

  // State for Image Panel
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isLoadingImages, setIsLoadingImages] = useState(true);


  // Fetch Post Data Effect
  useEffect(() => {
    if (postId) {
      setIsEditing(true);
      setIsLoading(true); // For post data
      const fetchPost = async () => {
        try {
          const postRef = doc(db, "posts", postId);
          const docSnap = await getDoc(postRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as PostData;
            setPost({ ...initialPostState, ...data, id: docSnap.id });
          } else {
            setError("Post not found.");
            setPost(initialPostState); // Reset to initial if not found
          }
        } catch (err) {
          console.error("Error fetching post:", err);
          setError("Failed to load post data.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchPost();
    } else {
      setPost(initialPostState); // New post
      setIsEditing(false);
      setIsLoading(false); // For post data
    }
  }, [postId]);

  // Fetch Images for Panel Effect
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setIsLoadingImages(true);
    setImageError(null);
    try {
      const imagesListRef = ref(storage, STORAGE_IMAGE_PATH);
      const res = await listAll(imagesListRef);
      const fetchedImageInfo: ImageInfo[] = await Promise.all(
        res.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return { url, name: itemRef.name, refPath: itemRef.fullPath };
        })
      );
      // Sort images by name, or could be by upload date if metadata is stored
      fetchedImageInfo.sort((a, b) => a.name.localeCompare(b.name));
      setImages(fetchedImageInfo);
    } catch (err) {
      console.error("Error fetching images:", err);
      setImageError("Failed to load images from storage.");
    } finally {
      setIsLoadingImages(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPost(prevPost => ({
      ...prevPost,
      [name]: value,
    }));
  };

  const handleSlugChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const sanitizedSlug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setPost(prevPost => ({
      ...prevPost,
      slug: sanitizedSlug,
    }));
  };

  const handleImageClickToInsert = (image: ImageInfo) => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const markdown = `![${image.name}](${image.url})`;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = post.content;
    const newContent = currentContent.substring(0, start) + markdown + currentContent.substring(end);
    
    setPost(prev => ({ ...prev, content: newContent }));

    // Focus textarea and move cursor after inserted markdown
    textarea.focus();
    setTimeout(() => { // Timeout ensures focus and selection update
      textarea.selectionStart = textarea.selectionEnd = start + markdown.length;
    }, 0);
  };
  
  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setImageError(null);

    let fileName = file.name;
    const fileExt = fileName.substring(fileName.lastIndexOf('.'));
    const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));

    // Handle name conflicts
    let counter = 1;
    const existingImageNames = images.map(img => img.name);
    while (existingImageNames.includes(fileName)) {
      fileName = `${fileNameWithoutExt}-${counter}${fileExt}`;
      counter++;
    }
    
    const imageRef = ref(storage, `${STORAGE_IMAGE_PATH}${fileName}`);
    const uploadTask = uploadBytesResumable(imageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload error:", error);
        setImageError(`Upload failed: ${error.message}`);
        setIsUploading(false);
        setUploadProgress(0);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const newImage: ImageInfo = { url: downloadURL, name: fileName, refPath: uploadTask.snapshot.ref.fullPath };
          setImages(prevImages => [...prevImages, newImage].sort((a, b) => a.name.localeCompare(b.name))); // Add and re-sort
          
          // Optionally insert into content
          handleImageClickToInsert(newImage);

        } catch (err) {
            console.error("Error getting download URL or updating image list:", err);
            setImageError("Upload succeeded but failed to update image list or get URL.");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) { // Reset file input
              fileInputRef.current.value = "";
            }
        }
      }
    );
  };

  const handleSave = async () => {
    setError(null);
    if (!post.slug) {
      setError("スラッグは必須です。 (Slug is required.)");
      return;
    }
    if (!post.title) {
        setError("タイトルは必須です。 (Title is required.)");
        return;
    }
    setIsSaving(true);
    try {
      const postsCollection = collection(db, "posts");
      const slugQuery = query(postsCollection, where("slug", "==", post.slug));
      const querySnapshot = await getDocs(slugQuery);
      
      let slugExists = false;
      if (!querySnapshot.empty) {
        if (isEditing && postId) {
          // If editing, check if the found slug belongs to a *different* post
          querySnapshot.forEach(docSnap => {
            if (docSnap.id !== postId) {
              slugExists = true;
            }
          });
        } else {
          // If creating a new post, any match means the slug exists
          slugExists = true;
        }
      }

      if (slugExists) {
        setError(`スラッグ "${post.slug}" は既に存在します。別のスラッグを選択してください。 (Slug "${post.slug}" already exists. Please choose another.)`);
        setIsSaving(false);
        return;
      }

      const dataToSave: Omit<PostData, 'id'> & { updateDate: Timestamp, publishDate?: Timestamp } = {
        title: post.title,
        content: post.content,
        slug: post.slug,
        category: post.category,
        isPublic: post.isPublic, // For now, save button always sets this as per post state. Could be separate "Publish" button.
        updateDate: serverTimestamp() as Timestamp,
      };

      if (isEditing && postId) {
        const postRef = doc(db, "posts", postId);
        // publishDate should not be overwritten on update unless specifically intended
        // If post.publishDate is already a Timestamp, it means it was set.
        // If it's being published for the first time from a draft, set it.
        if (post.isPublic && !post.publishDate) {
            dataToSave.publishDate = serverTimestamp() as Timestamp;
        } else if (post.publishDate) {
            dataToSave.publishDate = post.publishDate; // Keep existing publishDate
        }

        await updateDoc(postRef, dataToSave);
        alert("投稿を更新しました！ (Post updated successfully!)");
      } else {
        // New post
        dataToSave.publishDate = serverTimestamp() as Timestamp; // Set publishDate on creation
        dataToSave.isPublic = true; // New posts are published directly by this button
        
        const newPostRef = await addDoc(collection(db, "posts"), dataToSave);
        alert("投稿を作成しました！ (Post created successfully!)");
        router.push(`/admin/post?id=${newPostRef.id}`); // Redirect to edit mode for the new post
      }
    } catch (err) {
      console.error("Error saving post:", err);
      setError("投稿の保存に失敗しました。 (Failed to save post.)");
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return <div className="container mx-auto py-10 text-center">Loading post data...</div>;
  }
  if (error && !isSaving) { // Don't show general page error if it's a save-specific error shown inline
    // This error state is for page load errors mainly. Save errors are handled inline.
  }


  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">
        {isEditing ? "記事の編集 (Edit Post)" : "記事の作成 (Create Post)"}
      </h1>
      
      {error && <p className="text-red-500 mb-4 bg-red-100 p-3 rounded-md">{error}</p>}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Pane */}
        <div className="flex-1 space-y-6">
          <div>
            <label htmlFor="postTitle" className="block text-sm font-medium text-gray-700 mb-1">タイトル (Title)</label>
            <Input 
              id="postTitle" 
              name="title"
              value={post.title}
              onChange={handleInputChange}
              placeholder="Enter post title" 
              disabled={isSaving}
            />
          </div>

          <div>
            <label htmlFor="postContent" className="block text-sm font-medium text-gray-700 mb-1">本文 (Content - Markdown)</label>
            <Textarea 
              id="postContent" 
              name="content"
              ref={contentTextareaRef} // Assign ref
              value={post.content}
              onChange={handleInputChange}
              placeholder="Write your post content here..." 
              rows={20} 
              disabled={isSaving || isUploading}
            />
            {/* TODO: Add Markdown preview */}
          </div>
          
          <div>
            <Button size="lg" onClick={handleSave} disabled={isSaving || isUploading}>
              {isSaving ? (isEditing ? "更新中..." : "公開中...") : (isEditing ? "更新する (Update)" : "公開する (Publish)")}
            </Button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full md:w-1/3 lg:w-1/4 space-y-6">
          <div>
            <label htmlFor="postSlug" className="block text-sm font-medium text-gray-700 mb-1">スラッグ (Slug)</label>
            <Input 
              id="postSlug" 
              name="slug"
              value={post.slug}
              onChange={handleSlugChange}
              placeholder="Enter slug (e.g., my-first-post)" 
              disabled={isSaving || isUploading}
            />
          </div>

          <div>
            <label htmlFor="postCategory" className="block text-sm font-medium text-gray-700 mb-1">カテゴリー (Category)</label>
            <Input 
              id="postCategory" 
              name="category"
              value={post.category}
              onChange={handleInputChange}
              placeholder="Enter category" 
              disabled={isSaving || isUploading}
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">画像 (Images)</h3>
              <Button variant="ghost" size="sm" onClick={fetchImages} disabled={isLoadingImages || isUploading}>
                <RefreshCw className={`h-4 w-4 ${isLoadingImages ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <ScrollArea className="h-72 w-full rounded-md border p-2 mb-2">
              {isLoadingImages && <p className="text-xs text-gray-500 text-center">Loading images...</p>}
              {imageError && !isUploading && (
                <div className="text-red-500 text-xs p-2 bg-red-50 rounded-md flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" /> 
                  <span>{imageError}</span>
                </div>
              )}
              {!isLoadingImages && images.length === 0 && !imageError && (
                <p className="text-xs text-gray-400 text-center py-4">No images uploaded yet.</p>
              )}
              <div className="grid grid-cols-3 gap-2">
                {images.map((img) => (
                  <div 
                    key={img.url} 
                    className="cursor-pointer border rounded-md overflow-hidden hover:ring-2 ring-blue-500"
                    onClick={() => handleImageClickToInsert(img)}
                    title={`Insert ${img.name}`}
                  >
                    <img src={img.url} alt={img.name} className="w-full h-20 object-cover" />
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="hidden" 
              ref={fileInputRef}
              disabled={isUploading || isSaving}
            />
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isSaving}
            >
              {isUploading ? `アップロード中... ${uploadProgress.toFixed(0)}%` : "画像をアップロード (Upload Image)"}
            </Button>
            {isUploading && <Progress value={uploadProgress} className="w-full h-2 mt-1" />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAdminAuth(AdminPostPage);
