"use client";

import { useState } from 'react';

interface ImageCarouselProps {
  imageUrls: string[];
  alt: string;
  /** Tailwind height class for the image frame, e.g. "h-64" or "h-36". Defaults to "h-56". */
  heightClass?: string;
  /**
   * How images fill the frame.
   * "cover"   — crops to fill (good for compact browse thumbnails).
   * "contain" — letterboxes on a dark background (good for detail pages where photo shapes vary).
   * Defaults to "cover".
   */
  fit?: 'cover' | 'contain';
}

/**
 * State-driven image carousel.
 * - Previous / next buttons (real <button> elements, aria-labelled, 44 × 44 px touch targets).
 * - Clickable dot indicators (aria-pressed, keyboard-focusable).
 * - Touch-swipe support (left = next, right = prev, threshold 40 px).
 * - stopPropagation on all controls — safe to embed inside a <Link> card.
 * - Returns null when imageUrls is empty; callers render their own fallback.
 */
export default function ImageCarousel({
  imageUrls,
  alt,
  heightClass = 'h-56',
  fit = 'cover',
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  if (imageUrls.length === 0) return null;

  const count = imageUrls.length;
  const hasMultiple = count > 1;

  function goPrev(e: React.MouseEvent) {
    e.stopPropagation();
    setCurrentIndex((i) => (i - 1 + count) % count);
  }

  function goNext(e: React.MouseEvent) {
    e.stopPropagation();
    setCurrentIndex((i) => (i + 1) % count);
  }

  function goTo(e: React.MouseEvent, idx: number) {
    e.stopPropagation();
    setCurrentIndex(idx);
  }

  function handleTouchStart(e: React.TouchEvent) {
    setTouchStartX(e.touches[0].clientX);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 40) {
      delta < 0
        ? setCurrentIndex((i) => (i + 1) % count)
        : setCurrentIndex((i) => (i - 1 + count) % count);
    }
    setTouchStartX(null);
  }

  const imgFitClass = fit === 'contain' ? 'object-contain' : 'object-cover';
  const bgClass     = fit === 'contain' ? 'bg-slate-900'   : 'bg-slate-100';

  return (
    <div className="relative w-full select-none">
      {/* ── Image frame ──────────────────────────────────────────────────────── */}
      <div
        className={`${heightClass} ${bgClass} w-full overflow-hidden relative`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrls[currentIndex]}
          alt={hasMultiple ? `${alt} – ${currentIndex + 1} of ${count}` : alt}
          className={`w-full h-full ${imgFitClass}`}
          loading="eager"
          draggable={false}
        />

        {/* ── Prev / Next buttons ─────────────────────────────────────────── */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <svg
                width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="3"
                strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <svg
                width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="3"
                strokeLinecap="round" strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}

        {/* ── Dot indicators — overlaid at bottom with gradient ────────────── */}
        {hasMultiple && (
          <div
            role="group"
            aria-label="Image navigation"
            className="absolute bottom-0 left-0 right-0 flex justify-center gap-2 pb-2.5 pt-8 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"
          >
            {imageUrls.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => goTo(e, idx)}
                aria-label={`Image ${idx + 1} of ${count}`}
                aria-pressed={idx === currentIndex}
                className={[
                  'pointer-events-auto w-2 h-2 rounded-full transition-colors',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-1',
                  idx === currentIndex
                    ? 'bg-white'
                    : 'bg-white/40 hover:bg-white/70',
                ].join(' ')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
