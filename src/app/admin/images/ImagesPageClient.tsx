"use client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import withAdminAuth from '@/components/withAdminAuth';

function AdminImagesPage() {
  // TODO: Add logic to fetch and display images from Firebase Storage
  // TODO: Add logic for handling image uploads (including name conflict adjustment)
  // TODO: Add logic for handling image deletion

  // Placeholder for image data - this will be replaced by actual data fetching
  const images: { id: string; name: string; url: string; uploadDate: string }[] = [
    // Example image structure - adapt as needed
    // { id: "img1", name: "image1.jpg", url: "/placeholder-image.png", uploadDate: "2024-01-01" },
    // { id: "img2", name: "image2.png", url: "/placeholder-image.png", uploadDate: "2024-01-02" },
  ];

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">画像管理</h1>
        {/* TODO: Implement image upload functionality (e.g., via a dialog or a dedicated input triggered by this button) */}
        <Button>
          {/* <UploadCloud className="mr-2 h-4 w-4" />  Optional: Add icon if desired */}
          画像を追加
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-220px)] w-full rounded-md border p-4">
        {images.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-lg text-gray-500">アップロードした画像はここに表示されます。</p>
            <p className="text-sm text-gray-400 mt-2">「画像を追加」を押して、最初の画像をアップロード。</p>
          </div>
        )}
        {/* Placeholder for how images might be listed - detailed implementation later */}
        {/* <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group border rounded-lg overflow-hidden">
              <img 
                src={image.url} 
                alt={image.name} 
                className="w-full h-32 object-cover rounded-md transition-transform duration-300 ease-in-out group-hover:scale-105" 
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out">
                <p className="text-xs truncate" title={image.name}>{image.name}</p>
                <p className="text-xxs text-gray-300">{image.uploadDate}</p>
              </div>
              // TODO: Implement delete button logic for each image
              // <Button 
              //   variant="destructive" 
              //   size="icon" 
              //   className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"
              //   onClick={() => console.log('Delete image:', image.id)} // Replace with actual delete handler
              // >
              //   <Trash2 className="h-4 w-4" />
              // </Button>
            </div>
          ))}
        </div> */}
      </ScrollArea>
    </div>
  );
}

export default withAdminAuth(AdminImagesPage);
