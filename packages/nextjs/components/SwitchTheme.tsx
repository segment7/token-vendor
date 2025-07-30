"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

export const SwitchTheme = ({ className }: { className?: string }) => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const isDarkMode = resolvedTheme === "dark";

  const handleToggle = () => {
    if (isDarkMode) {
      setTheme("light");
      return;
    }
    setTheme("dark");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative bg-base-200 rounded-full p-1 shadow-lg border border-base-300 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-full transition-all duration-300 ${!isDarkMode ? 'bg-warning text-warning-content shadow-md' : 'text-base-content/60 hover:text-base-content'}`}>
            <SunIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <input
            id="theme-toggle"
            type="checkbox"
            className="toggle toggle-sm sm:toggle-md bg-base-300 border-base-content/20 hover:bg-accent checked:bg-primary checked:border-primary transition-all duration-300"
            onChange={handleToggle}
            checked={isDarkMode}
          />
          <div className={`p-2 rounded-full transition-all duration-300 ${isDarkMode ? 'bg-info text-info-content shadow-md' : 'text-base-content/60 hover:text-base-content'}`}>
            <MoonIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
