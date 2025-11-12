"use client";
import { useTheme } from "@/context/ThemeContext";
import { themes } from "@/config/themes";
import type { ThemeKey } from "@/config/themes";

export default function ThemeSwitcher() {
  const { themeKey, setThemeKey } = useTheme();
  const themeKeys = Object.keys(themes) as ThemeKey[];

  return (
    <div className="flex gap-2 my-4">
      {themeKeys.map((key) => {
        const themeConfig = themes[key];
        return (
        <button
          key={key}
          className={`px-3 py-1 rounded border transition-all font-bold`}
          style={{
            background: themeKey === key ? themeConfig.primary : "#222",
            color: themeKey === key ? "#000" : "#fff",
            borderColor: themeConfig.primary,
            outline: themeKey === key ? "2px solid #fff" : undefined,
          }}
          onClick={() => setThemeKey(key)}
        >
          {themeConfig.name}
        </button>
      );
      })}
    </div>
  );
}
