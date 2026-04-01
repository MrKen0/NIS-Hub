# Site Teardown: Podia Homepage

**URL:** https://www.podia.com/
**Built by:** Podia Labs, Inc. (in-house)
**Platform:** Custom server-rendered HTML/CSS stack (not Next.js, not WordPress — bespoke templating with Web Components for interactive elements)
**CMS:** Contentful (headless — all images and videos served from `images.ctfassets.net` and `videos.ctfassets.net`)
**Date analysed:** 2026-04-01

---

## Tech Stack (Confirmed from Source)

| Technology | Evidence | Purpose |
|---|---|---|
| Custom HTML templating | Bespoke BEM class naming, no React/Vue hydration markers | Server-rendered pages |
| Web Components | `<site-nav>`, `<homepage-hero>` custom elements in HTML | Interactive nav + hero behaviour |
| Contentful CMS | All image/video URLs at `ctfassets.net` / `ctfassets.net` | Content management |
| Single CSS bundle | `/static/css/screen.css` + per-module inline `<style>` blocks | Global + component styles |
| Single JS bundle | `/static/js-bundle/global.js` (deferred) | All interactions |
| Per-module CSS | Inline `<style>` tags in `<head>` for each component (homepageHero, textLockup, multicard, feature, siteNav, subnav) | Code-split styles, loaded only when component is present |
| Google Tag Manager | `GTM-WCLQZV4` | Analytics |
| RudderStack | `2uSe7EBDDMjfA1Stlq5Z7ascXtG` | Customer data platform |
| Segment | `uaHvNuhe8MPGJXVLZ4CqVGssDoxS6g1o` | Analytics |
| Rewardful | `31fc32` | Affiliate tracking |
| Ketch | `website_smart_tag` | Cookie consent |
| Sleeknote | `47085.js` | Pop-up/lead capture |
| ActiveCampaign | `diffuser-cdn.app-us1.com` | Marketing automation |
| AVIF + WebP images | `<picture>` with `<source type="image/avif">` then `<source type="image/webp">` fallback | Modern image formats with fallback |

**No GSAP, no Lenis, no Barba.js, no Framer Motion confirmed.** Animations are pure CSS with custom properties.

---

## Design System

### Colour Palette (confirmed from inline CSS)

| Token | Value | Usage |
|---|---|---|
| `--color-surface-background` | Varies by theme | Page/card backgrounds |
| `--color-surface-color` | Varies by theme | Text/icon colour |
| Near-black | `#06040E` | Dark theme background, default text |
| White | `#FFF` | Light backgrounds |
| Light gray | `#F5F5F5` | Neutral card/hover background |
| Mid gray | `#9C9C9C` | Hover state on black theme nav |
| Blue dark | `#10242F` | "theme-blue" background |
| Blue light | `#E1EDF2` | "theme-light-blue" background |
| Blue mid | `#A5C8D8` | Decorative shapes, card icon BG |
| Caramel dark | `#452623` | "theme-caramel" background |
| Caramel light | `#F6DDC4` | "theme-light-caramel" background |
| Caramel mid | `#E39A4D` | Decorative shapes |
| Violet dark | `#1F1738` | "theme-violet" background |
| Violet light | `#E5D7F5` | "theme-light-violet" background |
| Violet mid | `#CBB0EB` | Decorative shapes, card icon BG |

**Theme system:** Every section and component carries a `theme-*` class. CSS custom properties (`--color-surface-background`, `--color-surface-color`, etc.) are overridden at the component level. This lets the same card/button components render correctly on any background colour without per-component colour overrides.

### Typography (inferred from class names — font files not confirmed without CSS bundle)

| Class | Role | Properties confirmed |
|---|---|---|
| `type-headline-1` | H1 hero | Font size scales: `3.75rem` at 80em breakpoint confirmed |
| `type-headline-2` | Section headings | Used on all section titles |
| `type-body-1` | Body copy | Used in card bodies, feature descriptions |
| `type-body-2` | UI body / button text | Used in buttons, nav items |
| `type-eyebrow-1` | Small category label above headings | "Creator Stories", "Website", "Online Store" |
| `type-eyebrow-2` | Footer headings / subnav titles | "Products", "Platform" |
| `type-bullet-1` | List item text | Feature checklist |
| `type-ui-1` | UI labels | Skip nav, subnav links |

