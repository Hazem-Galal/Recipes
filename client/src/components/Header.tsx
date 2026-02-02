// client/src/components/Header.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Search, Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface HeaderProps {
  isOnline: boolean;
}

export default function Header({ isOnline }: HeaderProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", newTheme);
  };

  return (
    <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-2xl font-bold hover:opacity-80 transition-opacity"
            aria-label="Recipes home"
          >
            <span className="text-3xl">🍽️</span>
            <span className="hidden sm:inline">Recipes</span>
          </Link>

          {/* Center: Search (optional, can be on home page) */}
          <div className="hidden sm:flex flex-1 max-w-xs">
            {/* Search bar can be placed here or on individual pages */}
          </div>

          {/* Right side: Actions */}
          <div className="flex items-center gap-2">
            {/* Favorites Link */}
            <Link to="/favorites">
              <Button
                variant="ghost"
                size="icon"
                aria-label="View favorites"
                title={isOnline ? "Favorites" : "Favorites (offline)"}
              >
                <Heart className="h-5 w-5" />
              </Button>
            </Link>

            {/* Online/Offline Indicator */}
            {!isOnline && (
              <div className="text-xs font-medium text-destructive px-2 py-1 bg-destructive/10 rounded">
                Offline
              </div>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
