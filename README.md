# 🍽️ Recipes PWA

A production-ready Progressive Web App (PWA) for browsing and saving favorite recipes. Built with React + Vite, Tailwind CSS, shadcn/ui, and a secure Node.js/Express backend.

## ✨ Features

- **🔍 Search & Browse**: Search recipes by name or filter by category
- **❤️ Save Favorites**: Add recipes to offline-accessible favorites
- **📱 PWA**: Fully installable app with service worker, offline support, and app manifest
- **🌙 Dark Mode**: Light/dark theme toggle with persistent preference
- **⚡ Fast**: Built with Vite for instant HMR and optimized builds
- **🎨 Beautiful UI**: Tailwind CSS + shadcn/ui component library
- **♿ Accessible**: Keyboard navigation, ARIA labels, semantic HTML
- **🔐 Secure**: Backend proxy hides TheMealDB API key from client
- **📊 Caching**: Smart service worker caching strategies (network-first, stale-while-revalidate)
- **💾 Offline**: IndexedDB persistence for favorites, works fully offline
- **📡 Real-time**: React Query for smart data fetching and cache management

## 🏗️ Project Structure

```
Recipes/
├── server/                          # Node.js/Express backend
│   ├── .env.example                 # Environment variables template
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                 # Express app & middleware setup
│       └── routes/
│           └── mealdb.ts            # TheMealDB proxy endpoints
│
├── client/                          # React + Vite frontend
│   ├── index.html
│   ├── vite.config.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.cjs
│   ├── postcss.config.cjs
│   ├── public/
│   │   ├── manifest.webmanifest     # PWA manifest
│   │   ├── offline.html             # Offline fallback
│   │   ├── sw.js                    # Service Worker
│   │   └── icons/                   # App icons (replace with real PNGs)
│   └── src/
│       ├── main.tsx                 # App entry
│       ├── App.tsx                  # Root component
│       ├── App.css
│       ├── components/
│       │   ├── Header.tsx           # App header with search & theme
│       │   └── ui/                  # shadcn/ui components
│       │       ├── button.tsx
│       │       ├── card.tsx
│       │       ├── input.tsx
│       │       └── skeleton.tsx
│       ├── pages/
│       │   ├── Home.tsx             # Search & browse
│       │   ├── Details.tsx          # Recipe details
│       │   └── Favorites.tsx        # Saved recipes (offline)
│       ├── lib/
│       │   ├── api.ts               # API client (proxy endpoints)
│       │   ├── queryClient.ts       # React Query setup
│       │   └── utils.ts             # Helper functions
│       ├── features/
│       │   └── favorites/
│       │       └── db.ts            # IndexedDB helpers
│       └── styles/
│           └── globals.css          # Tailwind + theme CSS
│
└── README.md                        # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Git

### Setup

#### 1. Clone & Navigate

```bash
cd /workspaces/Recipes
```

#### 2. Server Setup

```bash
cd server

# Copy and configure environment variables
cp .env.example .env

# Default values are:
# MEALDB_API_BASE=https://www.themealdb.com/api/json/v1
# MEALDB_API_KEY=1
# PORT=5174

# Install dependencies
npm install

# Run development server
npm run dev
```

Server runs on `http://localhost:5174`

#### 3. Client Setup

In a new terminal:

```bash
cd client

# Install dependencies
npm install

# Run development server
npm run dev
```

Client runs on `http://localhost:5173`

#### 4. Access the App

Open browser to `http://localhost:5173`

## 📦 Environment Variables

### Server (.env)

```bash
# TheMealDB API Configuration
MEALDB_API_BASE=https://www.themealdb.com/api/json/v1
MEALDB_API_KEY=1

# Server Configuration
PORT=5174
NODE_ENV=development

# Caching (seconds)
CACHE_TTL=3600
```

The `MEALDB_API_KEY` is **never** exposed to the client — all requests go through the `/api/*` proxy.

## 🎨 Shadcn/ui Setup

The project comes with pre-configured shadcn/ui components. If you need to add more components:

```bash
cd client

# Install a component (e.g., dialog)
npx shadcn-ui@latest add dialog

# This will:
# 1. Add component to src/components/ui/
# 2. Update dependencies if needed
```

