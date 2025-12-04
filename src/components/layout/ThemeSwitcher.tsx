"use client";
import { useTheme } from "@/context/ThemeContext";
import { themes } from "@/config/themes";
import type { ThemeKey } from "@/config/themes";

export default function ThemeSwitcher() {
  const { themeKey, setThemeKey } = useTheme();

  return (
    <div className="flex gap-2 my-4">
      {Object.entries(themes).map(([key, th]) => (
        <button
          key={key}
          className={`px-3 py-1 rounded border transition-all font-bold`}
          style={{
            background: themeKey === key ? th.primary : "#222",
            color: themeKey === key ? "#000" : "#fff",
            borderColor: th.primary,
            outline: themeKey === key ? "2px solid #fff" : undefined,
          }}
          onClick={() => setThemeKey(key as ThemeKey)}
        >
          {th.name}
        </button>
      ))}
    </div>
  );
}
