// client/src/pages/Details.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Heart, ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getMealById, type Meal } from "@/lib/api";
import { saveFavorite, removeFavorite, isFavorited } from "@/features/favorites/db";

export default function Details() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFav, setIsFav] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    data: meal,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["meal", id],
    queryFn: () => getMealById(id!),
    enabled: !!id,
  });

  // Check if meal is favorited on mount
  useEffect(() => {
    if (meal?.idMeal) {
      isFavorited(meal.idMeal).then(setIsFav);
    }
  }, [meal?.idMeal]);

  const handleFavorite = async () => {
    if (!meal) return;

    setIsSaving(true);
    try {
      if (isFav) {
        await removeFavorite(meal.idMeal);
        setIsFav(false);
        toast.success("Removed from favorites");
      } else {
        await saveFavorite(meal);
        setIsFav(true);
        toast.success("Added to favorites");
      }
    } catch (err) {
      toast.error("Failed to update favorites");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="lg:col-span-2 aspect-square" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !meal) {
    return (
      <div className="space-y-8">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="text-center py-12 text-destructive">
          <p className="text-lg">Failed to load recipe</p>
          <Button variant="link" onClick={() => navigate(-1)} className="mt-4">
            Go back
          </Button>
        </div>
      </div>
    );
  }

  // Extract ingredients and measurements
  const ingredients: Array<{ ingredient: string; measure: string }> = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push({
        ingredient,
        measure: measure || "",
      });
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          variant={isFav ? "default" : "outline"}
          onClick={handleFavorite}
          disabled={isSaving}
          aria-pressed={isFav}
        >
          <Heart className={`mr-2 h-4 w-4 ${isFav ? "fill-current" : ""}`} />
          {isSaving ? "Saving..." : isFav ? "Favorited" : "Add to Favorites"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Image and Basic Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg">
            <img
              src={meal.strMealThumb}
              alt={meal.strMeal}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h1 className="text-4xl font-bold mb-2">{meal.strMeal}</h1>
            <div className="flex flex-wrap gap-2 text-muted-foreground">
              {meal.strCategory && <span>📂 {meal.strCategory}</span>}
              {meal.strArea && <span>🌍 {meal.strArea}</span>}
            </div>
          </div>

          {meal.strTags && (
            <div className="flex flex-wrap gap-2">
              {meal.strTags.split(",").map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Ingredients Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
              <CardDescription>{ingredients.length} items</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {ingredients.map((item, i) => (
                  <li key={i} className="flex justify-between text-sm gap-2">
                    <span className="font-medium">{item.ingredient}</span>
                    <span className="text-muted-foreground text-right">
                      {item.measure}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {meal.strYoutube && (
            <a
              href={meal.strYoutube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full"
            >
              <Button className="w-full" variant="outline">
                <ExternalLink className="mr-2 h-4 w-4" />
                Watch on YouTube
              </Button>
            </a>
          )}

          {meal.strSource && (
            <a
              href={meal.strSource}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full"
            >
              <Button className="w-full" variant="outline">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Recipe Source
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Instructions */}
      {meal.strInstructions && (
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed">
                {meal.strInstructions}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