**Font rendering:** `text-wrap: balance` applied to `.textLockup__title` and `.textLockup__body` — this is a modern CSS property for balanced line breaks on headings.

**Letter-spacing:** Confirmed `-0.02em` on `.homepage-hero-card__title`.

### Spacing System

Uses CSS custom properties throughout:
- `--space-outer` — horizontal page margin
- `--space-outer-v` — vertical page margin
- `--space-gutter` — grid gutter
- `--space-gutter-v` — vertical grid gutter
- `--space-fixed-1` through `--space-fixed-5` — fixed pixel-equivalent steps
- `--space-1` through `--space-6` — fluid/responsive steps
- `--space-nav-height` — set to `3.5rem` (<450px) or `3.75rem` (≥450px) via `:root`

### Responsive Breakpoints (confirmed)

| Breakpoint | Value | Notes |
|---|---|---|
| Small | `37.5em` (600px) | Mobile/tablet split |
| Medium-small | `30.0625em` (481px) | Hero card overlap adjustments |
| Medium | `60em` (960px) | Desktop layout begins |
| Large | `80em` (1280px) | Wide desktop |
| XL | `90em` (1440px) | Max-width hero cards |
| XXL | `117em` (1872px) | Gallery/card max sizes |

### Grid

CSS Grid throughout. Classes like `grid--4up`, `grid--2up` suggest a utility-based column system. Hero cards use `grid-column: 1 / -1` on mobile stacking to a 3-column layout at 60em.

---

## Effects Breakdown

| Effect | Implementation | Complexity | Cloneable? |
|---|---|---|---|
| Hero card fan layout | CSS `rotate()`, `translateX()`, `translateY()` via custom properties per `nth-child` | Low | Yes |
| Hero card entrance animation | `@keyframes heroCardIn` — cards slide up from `translateY(100%)` on load | Low | Yes |
| Hero card hover flip | CSS `clip-path: circle()` expanding from top-center on hover. Two content layers stacked — default and hover. | Medium | Yes |
| Hero card hover lift | `--translate-y-hover` custom property set to negative value on `:hover` | Low | Yes |
| `animate-up` / `animate-up-children` | Custom attribute on elements — almost certainly IntersectionObserver in `global.js` adding a class. CSS handles the transition. | Low | Yes |
| `animate-delay` | Custom attribute with ms value — adds CSS animation delay | Low | Yes |
| Autoplay looping MP4 | `<video muted autoplay playsinline loop>` — no JS at all | None | Yes |
| Decorative SVG shapes | Static inline SVGs, 3 sets (small/medium/large) swapped via `display: none` at breakpoints | None | Yes |
| Mobile nav expansion | `aria-expanded` toggle on `<button>`, Web Component handles the state. CSS shows/hides `.siteNav__nav` based on `data-is-expanded` | Low | Yes |
| Dropdown subnav | `aria-expanded` on button, `.siteNav-subnav` shown via `data-is-expanded`. CSS handles display and `border-radius` clipping | Low | Yes |
| CTA banner geometric shapes | Layered inline SVGs with `--color-decoration-dark/base/light` tokens | None | Yes |
| Section dome shape | Class `section--dome`, `section--dome-top`, `section--dome-bottom` — inferred CSS `border-radius` or `clip-path` on section | Low | Yes |
| Gallery image hover | `.gallery-item__cta` overlay — inferred CSS transition on hover | Low | Yes |
| `btn--animated` | Class on CTA buttons — inferred subtle transform/colour transition | Low | Yes |

---

## Implementation Details

### Hero Card Hover Effect (Most Distinctive)

This looks complex but is entirely CSS. Each card has two stacked content layers:
- `.homepage-hero-card__content--default` — the normal view
- `.homepage-hero-card__content--hover` — the inverted-colour hover view

The reveal is done with `clip-path`:

