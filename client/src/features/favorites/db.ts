// client/src/features/favorites/db.ts
/**
 * IndexedDB helpers for managing favorite meals offline.
 * Uses the 'idb' library for a promise-based interface.
 */

import { openDB, DBSchema, IDBPDatabase } from "idb";
import { Meal } from "@/lib/api";

interface FavoritesDB extends DBSchema {
  favorites: {
    key: string;
    value: Meal;
    indexes: { "by-date": number };
  };
}

let dbInstance: IDBPDatabase<FavoritesDB> | null = null;

/**
 * Initialize and return the IndexedDB instance.
 */
async function getDB(): Promise<IDBPDatabase<FavoritesDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<FavoritesDB>("RecipesDB", 1, {
    upgrade(db) {
      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains("favorites")) {
        const store = db.createObjectStore("favorites", { keyPath: "idMeal" });
        store.createIndex("by-date", "idMeal");
      }
    },
  });

  return dbInstance;
}

/**
 * Save a meal to favorites.
 */
export async function saveFavorite(meal: Meal): Promise<void> {
  const db = await getDB();
  await db.put("favorites", meal);
}

/**
 * Remove a meal from favorites.
 */
export async function removeFavorite(mealId: string): Promise<void> {
  const db = await getDB();
  await db.delete("favorites", mealId);
}

/**
 * Get a single favorite meal by ID.
 */
export async function getFavorite(mealId: string): Promise<Meal | undefined> {
  const db = await getDB();
  return db.get("favorites", mealId);
}

/**
 * Get all favorite meals.
 */
export async function getAllFavorites(): Promise<Meal[]> {
  const db = await getDB();
  return db.getAll("favorites");
}

/**
 * Check if a meal is favorited.
 */
export async function isFavorited(mealId: string): Promise<boolean> {
  const meal = await getFavorite(mealId);
  return !!meal;
}

/**
 * Clear all favorites (use with caution).
 */
export async function clearFavorites(): Promise<void> {
  const db = await getDB();
  await db.clear("favorites");
}
