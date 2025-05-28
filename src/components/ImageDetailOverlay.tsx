import Image from "next/image";
import { Button } from "@/components/ui/button";

// Define the ImageInfo interface (can be moved to a shared types file later)
export interface ImageInfo {
  url: string;
  name: string;
  refPath: string; // Keep refPath if needed for other operations, though not used in this component directly
}

interface ImageDetailOverlayProps {
  image: ImageInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onInsert?: (image: ImageInfo) => void; // Optional: only if showInsertButton is true
  showInsertButton: boolean;
}

const ImageDetailOverlay: React.FC<ImageDetailOverlayProps> = ({
  image,
  isOpen,
  onClose,
  onInsert,
  showInsertButton,
}) => {
  if (!isOpen || !image) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
      <div className="bg-background p-6 rounded-lg shadow-xl max-w-md w-full transform transition-all duration-300 ease-in-out scale-100">
        <h3 className="text-xl font-semibold mb-4 text-foreground">画像の詳細</h3>
        <p className="mb-1 text-sm text-muted-foreground">ファイル名:</p>
        <p className="mb-4 text-sm text-foreground break-all">{image.name}</p>
        <div className="mb-6 rounded-md overflow-hidden border border-border">
          <Image
            src={image.url}
            alt={image.name}
            width={400}
            height={300}
            className="w-full h-auto object-contain max-h-72" // Increased max-h for better view
          />
        </div>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            閉じる
          </Button>
          {showInsertButton && onInsert && (
            <Button
              onClick={() => {
                onInsert(image);
                onClose(); // Typically close overlay after insert
              }}
            >
              投稿に挿入
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageDetailOverlay;
