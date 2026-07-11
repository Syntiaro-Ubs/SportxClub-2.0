# SportXClub – Asset Pack

## What's inside

This pack gives you the **exact folder structure and filenames** your React + Vite + Tailwind
project needs, ready to `import` right now.

### ✅ Production-ready (real, hand-built vector assets)
All `.svg` files are genuine, usable assets — logo, 22 UI icons, 4 "Why Us" feature icons,
3 decorative patterns, badges, store buttons, quote icon. Use these as-is.

### 🟡 Placeholder (correct size/ratio/name, but NOT real photos)
I don't have a photorealistic image generator in this environment, so every photographic
asset (stadium, player, venues, sports categories, tournament covers, testimonial headshots)
is a labeled placeholder at the **exact pixel dimensions** you'll need. This lets you wire up
your whole layout today with zero broken imports, then drop in real photos later without
touching any code — just overwrite the same filename.

## How to replace placeholders with real photos

Use the AI prompts below in Midjourney / DALL·E 3 / Adobe Firefly / Leonardo, then export at
the matching size and **save with the exact same filename** (overwrite in place).

| File | Size | Prompt |
|---|---|---|
| `hero/stadium-bg.webp` | 1920×1080 | Cinematic night football stadium, empty green pitch, dramatic floodlights, dark moody teal-green color grade, wide-angle, photorealistic, 8k |
| `hero/stadium-bg-mobile.webp` | 1080×1920 | Same as above, vertical crop |
| `hero/football-player.png` | 1200×1600 (transparent) | Professional football player, athletic build, dark green/black jersey, confident pose, arms crossed, studio lighting, transparent background, photorealistic, 4k |
| `sports/cat-football.webp` | 600×600 | Close-up football being kicked, stadium lights bokeh, dark vignette, moody green-black tone, photorealistic |
| `sports/cat-cricket.webp` | 600×600 | Cricket bat hitting ball close-up, floodlight bokeh, dark dramatic tone, photorealistic |
| `sports/cat-badminton.webp` | 600×600 | Badminton racket + shuttlecock mid-air, dark indoor court lighting, photorealistic |
| `sports/cat-tennis.webp` | 600×600 | Tennis racket hitting ball close-up, stadium lights, dark dramatic tone |
| `sports/cat-basketball.webp` | 600×600 | Basketball mid-dunk close-up, indoor arena lights, dark moody tone |
| `sports/cat-swimming.webp` | 600×600 | Swimmer diving into pool, dramatic underwater light rays, dark blue-green tone |
| `sports/cat-boxmma.webp` | 600×600 | Boxing gloves close-up under gym spotlight, dark dramatic tone |
| `sports/cat-padel.webp` | 600×600 | Padel racket and ball close-up, court lights, dark moody tone |
| `venues/turf-1.webp`…`turf-6.webp` | 800×600 | Premium 5-a-side football turf, evening floodlights, aerial 3/4 angle, clean synthetic grass, modern facility, photorealistic (swap "football turf" for badminton/tennis/basketball/pool/MMA gym per card) |
| `tournaments/tournament-1/2/3-cover.webp` | 500×300 | Football tournament banner, golden trophy on pedestal, blurred crowd, dark green-black dramatic lighting, cinematic |
| `tournaments/cta-bg.webp` | 1600×600 | Wide cinematic stadium crowd silhouette at night, green spotlight beams through fog, dark dramatic atmosphere |
| `tournaments/trophy-3d.png` | 800×800 (transparent) | 3D rendered golden trophy cup, glossy reflective, green accent lighting, transparent background, studio render |
| `testimonials/user-1.webp`…`user-4.webp` | 200×200 | Professional headshot, young athletic person, casual sportswear, soft studio lighting, neutral dark grey background, photorealistic |
| `misc/og-image.jpg` | 1200×630 | Combine final hero stadium image + logo + tagline for social preview |

## Folder map

```
public/assets/
├── hero/        → Hero section background + player cutout
├── icons/       → Navbar, search bar, ratings, amenities, social
├── sports/      → Popular Sports category cards
├── venues/      → Featured Venues cards
├── tournaments/ → Tournament sidebar + CTA section
├── stats/       → Stats row background pattern
├── why-us/      → Why SportXClub feature icons
├── testimonials/→ Testimonial avatars + quote icon
├── footer/      → Footer pattern + app store badges
└── misc/        → OG image, favicon
```

## Usage in code (Vite/Tailwind)

```jsx
import stadiumBg from "/assets/hero/stadium-bg.webp";
// or reference directly since it's in /public:
<img src="/assets/hero/stadium-bg.webp" alt="Stadium" />
```

Files in `/public` are served as-is from the root — no import needed, just use the `/assets/...` path.
