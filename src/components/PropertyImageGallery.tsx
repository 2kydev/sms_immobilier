
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface PropertyImageGalleryProps {
  images: string[];
  propertyTitle: string;
  onImageClick?: (index: number) => void;
}

const PropertyImageGallery: React.FC<PropertyImageGalleryProps> = ({ 
  images, 
  propertyTitle,
  onImageClick 
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
    onImageClick?.(index);
  };

  const closeImageModal = () => {
    setSelectedImageIndex(null);
  };

  const goToPrevious = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    } else if (selectedImageIndex === 0) {
      setSelectedImageIndex(images.length - 1);
    }
  };

  const goToNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImageIndex !== null && selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    } else if (selectedImageIndex === images.length - 1) {
      setSelectedImageIndex(0);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (selectedImageIndex === null) return;
    
    if (event.key === 'ArrowLeft') {
      goToPrevious();
    } else if (event.key === 'ArrowRight') {
      goToNext();
    } else if (event.key === 'Escape') {
      closeImageModal();
    }
  };

  React.useEffect(() => {
    if (selectedImageIndex !== null) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedImageIndex]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">Aucune image disponible</span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="relative">
        <img
          src={images[0]}
          alt={propertyTitle}
          className="w-full h-40 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          loading="lazy"
          onClick={() => openImageModal(0)}
          onError={(e) => {
            console.error('Image failed to load:', images[0]);
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        
        {selectedImageIndex !== null && (
          <Dialog open={true} onOpenChange={closeImageModal}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0">
              <DialogHeader className="absolute top-4 right-4 z-10">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={closeImageModal}
                  className="bg-black/50 border-white/20 text-white hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogHeader>
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                <img
                  src={images[selectedImageIndex]}
                  alt={`${propertyTitle} - Image ${selectedImageIndex + 1}`}
                  className="max-w-full max-h-[80vh] object-contain"
                  onError={(e) => {
                    console.error('Image failed to load in modal:', images[selectedImageIndex]);
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <Carousel className="w-full" opts={{ loop: true }}>
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <img
                src={image}
                alt={`${propertyTitle} - Image ${index + 1}`}
                className="w-full h-40 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                loading="lazy"
                onClick={() => openImageModal(index)}
                onError={(e) => {
                  console.error('Image failed to load:', image);
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious 
          className="left-2 bg-white/80 hover:bg-white" 
          onClick={(e) => e.stopPropagation()}
        />
        <CarouselNext 
          className="right-2 bg-white/80 hover:bg-white"
          onClick={(e) => e.stopPropagation()}
        />
      </Carousel>
      
      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
        {images.length} photos
      </div>

      {selectedImageIndex !== null && (
        <Dialog open={true} onOpenChange={closeImageModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <DialogHeader className="absolute top-4 right-4 z-10">
              <Button
                variant="outline"
                size="icon"
                onClick={closeImageModal}
                className="bg-black/50 border-white/20 text-white hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src={images[selectedImageIndex]}
                alt={`${propertyTitle} - Image ${selectedImageIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain"
                onError={(e) => {
                  console.error('Image failed to load in modal:', images[selectedImageIndex]);
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              
              <Button
                variant="outline"
                size="icon"
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 border-white/20 text-white hover:bg-black/70"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 border-white/20 text-white hover:bg-black/70"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded">
                {selectedImageIndex + 1} / {images.length}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PropertyImageGallery;
