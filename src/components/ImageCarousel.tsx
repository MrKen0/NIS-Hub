"use client";

interface ImageCarouselProps {
  imageUrls: string[];
  alt: string;
  /**
   * Tailwind height class applied to the scroll container.
   * E.g. "h-36" for featured cards, "h-64" for detail pages.
   * Defaults to "h-56".
   */
  heightClass?: string;
}

/**
 * CSS scroll-snap horizontal image carousel.
 * No library dependency — uses native touch/pointer scroll + scroll-snap.
 * Returns null when imageUrls is empty; callers should render their own fallback.
 */
export default function ImageCarousel({
  imageUrls,
  alt,
  heightClass = 'h-56',
}: ImageCarouselProps) {
  if (imageUrls.length === 0) return null;

  return (
    <div className="relative w-full">
      {/* Scrollable strip ─────────────────────────────────────────────────── */}
      <div
        className={`${heightClass} flex w-full overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden`}
        style={{ scrollbarWidth: 'none' }}
      >
        {imageUrls.map((url, idx) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={idx}
            src={url}
            alt={idx === 0 ? alt : `${alt} – photo ${idx + 1}`}
            className="snap-start shrink-0 w-full h-full object-cover"
            loading={idx === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>

      {/* Static dot indicators — only shown when there is more than one image */}
      {imageUrls.length > 1 && (
        <div
          className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 pointer-events-none"
          aria-hidden="true"
        >
          {imageUrls.map((_, idx) => (
            <span
              key={idx}
              className="block w-1.5 h-1.5 rounded-full bg-white/80 shadow-sm"
            />
          ))}
        </div>
      )}
    </div>
  );
}
