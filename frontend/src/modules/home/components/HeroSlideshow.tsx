'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Banner } from '@/types';

const AUTO_ROTATE_MS = 5000;
const SWIPE_THRESHOLD_PX = 40;

interface HeroSlideshowProps {
  banners: Banner[];
}

export const HeroSlideshow = ({ banners }: HeroSlideshowProps) => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(timer);
  }, [banners.length, isPaused]);

  const goTo = (i: number) => setIndex((i + banners.length) % banners.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    goTo(delta > 0 ? index - 1 : index + 1);
  };

  return (
    <div
      className="group relative w-full aspect-[21/9] min-h-[200px] max-h-[440px] overflow-hidden rounded-[2rem] border border-navy/5 shadow-brand-sm bg-navy/5"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {banners.map((banner, i) => {
        const slide = (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={banner.imageUrl}
            alt={banner.title || 'banner'}
            className="w-full h-full object-contain"
          />
        );
        return (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-all duration-[900ms] ease-out ${i === index ? 'scale-100' : 'scale-[1.04]'}`}
            style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? 'auto' : 'none' }}
          >
            {banner.linkUrl ? (
              <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                {slide}
              </a>
            ) : slide}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent pointer-events-none" />
          </div>
        );
      })}

      {banners.length > 1 && (
        <>
          <button
            onClick={() => goTo(index - 1)}
            aria-label="ก่อนหน้า"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur hover:bg-white flex items-center justify-center shadow-md transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
          >
            <ChevronLeft size={18} className="text-navy" />
          </button>
          <button
            onClick={() => goTo(index + 1)}
            aria-label="ถัดไป"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur hover:bg-white flex items-center justify-center shadow-md transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
          >
            <ChevronRight size={18} className="text-navy" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`สไลด์ที่ ${i + 1}`}
                className="relative h-1 w-8 rounded-full bg-white/35 overflow-hidden"
              >
                {i === index && (
                  <span
                    key={index}
                    className="absolute inset-y-0 left-0 bg-white rounded-full"
                    style={{
                      animationName: 'progress-fill',
                      animationDuration: `${AUTO_ROTATE_MS}ms`,
                      animationTimingFunction: 'linear',
                      animationFillMode: 'forwards',
                      animationPlayState: isPaused ? 'paused' : 'running',
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
