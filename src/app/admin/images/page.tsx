"use client";

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Trash2, UploadCloud, RefreshCw, AlertCircle } from 'lucide-react';
import withAdminAuth from '@/components/withAdminAuth';
import { storage } from '@/lib/firebase';
import { 
  ref, uploadBytesResumable, getDownloadURL, listAll, deleteObject, StorageReference 
} from 'firebase/storage';

interface ImageInfo {
  url: string;
  name: string;
  refPath: string; // Full path in Storage, needed for deletion
}

const STORAGE_IMAGE_PATH = "images/posts/"; // Consistent with post editor

function AdminImagesPage() {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // selectedImageForDeletion is not strictly needed if confirmation directly uses image details
  // but can be useful for modal-based confirmation or more complex state.
  // For window.confirm, we can pass details directly.
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({}); // For delete buttons

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const imagesListRef = ref(storage, STORAGE_IMAGE_PATH);
      const res = await listAll(imagesListRef);
      const fetchedImageInfo: ImageInfo[] = await Promise.all(
        res.items.map(async (itemRef) => {
          const url = await getDownloadURL(itemRef);
          return { url, name: itemRef.name, refPath: itemRef.fullPath };
        })
      );
      fetchedImageInfo.sort((a, b) => a.name.localeCompare(b.name)); // Sort by name
      setImages(fetchedImageInfo);
    } catch (err) {
      console.error("Error fetching images:", err);
      setError("Failed to load images. Please try refreshing.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null); // Clear previous errors

    let fileName = file.name;
    const fileExt = fileName.substring(fileName.lastIndexOf('.'));
    const fileNameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
    
    let counter = 1;
    // Check against current list of images for name conflict
    // More robust check would be to listAll from storage again, but this is usually sufficient
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
      (uploadError) => {
        console.error("Upload error:", uploadError);
        setError(`Upload failed: ${uploadError.message}`);
        setIsUploading(false);
        setUploadProgress(0);
      },
      async () => {
        try {
          // No need to getDownloadURL here if we just refresh the list
          await fetchImages(); // Refresh the list to include the new image
        } catch (fetchErr) {
            console.error("Error refetching images after upload:", fetchErr);
            setError("Upload succeeded but failed to refresh image list.");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) {
              fileInputRef.current.value = ""; // Reset file input
            }
        }
      }
    );
  };

  const handleDeleteImage = async (imageToDelete: ImageInfo) => {
    if (window.confirm(`画像を削除してもよろしいですか？ (Are you sure you want to delete this image?) \n\n${imageToDelete.name}`)) {
      setActionLoading(prev => ({ ...prev, [imageToDelete.name]: true }));
      setError(null);
      try {
        const imageRef = ref(storage, imageToDelete.refPath);
        await deleteObject(imageRef);
        setImages(prevImages => prevImages.filter(img => img.refPath !== imageToDelete.refPath)); // Optimistic update
        // Or call fetchImages() for consistency, but optimistic is faster UX
      } catch (err) {
        console.error("Error deleting image:", err);
        setError(`Failed to delete ${imageToDelete.name}. Please try again.`);
      } finally {
        setActionLoading(prev => ({ ...prev, [imageToDelete.name]: false }));
      }
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">画像管理 (Image Management)</h1>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={fetchImages} disabled={isLoading || isUploading} title="Refresh images">
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload} 
            className="hidden" 
            ref={fileInputRef}
            disabled={isUploading}
          />
          <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            <UploadCloud className="mr-2 h-4 w-4" />
            {isUploading ? `アップロード中... ${uploadProgress.toFixed(0)}%` : "画像を追加 (Add Image)"}
          </Button>
        </div>
      </div>
      {isUploading && <Progress value={uploadProgress} className="w-full h-2 mb-4" />}
      {error && (
        <div className="mb-4 text-red-600 bg-red-100 p-3 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <ScrollArea className="h-[calc(100vh-260px)] w-full rounded-md border">
        {isLoading && <p className="text-center p-10">Loading images...</p>}
        {!isLoading && images.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-full p-10">
            <p className="text-lg text-gray-500">No images found.</p>
            <p className="text-sm text-gray-400 mt-2">Click "Add Image" to upload your first image.</p>
          </div>
        )}
        {!isLoading && images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
            {images.map((image) => (
              <div key={image.refPath} className="relative group border rounded-lg overflow-hidden shadow-sm">
                <img 
                  src={image.url} 
                  alt={image.name} 
                  className="w-full h-32 object-cover transition-transform duration-300 ease-in-out group-hover:scale-105" 
                />
                <div className="p-2">
                  <p className="text-xs font-medium truncate" title={image.name}>{image.name}</p>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full mt-2 text-xs"
                    onClick={() => handleDeleteImage(image)}
                    disabled={actionLoading[image.name]}
                  >
                    {actionLoading[image.name] ? (
                      "削除中..."
                    ) : (
                      <>
                        <Trash2 className="mr-1 h-3 w-3" /> 削除
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

export default withAdminAuth(AdminImagesPage);
