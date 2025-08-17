"use client";

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrashIcon, CloudArrowUpIcon, ArrowsClockwiseIcon, WarningCircleIcon} from '@phosphor-icons/react'
import withAdminAuth from '@/components/withAdminAuth';
import { storage } from '@/lib/firebase';
import { 
  ref, uploadBytesResumable, getDownloadURL, listAll, deleteObject 
} from 'firebase/storage';
import ImageDetailOverlay, { ImageInfo as OverlayImageInfo } from '@/components/ImageDetailOverlay'; // Import the new component
import { ImageInfo } from '@/types/image';

const STORAGE_IMAGE_PATH = "images/posts/";

function AdminImagesPage() {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImageForOverlay, setSelectedImageForOverlay] = useState<OverlayImageInfo | null>(null); // State for the overlay

  const fetchImages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/images');
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      const fetchedImageInfo: ImageInfo[] = await response.json();
      setImages(fetchedImageInfo);
    } catch (err) {
      console.error("Error fetching images:", err);
      setError("画像の読み込みに失敗しました。再読み込みしてください。");
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
    setError(null);
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
      (uploadError) => {
        console.error("Upload error:", uploadError);
        setError(`Upload failed: ${uploadError.message}`);
        setIsUploading(false);
        setUploadProgress(0);
      },
      async () => {
        try {
          await fetchImages();
        } catch (fetchErr) {
          console.error("Error refetching images after upload:", fetchErr);
          setError("Upload succeeded but failed to refresh image list.");
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

  const handleDeleteImage = async (imageToDelete: ImageInfo) => {
    if (window.confirm(`画像を削除してもよろしいですか？\n${imageToDelete.name}`)) {
      setActionLoading(prev => ({ ...prev, [imageToDelete.name]: true }));
      setError(null);
      try {
        const imageRef = ref(storage, imageToDelete.refPath);
        await deleteObject(imageRef);
        setImages(prevImages => prevImages.filter(img => img.refPath !== imageToDelete.refPath));
      } catch (err) {
        console.error("Error deleting image:", err);
        setError(`${imageToDelete.name} の削除に失敗しました。再度お試しください。`);
      } finally {
        setActionLoading(prev => ({ ...prev, [imageToDelete.name]: false }));
      }
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">画像管理</h1>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={fetchImages} disabled={isLoading || isUploading} title="画像を再読み込み">
            <ArrowsClockwiseIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
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
            <CloudArrowUpIcon className="mr-2 h-4 w-4" />
            {isUploading ? `アップロード中... ${uploadProgress.toFixed(0)}%` : "画像を追加"}
          </Button>
        </div>
      </div>
      {isUploading && (
        <div className="w-full h-2 mb-4 bg-gray-200 rounded">
          <div
            className="h-2 bg-blue-500 rounded"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}
      {error && (
        <div className="mb-4 text-red-600 bg-red-100 p-3 rounded-md flex items-center">
          <WarningCircleIcon className="h-5 w-5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <ScrollArea className="h-[calc(100vh-260px)] w-full rounded-md border">
        {isLoading && <p className="text-center p-10">画像を読み込み中...</p>}
        {!isLoading && images.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-full p-10">
            <p className="text-lg text-gray-500">画像がありません。</p>
            <p className="text-sm text-gray-400 mt-2">「画像を追加」ボタンから画像をアップロードできます。</p>
          </div>
        )}
        {!isLoading && images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
            {images.map((image) => (
              <div key={image.refPath} className="relative group border rounded-lg overflow-hidden shadow-sm">
                <Image
                  src={image.url}
                  alt={image.name}
                  width={200}
                  height={200}
                  className="w-full h-32 object-cover transition-transform duration-300 ease-in-out group-hover:scale-105 cursor-pointer"
                  onClick={() => setSelectedImageForOverlay(image)} // Open overlay on image click
                />
                <div className="p-2">
                  <p 
                    className="text-xs font-medium truncate cursor-pointer hover:underline" 
                    title={image.name}
                    onClick={() => setSelectedImageForOverlay(image)} // Open overlay on text click
                  >
                    {image.name}
                  </p>
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
                        <TrashIcon className="mr-1 h-3 w-3" /> 削除
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      <ImageDetailOverlay
        image={selectedImageForOverlay}
        isOpen={!!selectedImageForOverlay}
        onClose={() => setSelectedImageForOverlay(null)}
        showInsertButton={false} // No insert button on this page
      />
    </div>
  );
}

export default withAdminAuth(AdminImagesPage);
