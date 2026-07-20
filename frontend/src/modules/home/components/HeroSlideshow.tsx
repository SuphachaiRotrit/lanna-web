'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Banner } from '@/types';

const AUTO_ROTATE_MS = 5000;

interface HeroSlideshowProps {
  banners: Banner[];
}

export const HeroSlideshow = ({ banners }: HeroSlideshowProps) => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(timer);
  }, [banners.length, isPaused]);

  const goTo = (i: number) => setIndex((i + banners.length) % banners.length);

  return (
    <div
      className="relative w-full aspect-[16/9] max-h-[600px] overflow-hidden bg-navy/5"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {banners.map((banner, i) => {
        const slide = (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={banner.imageUrl}
            alt={banner.title || 'banner'}
            className="w-full h-full object-cover"
          />
        );
        return (
          <div
            key={banner.id}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? 'auto' : 'none' }}
          >
            {banner.linkUrl ? (
              <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                {slide}
              </a>
            ) : slide}
          </div>
        );
      })}

      {banners.length > 1 && (
        <>
          <button
            onClick={() => goTo(index - 1)}
            aria-label="ก่อนหน้า"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-md transition-all"
          >
            <ChevronLeft size={20} className="text-navy" />
          </button>
          <button
            onClick={() => goTo(index + 1)}
            aria-label="ถัดไป"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-md transition-all"
          >
            <ChevronRight size={20} className="text-navy" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`สไลด์ที่ ${i + 1}`}
                className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