**Pre-installed components:**
- Button
- Card
- Input
- Skeleton
- (Toast/Sonner is installed separately)

## 🔌 API Endpoints

All client requests go through `/api/*` — the server proxies to TheMealDB.

### Available Routes

```
GET  /api/search?s={query}          # Search meals by name
GET  /api/meal/{id}                 # Get meal details
GET  /api/categories                # List all categories (cached)
GET  /api/filter?c={category}       # Filter by category
GET  /api/random                    # Get random meal
GET  /health                        # Server health check
```

**Example:**

```javascript
// Client code
const response = await fetch("/api/search?s=pasta");
const data = await response.json();
```

**Server proxy:**

```typescript
// Behind the scenes
fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=pasta`)
```

## 📱 PWA Features

### Service Worker

The app includes a manual service worker (`public/sw.js`) with:

- **Precaching**: App shell + static assets cached on install
- **Network-First**: API calls and documents use network with cache fallback
- **Stale-While-Revalidate**: Images update in background
- **Offline Fallback**: Shows `/offline.html` when network unavailable

**Caching strategies:**

| Resource | Strategy | TTL |
|----------|----------|-----|
| API calls | Network-First | 1 hour (server header) |
| Images | Stale-While-Revalidate | 24 hours |
| JS/CSS | Cache-First | 1 version |
| HTML | Network-First | 1 hour |

### App Manifest

`public/manifest.webmanifest` defines:
- App name & icon
- Standalone display (launches like native app)
- Theme colors
- App shortcuts (Favorites)

### Installation

1. Open app in browser
2. Click "Install" (iOS: Share → Add to Home Screen)
3. App opens full-screen, works offline

### Offline Support

- ✅ View saved favorites
- ✅ Add/remove from favorites
- ✅ Precached app shell loads
- ✅ Toast shows offline status
- ✅ Sync when online

## 💾 IndexedDB: Offline Favorites

Favorites persist in IndexedDB (not lost on page refresh):

```typescript
// Save a favorite
import { saveFavorite } from "@/features/favorites/db";
await saveFavorite(mealData);

// Get all favorites
import { getAllFavorites } from "@/features/favorites/db";
const meals = await getAllFavorites();

// Remove favorite
import { removeFavorite } from "@/features/favorites/db";
await removeFavorite(mealId);

// Check if favorited
import { isFavorited } from "@/features/favorites/db";
const isFav = await isFavorited(mealId);
```

**Database:**
- Store: `favorites`
- Key: `meal.idMeal`
- Index: `by-date`

## 🎯 Key Implementations

### React Query Caching

```typescript
// Automatically cached, stale in 5min, garbage collected after 10min
const { data: meals } = useQuery({
  queryKey: ["meals", searchQuery],
  queryFn: () => searchMeals(searchQuery),
});
```

### Service Worker Registration

Automatically registered in `index.html`:

```html
<script>
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
  }
