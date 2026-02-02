// client/src/pages/Home.tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { SearchIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { searchMeals, getCategories, filterByCategory, type Meal, type Category } from "@/lib/api";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch categories
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // Fetch search or filtered results
  const {
    data: meals = [],
    isLoading: mealsLoading,
    error: mealsError,
  } = useQuery({
    queryKey: ["meals", searchQuery, selectedCategory],
    queryFn: async () => {
      if (searchQuery.trim()) {
        return searchMeals(searchQuery);
      } else if (selectedCategory) {
        return filterByCategory(selectedCategory);
      }
      return [];
    },
    enabled: !!searchQuery.trim() || !!selectedCategory,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    setSelectedCategory(null); // Clear category filter when searching
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
    setSearchQuery(""); // Clear search when filtering by category
  };

  return (
    <div className="space-y-8">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search recipes by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search recipes"
              className="pl-10"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
          <Button type="submit" disabled={mealsLoading}>
            {mealsLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              "Search"
            )}
          </Button>
        </div>
      </form>

      {/* Categories */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Browse by Category</h2>
        {categoriesError && (
          <div className="text-destructive text-sm">
            Failed to load categories
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {categoriesLoading
            ? Array(6)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-10 w-24 rounded-full" />
                ))
            : categories.map((cat: Category) => (
                <Button
                  key={cat.idCategory}
                  variant={selectedCategory === cat.strCategory ? "default" : "outline"}
                  onClick={() => handleCategoryClick(cat.strCategory)}
                  className="rounded-full"
                >
                  {cat.strCategory}
                </Button>
              ))}
        </div>
      </div>

      {/* Results */}
      <div>
        {(searchQuery.trim() || selectedCategory) && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {searchQuery.trim()
                ? `Results for "${searchQuery}"`
                : `${selectedCategory} Recipes`}
            </h2>
            {!mealsLoading && (
              <span className="text-sm text-muted-foreground">
                {meals.length} {meals.length === 1 ? "recipe" : "recipes"} found
              </span>
            )}
          </div>
        )}

        {mealsError && (
          <div className="text-destructive text-center py-8">
            Failed to load meals. Please try again.
          </div>
        )}

        {mealsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-lg" />
              ))}
          </div>
        ) : meals.length === 0 && (searchQuery.trim() || selectedCategory) ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">No recipes found</p>
            <p className="text-sm">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {meals.map((meal: Meal) => (
              <Link
                key={meal.idMeal}
                to={`/meal/${meal.idMeal}`}
                className="group"
              >
                <Card className="overflow-hidden h-full transition-all hover:shadow-lg hover:scale-105">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={meal.strMealThumb}
                      alt={meal.strMeal}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                      {meal.strMeal}
                    </h3>
                    {meal.strCategory && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {meal.strCategory}
                        {meal.strArea && ` • ${meal.strArea}`}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