```css
.homepage-hero-card__content--hover {
  --clip-radius: calc(var(--card-size) * 1.25);
  --clip-position: center calc(-1 * var(--clip-radius));  /* hidden above card */
  background-color: var(--color-surface-color);
  clip-path: circle(var(--clip-radius) at var(--clip-position));
  transition: clip-path 0.5s ease;
}

:where(.homepage-hero-card:focus-visible, .homepage-hero-card:hover)
  .homepage-hero-card__content--hover {
  --clip-position: center 0;  /* moves anchor to center of card, fully reveals */
}
```

The image inside the hover layer is inverted with `filter: invert(1)` to create a negative effect matching the inverted background.

**The reveal: a circle expanding from above the card into its center.** Pure CSS. No JS.

### Hero Card Fan / Stagger Layout

Cards are CSS Grid children all placed in `grid-row: 1` (overlapping). Position is set with `rotate()` and `translateX()` per card:

```css
/* Card 1 */
.homepage-hero-card:nth-child(1) {
  --rotate: -4deg;
  --translate-x: calc(-1 * var(--space-outer));
}
/* Card 3 */
.homepage-hero-card:nth-child(3) {
  --rotate: 4deg;
  --translate-x: var(--space-outer);
}
```

On desktop (60em+), cards spread horizontally in a proper 3-column layout. The overlapping fan effect is mobile-only.

### Hero Card Entrance Animation

```css
@keyframes heroCardIn {
  from {
    transform: rotate(0deg) translateX(var(--translate-x, 0)) translateY(100%);
  }
  to {
    transform: rotate(var(--rotate, 0deg)) translateX(var(--translate-x, 0)) translateY(var(--translate-y-total, 0));
  }
}

.homepage-hero-card {
  animation: heroCardIn 0.6s ease-in-out backwards;
  animation-delay: var(--intro-delay, 0s);
}
/* Card 1 delay: 0.3s, Card 3 delay: 0.5s */
```

Cards slide up from below the viewport in a staggered sequence. The `backwards` fill-mode keeps them hidden until the delay fires.

### Scroll Reveal (animate-up)

Custom attributes `animate-up` and `animate-up-children` are on nearly every section. This is almost certainly a small IntersectionObserver in `global.js` that:
1. Observes all `[animate-up]` elements
2. Adds a class (e.g. `is-visible`) when they enter the viewport
3. CSS handles the actual transition (opacity + translateY)

`animate-up-child` on child elements with `animate-delay` attribute creates staggered child reveals.

### Decorative Background Shapes

Three separate inline SVGs for small/medium/large screens. Contains blobs in the brand accent colours (violet `#CBB0EB`, blue `#A5C8D8`, caramel `#E39A4D`). Positioned absolutely within `.homepage-hero__decorations`, which sits behind the hero content at `z-index: 0`. No animation — purely decorative.

---

## Assets Needed to Recreate

1. **Podia wordmark SVG** — inline in the HTML, fully copyable. It is a custom SVG path, not a font.
2. **Hero card product images** — 3 screenshots from Contentful:
   - `online-store.png` (1120×766)
   - `website.png` (1120×766)
   - `email-marketing.png` (1120×766)
   - Substitute with your own product screenshots at same ratio
3. **Creator story card images** — 4 square portraits (832×832) from Contentful. Replace with client photos or illustrations.
4. **Feature section MP4 videos** — 3 looping screen recordings:
   - `website-animation.mp4`
   - `online-store-animation.mp4`
   - `email-animation.mp4`
   - Record your own product screen recordings at ~800×600, export as MP4 H.264
5. **Gallery screenshots** — 8 tall website screenshots (approx 1200×1500 cropped from top). Use Screely or a full-page screenshot tool.
6. **Decorative SVG shapes** — inline in the HTML, fully copyable. Just paste them in.
7. **Section dome shape** — CSS only, no asset needed.

---

## Build Plan

### Recommended Stack

