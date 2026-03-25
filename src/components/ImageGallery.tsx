'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  mainImage: string | null;
  previewImages: string[];
  productName: string;
}

export default function ImageGallery({ mainImage, previewImages, productName }: ImageGalleryProps) {
  const allImages = [...(mainImage ? [mainImage] : []), ...previewImages];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!lightboxOpen) return;
    if (e.key === 'Escape') setLightboxOpen(false);
    if (e.key === 'ArrowLeft') setSelectedIndex((p) => (p > 0 ? p - 1 : allImages.length - 1));
    if (e.key === 'ArrowRight') setSelectedIndex((p) => (p < allImages.length - 1 ? p + 1 : 0));
  }, [lightboxOpen, allImages.length]);

  useEffect(() => { document.addEventListener('keydown', handleKeyDown); return () => document.removeEventListener('keydown', handleKeyDown); }, [handleKeyDown]);
  useEffect(() => { document.body.style.overflow = lightboxOpen ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [lightboxOpen]);

  if (allImages.length === 0) return null;
  const currentImage = allImages[selectedIndex] || allImages[0];

  return (
    <>
      <div className="mb-4">
        <button onClick={() => setLightboxOpen(true)} className="relative w-full aspect-video rounded-2xl overflow-hidden glass cursor-zoom-in group focus-glow" aria-label={`View ${productName} image in full size`}>
          <Image src={currentImage} alt={productName} fill className="object-cover group-hover:scale-[1.02] transition-transform duration-500" sizes="(max-width: 1024px) 100vw, 66vw" priority />
        </button>
      </div>
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {allImages.map((url, i) => (
            <button key={i} onClick={() => setSelectedIndex(i)} className={`relative w-20 h-14 shrink-0 rounded-lg overflow-hidden transition-all duration-200 focus-glow ${i === selectedIndex ? 'ring-2 ring-indigo-500 opacity-100' : 'opacity-50 hover:opacity-80 border border-white/[0.06]'}`} aria-label={`View image ${i + 1}`}>
              <Image src={url} alt={`${productName} thumbnail ${i + 1}`} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={() => setLightboxOpen(false)} role="dialog" aria-modal="true" aria-label="Image lightbox">
          <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 z-10 p-2 rounded-full glass hover:bg-white/10 transition-colors focus-glow" aria-label="Close lightbox"><X className="w-6 h-6 text-white" aria-hidden="true" /></button>
          {allImages.length > 1 && (<>
            <button onClick={(e) => { e.stopPropagation(); setSelectedIndex((p) => (p > 0 ? p - 1 : allImages.length - 1)); }} className="absolute left-4 z-10 p-3 rounded-full glass hover:bg-white/10 transition-colors focus-glow" aria-label="Previous image"><ChevronLeft className="w-6 h-6 text-white" aria-hidden="true" /></button>
            <button onClick={(e) => { e.stopPropagation(); setSelectedIndex((p) => (p < allImages.length - 1 ? p + 1 : 0)); }} className="absolute right-4 z-10 p-3 rounded-full glass hover:bg-white/10 transition-colors focus-glow" aria-label="Next image"><ChevronRight className="w-6 h-6 text-white" aria-hidden="true" /></button>
          </>)}
          <div className="relative w-full max-w-5xl max-h-[85vh] mx-4 aspect-video" onClick={(e) => e.stopPropagation()}>
            <Image src={currentImage} alt={`${productName} - image ${selectedIndex + 1}`} fill className="object-contain" sizes="100vw" priority />
          </div>
          {allImages.length > 1 && (<div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-zinc-400 glass px-4 py-2 rounded-full">{selectedIndex + 1} / {allImages.length}</div>)}
        </div>
      )}
    </>
  );
}
