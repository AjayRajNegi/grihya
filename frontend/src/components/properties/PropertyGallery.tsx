import React, { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, ImageIcon } from "lucide-react";

interface PropertyGalleryProps {
  images: string[];
  title: string;
  onImageClick?: (image: string) => void;
}

const PropertyGallery: React.FC<PropertyGalleryProps> = ({
  images,
  title,
  onImageClick,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-200 h-64 flex items-center justify-center rounded-lg">
        <ImageIcon className="h-12 w-12 text-gray-400" />
        <p className="ml-2 text-gray-500">No images available</p>
      </div>
    );
  }

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    if (onImageClick) {
      onImageClick(images[index]);
    }
  };

  return (
    <div className="relative">
      {/* Main image */}
      <div className="relative h-64 md:h-96 overflow-hidden rounded-lg bg-gray-200">
        <img
          src={images[currentIndex]}
          alt={`${title} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => onImageClick?.(images[currentIndex])}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/1200x800?text=No+Image";
          }}
        />
        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 focus:outline-none"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 focus:outline-none"
              aria-label="Next image"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
            {/* Image counter */}
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 text-sm rounded">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
      {/* Thumbnail preview */}
      {images.length > 1 && (
        <div className="hidden md:flex space-x-2 mt-4 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 h-16 w-16 rounded-md overflow-hidden border-2 focus:outline-none ${
                index === currentIndex
                  ? "border-[#2AB09C]"
                  : "border-transparent"
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/100x100?text=No+Image";
                }}
              />
            </button>
          ))}
        </div>
      )}
      {/* Mobile image indicators */}
      {images.length > 1 && (
        <div className="flex justify-center space-x-2 mt-4 md:hidden">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 w-2 rounded-full focus:outline-none ${
                index === currentIndex ? "bg-[#2AB09C]" : "bg-gray-300"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyGallery;
