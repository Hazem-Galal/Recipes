// server/src/routes/mealdb.ts
import { Router, Request, Response } from "express";
import { URL } from "url";

const router = Router();

// Environment variables with defaults
const MEALDB_API_BASE = process.env.MEALDB_API_BASE || "https://www.themealdb.com/api/json/v1";
const MEALDB_API_KEY = process.env.MEALDB_API_KEY || "1";
const CACHE_TTL = parseInt(process.env.CACHE_TTL || "3600", 10);

// ============ In-Memory Cache ============
// Simple TTL cache for categories (most stable data)
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;

  const isExpired = Date.now() - entry.timestamp > CACHE_TTL * 1000;
  if (isExpired) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

function setCached<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// ============ Helpers ============
/**
 * Fetches data from TheMealDB API with proper error handling.
 * The API key is never exposed to the client.
 */
async function fetchFromMealDB(endpoint: string) {
  const url = new URL(`${MEALDB_API_BASE}/${MEALDB_API_KEY}/${endpoint}`);

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`TheMealDB API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`[MEALDB FETCH ERROR] ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Generic proxy handler with optional caching.
 */
async function proxyHandler(
  endpoint: string,
  res: Response,
  shouldCache: boolean = false,
  cacheKey: string = endpoint
) {
  try {
    // Check cache first
    if (shouldCache) {
      const cached = getCached(cacheKey);
      if (cached) {
        console.log(`[CACHE HIT] ${cacheKey}`);
        return res.json(cached);
      }
    }

    // Fetch from MealDB
    const data = await fetchFromMealDB(endpoint);

    // Cache if enabled
    if (shouldCache) {
      setCached(cacheKey, data);
      console.log(`[CACHED] ${cacheKey}`);
    }

    // Set cache headers for client-side caching
    if (shouldCache) {
      // Categories are stable, cache for longer
      res.set("Cache-Control", "public, max-age=86400"); // 24 hours
    } else {
      // Search results and details: shorter cache
      res.set("Cache-Control", "public, max-age=3600"); // 1 hour
    }

    res.json(data);
  } catch (error) {
    console.error("[PROXY ERROR]", error);
    res.status(500).json({
      error: "Failed to fetch from TheMealDB",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// ============ Routes ============

/**
 * GET /api/search?s={query}
 * Search meals by name
 */
router.get("/search", async (req: Request, res: Response) => {
  const { s } = req.query;

  if (!s || typeof s !== "string") {
    return res.status(400).json({ error: "Missing or invalid 's' query parameter" });
  }

  // Sanitize query
  const sanitized = encodeURIComponent(s.trim());
  await proxyHandler(`search.php?s=${sanitized}`, res);
});

/**
 * GET /api/meal/:id
 * Get meal details by ID
 */
router.get("/meal/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Missing meal ID" });
  }

  await proxyHandler(`lookup.php?i=${encodeURIComponent(id)}`, res);
});

/**
 * GET /api/categories
 * List all meal categories (cached)
 */
router.get("/categories", async (req: Request, res: Response) => {
  await proxyHandler("categories.php", res, true, "categories");
});

/**
 * GET /api/filter?c={category}
 * Get meals by category
 */
router.get("/filter", async (req: Request, res: Response) => {
  const { c } = req.query;

  if (!c || typeof c !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'c' query parameter" });
  }

  const sanitized = encodeURIComponent(c.trim());
  await proxyHandler(`filter.php?c=${sanitized}`, res);
});

/**
 * GET /api/random (Optional)
 * Get a random meal
 */
router.get("/random", async (req: Request, res: Response) => {
  await proxyHandler("random.php", res);
});

export default router;
