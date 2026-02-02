// client/src/pages/Favorites.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { type Meal } from "@/lib/api";
import { getAllFavorites, removeFavorite } from "@/features/favorites/db";

export default function Favorites() {
  const [favorites, setFavorites] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"name" | "recent">("name");

  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const meals = await getAllFavorites();
      setFavorites(meals);
    } catch (err) {
      toast.error("Failed to load favorites");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (mealId: string) => {
    try {
      await removeFavorite(mealId);
      setFavorites((prev) => prev.filter((m) => m.idMeal !== mealId));
      toast.success("Removed from favorites");
    } catch (err) {
      toast.error("Failed to remove favorite");
      console.error(err);
    }
  };

  const sortedFavorites = [...favorites].sort((a, b) => {
    if (sortBy === "name") {
      return a.strMeal.localeCompare(b.strMeal);
    }
    return 0; // 'recent' would need timestamp, using insertion order as-is
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Link to="/">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <h1 className="text-4xl font-bold">My Favorites</h1>
          <p className="text-muted-foreground">
            {favorites.length} {favorites.length === 1 ? "recipe" : "recipes"} saved
          </p>
        </div>

        {favorites.length > 0 && (
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "name" | "recent")}
              className="h-10 px-3 rounded-md border border-input bg-background text-foreground"
              aria-label="Sort favorites"
            >
              <option value="name">Sort by Name</option>
              <option value="recent">Recently Added</option>
            </select>
          </div>
        )}
      </div>

      {/* Favorites Grid */}
      {favorites.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg mb-4">No favorites yet</p>
          <p className="text-sm mb-6">
            Explore recipes and add them to your favorites to see them here
          </p>
          <Link to="/">
            <Button>Browse Recipes</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedFavorites.map((meal: Meal) => (
            <div key={meal.idMeal} className="group relative">
              <Link
                to={`/meal/${meal.idMeal}`}
                className="block"
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

              {/* Remove button */}
              <button
                onClick={() => handleRemove(meal.idMeal)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                aria-label={`Remove ${meal.strMeal} from favorites`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
