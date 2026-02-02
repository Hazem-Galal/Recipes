// client/src/lib/api.ts
/**
 * API client for Recipes PWA.
 * All requests go through /api/* proxy (never direct to TheMealDB).
 */

const API_BASE = "/api";

export interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory?: string;
  strArea?: string;
  strTags?: string;
  strYoutube?: string;
  strInstructions?: string;
  strSource?: string;
  [key: string]: string | undefined; // For ingredients
}

export interface Category {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

export interface SearchResponse {
  meals: Meal[] | null;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface FilterResponse {
  meals: Meal[] | null;
}

/**
 * Search meals by query string
 */
export async function searchMeals(query: string): Promise<Meal[]> {
  if (!query.trim()) return [];

  const response = await fetch(`${API_BASE}/search?s=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error("Failed to search meals");

  const data: SearchResponse = await response.json();
  return data.meals || [];
}

/**
 * Get meal details by ID
 */
export async function getMealById(id: string): Promise<Meal | null> {
  const response = await fetch(`${API_BASE}/meal/${id}`);
  if (!response.ok) throw new Error("Failed to fetch meal");

  const data: SearchResponse = await response.json();
  return data.meals?.[0] || null;
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE}/categories`);
  if (!response.ok) throw new Error("Failed to fetch categories");

  const data: CategoriesResponse = await response.json();
  return data.categories || [];
}

/**
 * Filter meals by category
 */
export async function filterByCategory(category: string): Promise<Meal[]> {
  const response = await fetch(`${API_BASE}/filter?c=${encodeURIComponent(category)}`);
  if (!response.ok) throw new Error("Failed to filter meals");

  const data: FilterResponse = await response.json();
  return data.meals || [];
}

/**
 * Get a random meal
 */
export async function getRandomMeal(): Promise<Meal | null> {
  const response = await fetch(`${API_BASE}/random`);
  if (!response.ok) throw new Error("Failed to fetch random meal");

  const data: SearchResponse = await response.json();
  return data.meals?.[0] || null;
}
