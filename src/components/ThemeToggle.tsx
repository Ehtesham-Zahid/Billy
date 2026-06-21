"use client";

import React from "react";
import { useTheme } from "@/providers/ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors relative"
      title={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
      aria-label="Toggle theme"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Moon Icon */}
        <span
          className={`absolute transition-all duration-300 transform ${
            theme === "light" ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"
          }`}
        >
          <Moon className="h-4.5 w-4.5 text-indigo-500" />
        </span>
        
        {/* Sun Icon */}
        <span
          className={`absolute transition-all duration-300 transform ${
            theme === "dark" ? "scale-100 rotate-0 opacity-100" : "scale-0 -rotate-90 opacity-0"
          }`}
        >
          <Sun className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
        </span>
      </div>
    </Button>
  );
}