- **Framework:** Astro or plain HTML/CSS. This site is server-rendered with no client-side framework. Astro is the closest modern equivalent.
- **Styling:** Vanilla CSS with custom properties. Do not use Tailwind — the design system is token-based and Tailwind's utility classes fight against that approach.
- **Animation:** CSS only (confirmed). No GSAP needed.
- **Video:** Native `<video>` tag with `muted autoplay playsinline loop`.
- **Components:** Web Components or Astro components for the nav and hero.

### NPM Packages (if using Astro)

```bash
npm create astro@latest
# No animation libraries needed
# Optional: @astrojs/image for responsive image handling
```

### Section-by-Section Build Order

**Section 1: Site Nav (`<site-nav>`)**
- Fixed position, `z-index: 600`
- Logo (inline SVG), nav links, CTA buttons
- Mobile: full-screen overlay on hamburger toggle
- Desktop: horizontal nav with dropdown submenu
- Key: `aria-expanded` state drives all show/hide via `data-is-expanded` attribute on nav and subnav. Use a Web Component or small JS class to handle toggle.
- Dropdown uses `position: absolute` from the nav item

**Section 2: Hero (`<homepage-hero>`)**
- Full-width, `theme-light-gray` background
- Decorative SVG shapes positioned absolutely behind content
- Text lockup (centred H1 + body + CTA)
- 3 cards in a CSS Grid, overlapping on mobile, spread on desktop
- Each card: clip-path hover effect (two stacked content layers)
- Entrance animation: `@keyframes heroCardIn` with staggered delay
- Build mobile-first: single column stack → fan at 600px → 3-column at 960px

**Section 3: Creator Stories (4-up card grid)**
- `grid--4up` — 4 equal columns on desktop, 2 on tablet, 1 on mobile (inferred)
- Each card: 1:1 image (`frame--1-1`), eyebrow label, title, body
- Cards carry individual `theme-*` class for colour
- animate-up-children for scroll reveal stagger

**Section 4–6: Feature Sections (×3)**
- Alternating media left / media right layout (`.feature__media--left` / `--right`)
- Media: `<video>` in a `.frame` container
- Content: eyebrow + H2 + body + text link CTA
- Grid: 12-column. Media spans 7 cols, content spans 4 cols at 960px+
- Each carries a `theme-*` class on the content block

**Section 7: Gallery**
- `theme-light-blue` background with dome top
- Two rows of 4 screenshot cards
- Each card: tall image with `f=top&fit=fill` crop, "View site" hover overlay
- animate-up-children for row-by-row reveal

**Section 8: Features List**
- Split layout: text left, 2-column checklist right
- `list--checkmark` — CSS `::before` pseudo-element checkmark icons
- `list--2up` — 2-column grid for list items

**Section 9: CTA Banner**
- `theme-blue`, dome top
- Centred headline + body + CTA button
- 4 decorative SVG shapes in foreground layer
- 4 more in background layer (all inline, copyable from source)

**Section 10: Footer**
- `theme-blue`
- Logo + 5-column nav grid + social links + legal links
- Simple — no JS, no animation

---

## Notes

- **No external animation library needed.** Everything visual is CSS custom properties + transitions + one `@keyframes`. This is the right call for a marketing site — fast, no JS overhead.
- **The clip-path card hover is the signature effect.** It is simple to implement once you understand the two-layer structure. The key insight: both layers are in the same grid cell (`grid-row: 1; grid-column: 1`), so they perfectly overlap.
- **The theme system is the real engineering.** Every component reads from `--color-surface-background` and `--color-surface-color`. Swap the theme class and the whole component re-colours. Build this system first before building any components.
- **Contentful image CDN params:** The site uses URL params like `?w=800&q=77&fm=avif` for on-the-fly image transformation. If you use Cloudinary or imgix you can replicate this. If not, just serve static resized images.
- **`prefers-reduced-motion`:** The card transitions and `heroCardIn` animation are gated with `@media (prefers-reduced-motion: no-preference)`. Build this in from the start.
- **Web Components for nav/hero:** The `<site-nav>` and `<homepage-hero>` custom elements manage their own state. This is a clean pattern — all the toggle logic lives in the component class, not in a global event listener soup. If not using Web Components, a small vanilla JS class per component achieves the same.