</script>
```

### Theme Toggle

Click theme button (moon/sun) to toggle dark mode. Persists to localStorage.

### Accessibility Features

- ✅ Semantic HTML (`<header>`, `<main>`, `<nav>`)
- ✅ ARIA labels on buttons
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Focus outlines visible
- ✅ Alt text on images
- ✅ Color contrast compliant

## 🧪 Testing the App

### Test Search

1. Home page, enter "pasta" → See results
2. Click a recipe → View details
3. Click heart → Add to favorites
4. Refresh → Favorite persists (IndexedDB)

### Test Offline

1. DevTools → Network → "Offline"
2. Refresh → App still loads (service worker)
3. Can view & manage favorites
4. Online status badge shows
5. DevTools → Network → "Online"
6. Toast shows "You're back online"

### Test PWA Installation

1. DevTools → Application → Manifest
2. Click "Install" or go to address bar
3. App launches full-screen
4. Works offline with cached assets

### Test Dark Mode

1. Click moon icon (header)
2. Dark theme applies
3. Refresh → Preference persists

## 🚢 Deployment

### Backend (Node.js Server)

**Render.com (recommended):**

1. Push code to GitHub
2. Create Render Web Service
3. Set environment variables (`.env`)
4. Deploy

**Environment for Render:**
```bash
MEALDB_API_BASE=https://www.themealdb.com/api/json/v1
MEALDB_API_KEY=1
PORT=5174
NODE_ENV=production
```

**Build command:**
```bash
npm install && npm run build
```

**Start command:**
```bash
npm run start
```

### Frontend (Vite Client)

**Netlify (recommended):**

1. Push `client/` to GitHub
2. Create Netlify site from Git
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Set environment variables
6. Configure proxy to backend

**netlify.toml:**
```toml
[[redirects]]
from = "/api/*"
to = "https://your-render-api.onrender.com/api/:splat"
status = 200
```

**Vercel (alternative):**

Similar setup, use `vercel.json` for rewrites.

## 📝 Common Tasks

### Update API Endpoints

Edit `client/src/lib/api.ts`:

```typescript
export async function getRandomMeal() {
  // Already implemented, but add more endpoints here
}
```

### Add New Component

```bash
cd client
npx shadcn-ui@latest add dropdown-menu
```

Then import and use in your page.

### Change Caching Headers

Server: `server/src/routes/mealdb.ts`

```typescript
res.set("Cache-Control", "public, max-age=86400"); // 24 hours
```

### Change Service Worker Strategy

Edit `client/public/sw.js`, modify fetch event listener strategies.

### Update Icons

Replace files in `client/public/icons/`:
- `icon-192x192.png`
- `icon-512x512.png`
- `icon-192x192-maskable.png` (for adaptive icons)
- `screenshot-1.png`

Then update `manifest.webmanifest` if needed.

## 🐛 Troubleshooting

### Service Worker not updating?

1. DevTools → Application → Service Workers → "Unregister"
2. Refresh page
3. Try again

### Cache issues?

1. DevTools → Application → Cache Storage → Delete old versions
2. Or send message to SW to clear:
   ```javascript
   navigator.serviceWorker.controller.postMessage({
     type: "CLEAR_CACHE"
   });
   ```

### API calls failing?

1. Check server is running: `curl http://localhost:5174/health`
2. Check `.env` file exists in server folder
3. Check MEALDB_API_KEY is set (default: `1`)

### Build errors?

```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📚 Tech Stack

### Backend
- **Express.js** — Web framework
- **TypeScript** — Type safety
- **Helmet** — Security headers
- **CORS** — Cross-origin requests
- **Compression** — gzip responses
- **Node-fetch** — HTTP client

### Frontend
- **React 18** — UI library
- **Vite** — Build tool & dev server
- **TypeScript** — Type safety
- **Tailwind CSS** — Utility-first styling
- **shadcn/ui** — Component library
- **React Query** — Data fetching & caching
- **React Router** — Client-side routing
- **Sonner** — Toast notifications
- **idb** — IndexedDB wrapper
- **Lucide React** — Icons

## ✅ Acceptance Criteria

- ✅ App runs locally with `npm run dev` in both folders
- ✅ Client only calls `/api/*` endpoints (never TheMealDB directly)
- ✅ Favorites work offline (add/view/remove) with IndexedDB
- ✅ PWA is installable, precaches app shell
- ✅ Search, categories, details all functional
- ✅ Skeletons & error states implemented
- ✅ API key never exposed (server-side only)

## 📄 Post-Generation Checklist

- [ ] Run `npm install` in both `server/` and `client/`
- [ ] Copy `server/.env.example` to `server/.env`
- [ ] Run server: `cd server && npm run dev`
- [ ] Run client: `cd client && npm run dev`
- [ ] Open `http://localhost:5173` in browser
- [ ] Test search, categories, details, favorites
- [ ] Test offline (DevTools → Network → Offline)
- [ ] Test PWA installation
- [ ] Replace placeholder icons in `client/public/icons/`
- [ ] Update `manifest.webmanifest` with real app name/description
- [ ] Deploy server to Render/Railway
- [ ] Deploy client to Netlify/Vercel
- [ ] Configure proxy URLs for production

## 📖 Additional Resources

- [TheMealDB API Docs](https://www.themealdb.com/api.php)
- [React Query Docs](https://tanstack.com/query/latest)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Service Workers MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://web.dev/add-manifest/)

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT

---

**Built with ❤️ for recipe lovers**