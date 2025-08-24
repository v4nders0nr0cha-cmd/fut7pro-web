"use client";
import { useTheme } from "@/context/ThemeContext";
import { themes } from "@/config/themes";

export default function ThemeSwitcher() {
  const { themeKey, setThemeKey } = useTheme();

  return (
    <div className="my-4 flex gap-2">
      {Object.entries(themes).map(([key, th]) => (
        <button
          key={key}
          className={`rounded border px-3 py-1 font-bold transition-all`}
          style={{
            background: themeKey === key ? th.primary : "#222",
            color: themeKey === key ? "#000" : "#fff",
            borderColor: th.primary,
            outline: themeKey === key ? "2px solid #fff" : undefined,
          }}
          onClick={() => setThemeKey(key as string)}
        >
          {th.name}
        </button>
      ))}
    </div>
  );
}
