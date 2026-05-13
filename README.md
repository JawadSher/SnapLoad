# SnapLoad

SnapLoad is a polished Next.js App Router project for a video and audio downloader product. It presents a modern landing experience, themed UI, responsive downloader panels, and route-specific pages for popular platforms such as YouTube, TikTok, Instagram, Facebook, and music downloads.

The current codebase is designed as a showcase-ready frontend with a strong product feel. It includes a theme toggle, scroll-based reveal animations, a structured download queue, and platform-specific pages that demonstrate the user flow end to end.

## What This Project Includes

- Next.js 16 App Router architecture
- Global light and dark theme toggle with persistence
- Animated hero section and scroll reveal effects
- Responsive landing page with product-style sections
- Mock downloader flow with queue, quality, and format controls
- Dedicated pages for major supported platforms
- Reusable UI primitives built with Tailwind CSS

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Lucide icons

## Project Structure

- `app/` - App Router entry points, routes, and global layout
- `components/home/` - Home page sections and showcase content
- `components/layout/` - Navbar, footer, and theme toggle
- `components/downloader/` - Downloader controls, queue, cards, and selectors
- `components/ui/` - Small reusable UI primitives
- `lib/` - Shared utilities
- `types/` - Shared TypeScript types
- `public/` - Static assets

## Main Routes

- `/` - Landing page and product showcase
- `/youtube-video-downloader`
- `/tiktok-downloader`
- `/instagram-downloader`
- `/facebook-video-downloader`
- `/music-downloader`

## Key Features

### Theme System

SnapLoad supports both light and dark mode. The choice is stored in `localStorage` and applied on load, so returning visitors keep their preferred look.

### Motion and Polish

The interface uses subtle entry animations, hover lift effects, and reveal-on-scroll behavior to make the page feel more alive without becoming noisy.

### Downloader Experience

The downloader UI includes:

- Single URL input
- Bulk URL input
- Quality selector
- Format selector
- Live queue cards with progress states
- Platform detection UI

### Showcase Sections

The homepage includes:

- Hero section
- Trust strip
- Supported platforms grid
- Step-by-step how-it-works section
- Feature highlights
- Product showcase band
- FAQ section

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Available Scripts

- `npm run dev` - Start the local development server
- `npm run build` - Create a production build
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint

## Build Notes

The project currently uses mocked downloader behavior in the UI. That means:

- URLs are detected on the client
- download cards are simulated for presentation
- the queue and progress states are visualized in the interface

This keeps the experience realistic for showcasing the product while leaving room for a real backend or media extraction service later.

## Design Notes

The UI is intentionally clean, dense, and product-focused. It uses:

- restrained spacing
- small motion cues
- soft shadows
- bordered cards and panels
- theme-aware surfaces
- readable information hierarchy

## Deployment

The app is ready for deployment on any Next.js-compatible hosting platform. A production build can be verified with:

```bash
npm run build
```

## License

Add your preferred license here if the project is going public.
