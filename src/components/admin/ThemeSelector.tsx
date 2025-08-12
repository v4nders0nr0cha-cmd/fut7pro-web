"use client";

import { useState, useEffect } from "react";
import { getAllThemes, getTheme, applyTheme, type ThemeKey } from "@/config/themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Check, Palette, Eye } from "lucide-react";
import { toast } from "react-hot-toast";

interface ThemeSelectorProps {
  currentTheme?: ThemeKey;
  onThemeChange?: (theme: ThemeKey) => void;
  onPreview?: (theme: ThemeKey) => void;
  showPreview?: boolean;
}

export function ThemeSelector({
  currentTheme = "amarelo",
  onThemeChange,
  onPreview,
  showPreview = true,
}: ThemeSelectorProps) {
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>(currentTheme);
  const [previewTheme, setPreviewTheme] = useState<ThemeKey | null>(null);
  const themes = getAllThemes();

  useEffect(() => {
    setSelectedTheme(currentTheme);
  }, [currentTheme]);

  const handleThemeSelect = (themeKey: ThemeKey) => {
    setSelectedTheme(themeKey);
    if (onThemeChange) {
      onThemeChange(themeKey);
    }
  };

  const handlePreview = (themeKey: ThemeKey) => {
    setPreviewTheme(themeKey);
    applyTheme(themeKey);
    if (onPreview) {
      onPreview(themeKey);
    }
  };

  const handleApplyTheme = () => {
    if (previewTheme) {
      setSelectedTheme(previewTheme);
      if (onThemeChange) {
        onThemeChange(previewTheme);
      }
      setPreviewTheme(null);
      toast.success("Tema aplicado com sucesso!");
    }
  };

  const handleCancelPreview = () => {
    setPreviewTheme(null);
    applyTheme(selectedTheme);
  };

  const getThemeCategory = (key: ThemeKey): string => {
    const clubThemes = [
      "corinthians",
      "palmeiras",
      "flamengo",
      "santos",
      "saopaulo",
      "cruzeiro",
      "internacional",
      "gremio",
      "atletico",
      "vasco",
      "botafogo",
      "fluminense",
    ];

    if (clubThemes.includes(key)) {
      return "Clubes Brasileiros";
    }

    return "Temas Básicos";
  };

  const groupedThemes = themes.reduce(
    (acc, { key, config }) => {
      const category = getThemeCategory(key);
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({ key, config });
      return acc;
    },
    {} as Record<string, Array<{ key: ThemeKey; config: any }>>
  );

  return (
    <div className="space-y-6">
      {/* Preview Section */}
      {showPreview && previewTheme && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Prévia do Tema: {getTheme(previewTheme).name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={handleApplyTheme} className="bg-primary hover:bg-primary/90">
                <Check className="h-4 w-4 mr-2" />
                Aplicar Tema
              </Button>
              <Button variant="outline" onClick={handleCancelPreview}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Theme Categories */}
      {Object.entries(groupedThemes).map(([category, themeList]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">{category}</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {themeList.map(({ key, config }) => (
              <Card
                key={key}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedTheme === key
                    ? "ring-2 ring-primary bg-primary/10"
                    : "hover:bg-surface/50"
                }`}
                onClick={() => handleThemeSelect(key)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{config.name}</CardTitle>
                    {selectedTheme === key && (
                      <Badge variant="secondary" className="text-xs">
                        Ativo
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Color Preview */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: config.primary }}
                      />
                      <span className="text-xs text-muted">Primária: {config.primary}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: config.secondary }}
                      />
                      <span className="text-xs text-muted">Secundária: {config.secondary}</span>
                    </div>

                    {config.gradient && (
                      <div
                        className="h-8 rounded-md shadow-sm"
                        style={{ background: config.gradient }}
                      />
                    )}
                  </div>

                  {/* Description */}
                  {config.description && (
                    <p className="text-xs text-muted mt-2">{config.description}</p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(key);
                      }}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Prévia
                    </Button>

                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleThemeSelect(key);
                      }}
                      className="flex-1"
                      disabled={selectedTheme === key}
                    >
                      <Palette className="h-3 w-3 mr-1" />
                      Aplicar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Current Theme Info */}
      <Card className="bg-surface/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Tema Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg shadow-lg"
              style={{
                background: getTheme(selectedTheme).gradient || getTheme(selectedTheme).primary,
              }}
            />
            <div>
              <h4 className="font-semibold">{getTheme(selectedTheme).name}</h4>
              <p className="text-sm text-muted">{getTheme(selectedTheme).description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
