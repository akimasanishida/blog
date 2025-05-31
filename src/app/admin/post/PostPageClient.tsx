"use client";
import { useState, useEffect, ChangeEvent, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowsClockwiseIcon , WarningCircleIcon  } from '@phosphor-icons/react';
import Image from "next/image";
import withAdminAuth from '@/components/withAdminAuth';
import { db, storage } from '@/lib/firebase';
import {
  doc, getDoc, addDoc, updateDoc, collection, serverTimestamp, Timestamp, query, where, getDocs
} from 'firebase/firestore';
import {
  ref, uploadBytesResumable, getDownloadURL, listAll
} from 'firebase/storage';
import ImageDetailOverlay, { ImageInfo as OverlayImageInfo } from '@/components/ImageDetailOverlay'; // Import the new component

// Define the Post interface
interface PostData {
  id?: string;
  title: string;
  content: string;
  slug: string;
  category: string;
  publishDate?: Timestamp | null; // Optional, can be null for drafts
  updateDate?: Timestamp | null; // Optional, can be null for new posts
  isPublic: boolean;
}

// Interface for images in the panel - This should match OverlayImageInfo
// Ensure ImageInfo here is compatible with OverlayImageInfo. For now, they are structurally identical.
interface ImageInfo { // This is used for the 'images' state array
  url: string;
  name: string;
  refPath: string;
}


const initialPostState: PostData = {
  title: '',
  content: '',
  slug: '',
  category: '',
  isPublic: false,
};

const STORAGE_IMAGE_PATH = "images/posts/";

function AdminPostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get('id');
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [post, setPost] = useState<PostData>(initialPostState);
  const [initialPost, setInitialPost] = useState<PostData>(initialPostState); // For change detection
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  const [selectedImageForOverlay, setSelectedImageForOverlay] = useState<OverlayImageInfo | null>(null); // Use OverlayImageInfo here

  useEffect(() => {
    if (postId) {
      setIsEditing(true);
      setIsLoading(true);
      const fetchPost = async () => {
        try {
          const postRef = doc(db, "posts", postId);
          const docSnap = await getDoc(postRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as PostData;
            const fullPostData = { ...initialPostState, ...data, id: docSnap.id };
            setPost(fullPostData);
            setInitialPost(fullPostData); // Store initial data
          } else {
            setError("Post not found.");
            setPost(initialPostState);
            setInitialPost(initialPostState);
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
      setPost(initialPostState);
      setInitialPost(initialPostState);
      setIsEditing(false);
      setIsLoading(false);
    }
  }, [postId]);

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const hasUnsavedChanges = JSON.stringify(post) !== JSON.stringify(initialPost);
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = ''; // Required for Chrome
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [post, initialPost]);

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
    // Allow manual slug editing, sanitize on save or blur if needed, or keep as is.
    // For now, direct update, sanitization will be part of save.
    setPost(prevPost => ({
      ...prevPost,
      slug: value, // Allow more flexible input, sanitize before saving
    }));
  };

  const handleImageClickToInsert = (image: ImageInfo) => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const markdown = `![${image.name}](${image.url})`;
    
    // Store current selection start to set cursor position later
    const selectionStart = textarea.selectionStart;

    textarea.focus(); // Focus is important for execCommand to work on the right element

    // execCommand 'insertText' will replace selected text or insert at cursor
    const success = document.execCommand('insertText', false, markdown);

    if (success) {
      // Update React state with the new content from the textarea
      // This is crucial because execCommand modifies the DOM directly
      setPost(prev => ({ ...prev, content: textarea.value }));

      // Update cursor position to be after the inserted text
      // Need a timeout to ensure the DOM update from execCommand has completed
      setTimeout(() => {
        if (contentTextareaRef.current) { // Check ref again in timeout
          const newCursorPosition = selectionStart + markdown.length;
          contentTextareaRef.current.selectionStart = newCursorPosition;
          contentTextareaRef.current.selectionEnd = newCursorPosition;
        }
      }, 0);
    } else {
      // Fallback for browsers that might not support insertText fully
      // or if execCommand fails for some reason. This is the old behavior.
      console.warn("document.execCommand('insertText', ...) failed. Using fallback.")
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentContent = textarea.value; // Use textarea.value for current content
      const newContent = currentContent.substring(0, start) + markdown + currentContent.substring(end);
      setPost(prev => ({ ...prev, content: newContent }));
      // Cursor update for fallback
      setTimeout(() => {
        if (contentTextareaRef.current) {
          contentTextareaRef.current.selectionStart = contentTextareaRef.current.selectionEnd = start + markdown.length;
        }
      }, 0);
    }
  };

  const handleImageClickInPanel = (image: OverlayImageInfo) => { // Parameter type changed to OverlayImageInfo
    setSelectedImageForOverlay(image);
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
          setImages(prevImages => [...prevImages, newImage].sort((a, b) => a.name.localeCompare(b.name)));
          setSelectedImageForOverlay(newImage); // Show overlay instead of direct insert
        } catch (err) {
          console.error("Error getting download URL or updating image list:", err);
          setImageError("Upload succeeded but failed to update image list or get URL.");
        } finally {
          setIsUploading(false);
          setUploadProgress(0);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      }
    );
  };

  const processSave = async (
    action: 'publish' | 'update' | 'saveDraft'
  ) => {
    setError(null);

    const sanitizedSlug = post.slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (!sanitizedSlug) {
      setError("URLは必須です。 (Slug is required.)");
      return;
    }
    const currentPostData = { ...post, slug: sanitizedSlug };

    if (!currentPostData.title) {
      setError("タイトルは必須です。 (Title is required.)");
      return;
    }

    if (isEditing && postId && currentPostData.slug !== initialPost.slug) {
      const confirmSlugChange = window.confirm(
        "URLを変更すると、既存のURLが無効になる可能性があります。本当に変更しますか？ (Changing the slug might break existing URLs. Are you sure you want to change it?)"
      );
      if (!confirmSlugChange) {
        return;
      }
    }

    setIsSaving(true);
    try {
      const postsCollection = collection(db, "posts");
      const slugQuery = query(postsCollection, where("slug", "==", currentPostData.slug));
      const querySnapshot = await getDocs(slugQuery);
      let slugExists = false;
      if (!querySnapshot.empty) {
        if (isEditing && postId) {
          querySnapshot.forEach(docSnap => {
            if (docSnap.id !== postId) {
              slugExists = true;
            }
          });
        } else {
          slugExists = true;
        }
      }

      if (slugExists) {
        setError(`このURL "${currentPostData.slug}" は既に存在します。別のURLを選択してください。 (Slug "${currentPostData.slug}" already exists. Please choose another.)`);
        setIsSaving(false);
        return;
      }

      const hasContentChanged =
        currentPostData.title !== initialPost.title ||
        currentPostData.content !== initialPost.content ||
        currentPostData.slug !== initialPost.slug || // Slug is part of content change check
        currentPostData.category !== initialPost.category;

      const finalDataToSave: {
        title: string;
        content: string;
        slug: string;
        category: string;
        isPublic: boolean;
        publishDate?: Timestamp | null | import("firebase/firestore").FieldValue;
        updateDate?: Timestamp | null | import("firebase/firestore").FieldValue;
      } = {
        title: currentPostData.title,
        content: currentPostData.content,
        slug: currentPostData.slug,
        category: currentPostData.category,
      };

      // Determine isPublic state
      if (action === 'publish' || action === 'update') {
        finalDataToSave.isPublic = true;
      } else { // saveDraft
        finalDataToSave.isPublic = false;
      }

      // Determine publishDate
      if (action === 'publish') {
        if (!isEditing) { // New post published
          finalDataToSave.publishDate = serverTimestamp() as Timestamp;
        } else { // Existing draft published
          finalDataToSave.publishDate = initialPost.publishDate || serverTimestamp() as Timestamp;
        }
      } else if (action === 'update') { // Existing public post
        finalDataToSave.publishDate = initialPost.publishDate; // Must exist, keep current
      } else { // saveDraft
        if (!isEditing) { // New draft
          finalDataToSave.publishDate = null;
        } else { // Existing post saved as draft
          finalDataToSave.publishDate = initialPost.publishDate || null; // Preserve if existed, else null
        }
      }

      // Determine updateDate
      if (hasContentChanged) {
        finalDataToSave.updateDate = serverTimestamp() as Timestamp;
      } else {
        if (!isEditing) { // New post (publish or draft), content hasn't "changed" from initial empty state yet
          finalDataToSave.updateDate = null;
        } else { // Existing post, no content change
          finalDataToSave.updateDate = initialPost.updateDate || null; // Keep old updateDate
        }
      }
      
      // Override: For brand new posts (first save, publish or draft), updateDate is always null.
      // This takes precedence over hasContentChanged for the initial save.
      if (!isEditing) {
        finalDataToSave.updateDate = null;
      }

      let newPostRefId: string | null = null;

      if (isEditing && postId) {
        const postRef = doc(db, "posts", postId);
        // Firestore's updateDoc only updates fields provided.
        // If finalDataToSave.updateDate is null, it will set it to null.
        // If a field is undefined in finalDataToSave, it will be ignored by updateDoc.
        // Ensure all paths correctly set fields to null instead of undefined if they should be cleared.
        await updateDoc(postRef, finalDataToSave);
      } else { // New post
        // AddDoc will create fields. If a field is null, it's stored as null.
        // If undefined, Firestore might store it as null or ignore, better to be explicit with null.
        const newPostRef = await addDoc(collection(db, "posts"), finalDataToSave);
        newPostRefId = newPostRef.id;
      }

      const currentSavedId = (isEditing && postId) ? postId : newPostRefId!;
      const synchronizedPostState: PostData = {
        id: currentSavedId,
        title: finalDataToSave.title,
        content: finalDataToSave.content,
        slug: finalDataToSave.slug,
        category: finalDataToSave.category,
        isPublic: finalDataToSave.isPublic,
        publishDate: finalDataToSave.publishDate, // This could be Timestamp, serverTimestamp, or null
        updateDate: finalDataToSave.updateDate,   // This could be Timestamp, serverTimestamp, or null
      };

      // Replace serverTimestamp() sentinels with client-side Timestamp.now() for immediate UI consistency
      if (finalDataToSave.publishDate && !(finalDataToSave.publishDate instanceof Timestamp) && finalDataToSave.publishDate !== null) {
        synchronizedPostState.publishDate = Timestamp.now();
      } else {
        synchronizedPostState.publishDate = finalDataToSave.publishDate; // Already a Timestamp or null
      }

      if (finalDataToSave.updateDate && !(finalDataToSave.updateDate instanceof Timestamp) && finalDataToSave.updateDate !== null) {
        synchronizedPostState.updateDate = Timestamp.now();
      } else {
        synchronizedPostState.updateDate = finalDataToSave.updateDate; // Already a Timestamp or null
      }

      setPost(synchronizedPostState);
      setInitialPost(synchronizedPostState); // Keep initialPost in sync with the saved state

      if (!isEditing && newPostRefId) {
        alert("投稿を作成しました！ (Post created successfully!)");
        router.push(`/admin/post?id=${newPostRefId}`);
      } else if (isEditing) {
        alert("投稿を更新しました！ (Post updated successfully!)");
      }

    } catch (err) {
      console.error("Error saving post:", err);
      setError("投稿の保存に失敗しました。 (Failed to save post.)");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-10 text-center">投稿データを読み込み中...</div>;
  }

  return (
    <>
      <ImageDetailOverlay
        image={selectedImageForOverlay}
        isOpen={!!selectedImageForOverlay}
        onClose={() => setSelectedImageForOverlay(null)}
        onInsert={(imageToInsert) => {
          handleImageClickToInsert(imageToInsert);
        }}
        showInsertButton={true}
      />
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">
          {isEditing ? "記事の編集" : "記事の作成"}
        </h1>
        {error && <p className="text-red-500 mb-4 bg-red-100 p-3 rounded-md">{error}</p>}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Pane */}
          <div className="flex-1 space-y-8 flex-shrink-0 md:w-2/3 lg:w-3/4">
            <div className='flex-1 space-y-6'>
              <div>
                <label htmlFor="postTitle" className="block text-sm font-medium text-foreground mb-2">タイトル</label>
                <Input
                  id="postTitle"
                  name="title"
                  value={post.title}
                  onChange={handleInputChange}
                  placeholder="タイトルを入力"
                  disabled={isSaving || isUploading}
                />
              </div>
              <div>
                <label htmlFor="postContent" className="block text-sm font-medium text-foreground mb-2">本文（Markdown）</label>
                <Textarea
                      id="postContent"
                      name="content"
                      className="h-70 overflow-y-scroll resize-none"
                      ref={contentTextareaRef}
                      value={post.content}
                      onChange={handleInputChange}
                      placeholder="本文を入力してください..."
                      disabled={isSaving || isUploading}
                      style={{ minHeight: 0 }}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  let publishDateForPreview: string | null = null;
                  if (post.publishDate) {
                    if (typeof post.publishDate === 'string') {
                      // Attempt to parse if it's a string; if not valid, new Date() will handle it
                      const d = new Date(post.publishDate);
                      if (!isNaN(d.getTime())) {
                        publishDateForPreview = d.toISOString();
                      } else {
                        // If string is not a valid date, could fall back or log error
                        // For preview, using current date as fallback if string is invalid
                        console.warn("Invalid date string for publishDate:", post.publishDate);
                        publishDateForPreview = new Date().toISOString();
                      }
                    } else if ('toDate' in post.publishDate && typeof post.publishDate.toDate === 'function') { // Firestore Timestamp
                      publishDateForPreview = post.publishDate.toDate().toISOString();
                    } else if (post.publishDate instanceof Date) { // JavaScript Date
                      publishDateForPreview = post.publishDate.toISOString();
                    } else {
                      // Unhandled type, fallback to current date for preview
                      console.warn("Unknown type for publishDate:", post.publishDate);
                      publishDateForPreview = new Date().toISOString();
                    }
                  } else {
                    // For new, unsaved posts, use current time for preview
                    publishDateForPreview = new Date().toISOString();
                  }

                  // updateDateもISO文字列で渡す
                  let updateDateForPreview: string | null = null;
                  if (post.updateDate) {
                    if (typeof post.updateDate === 'string') {
                      const d = new Date(post.updateDate);
                      if (!isNaN(d.getTime())) {
                        updateDateForPreview = d.toISOString();
                      } else {
                        updateDateForPreview = new Date().toISOString();
                      }
                    } else if ('toDate' in post.updateDate && typeof post.updateDate.toDate === 'function') {
                      updateDateForPreview = post.updateDate.toDate().toISOString();
                    } else if (post.updateDate instanceof Date) {
                      updateDateForPreview = post.updateDate.toISOString();
                    } else {
                      updateDateForPreview = new Date().toISOString();
                    }
                  } else {
                    updateDateForPreview = new Date().toISOString();
                  }

                  const previewData = {
                    title: post.title || "Untitled Post",
                    content: post.content,
                    category: post.category || "",
                    publishDate: publishDateForPreview,
                    updateDate: updateDateForPreview,
                  };

                  try {
                    sessionStorage.setItem('postPreviewData', JSON.stringify(previewData));
                    window.open('/admin/post/preview', '_blank');
                  } catch (error) {
                    console.error("Error saving preview data to sessionStorage:", error);
                    alert("Could not open preview. There might be an issue with your browser's storage, or the data is too large.");
                  }
                }}
                disabled={isSaving || isUploading || !post.content?.trim()}
              >
                プレビュー
              </Button>
              {(!postId || (postId && !post.isPublic)) && (
                <Button
                  size="lg"
                  onClick={() => processSave('saveDraft')}
                  disabled={isSaving || isUploading}
                >
                  {isSaving ? "下書きを保存中..." : "下書きを保存"}
                </Button>
              )}
              {(!postId || (postId && !post.isPublic)) && (
                <Button
                  size="lg"
                  onClick={() => processSave('publish')}
                  disabled={isSaving || isUploading}
                >
                  {isSaving ? "公開中..." : "公開"}
                </Button>
              )}
              {(postId && post.isPublic) && (
                <Button
                  size="lg"
                  onClick={() => processSave('update')}
                  disabled={isSaving || isUploading}
                >
                  {isSaving ? "更新中..." : "更新"}
                </Button>
              )}
            </div>
          </div>
          {/* Right Sidebar */}
          <div className="w-full md:w-1/3 lg:w-1/4 space-y-6 flex-shrink-0">
            <div>
              <label htmlFor="postSlug" className="block text-sm font-medium text-foreground mb-1">URL</label>
              <Input
                id="postSlug"
                name="slug"
                value={post.slug}
                onChange={handleSlugChange} // Using direct input change, sanitization on save
                placeholder="例: my-first-post"
                disabled={isSaving || isUploading}
              />
            </div>
            <div>
              <label htmlFor="postCategory" className="block text-sm font-medium text-foreground mb-1">カテゴリー</label>
              <Input
                id="postCategory"
                name="category"
                value={post.category}
                onChange={handleInputChange}
                placeholder="カテゴリーを入力"
                disabled={isSaving || isUploading}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">画像</h3>
                <Button variant="ghost" size="sm" onClick={fetchImages} disabled={isLoadingImages || isUploading}>
                  <ArrowsClockwiseIcon className={`h-4 w-4 ${isLoadingImages ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <ScrollArea className="h-72 w-full rounded-md border p-2 mb-2">
                {isLoadingImages && <p className="text-xs text-foreground text-center">画像を読み込み中...</p>}
                {imageError && !isUploading && (
                  <div className="text-red-500 text-xs p-2 bg-red-50 rounded-md flex items-center">
                    <WarningCircleIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>{imageError}</span>
                  </div>
                )}
                {!isLoadingImages && images.length === 0 && !imageError && (
                  <p className="text-xs text-foreground text-center py-4">まだ画像がアップロードされていません。</p>
                )}
                <div className="grid grid-cols-3 gap-2 my-2 mx-2">
                  {images.map((img) => (
                    <div
                      key={img.url}
                      className="cursor-pointer border rounded-md overflow-hidden hover:ring-2 ring-blue-500"
                      onClick={() => handleImageClickInPanel(img)} // Changed this
                      title={`「${img.name}」を選択`}
                    >
                      <Image
                        src={img.url}
                        alt={img.name}
                        width={200}
                        height={200}
                        className="w-full h-20 object-cover"
                      />
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
                {isUploading ? `アップロード中... ${uploadProgress.toFixed(0)}%` : "画像をアップロード"}
              </Button>
              {/* Progress bar fallback */}
              {isUploading && (
                <div className="w-full h-2 mt-1 bg-gray-200 rounded">
                  <div
                    className="h-2 bg-blue-500 rounded"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default withAdminAuth(AdminPostPage);
