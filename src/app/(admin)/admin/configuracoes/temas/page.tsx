"use client";

import { useState, useEffect } from "react";
import { ThemeSelector } from "@/components/admin/ThemeSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Settings, Palette, Save, RotateCcw } from "lucide-react";
import { toast } from "react-hot-toast";
import { getAllThemes, getTheme, applyTheme, type ThemeKey } from "@/config/themes";
import { useTheme } from "@/hooks/useTheme";

export default function ConfiguracaoTemasPage() {
  const {
    currentTheme,
    availableThemes,
    rachaConfig,
    isLoading,
    error,
    applyTheme,
    previewTheme,
    cancelPreview,
    resetConfig,
    getCurrentThemeConfig,
  } = useTheme();

  const [previewThemeKey, setPreviewThemeKey] = useState<ThemeKey | null>(null);
  const [savedTheme, setSavedTheme] = useState<ThemeKey>(currentTheme);

  useEffect(() => {
    setSavedTheme(currentTheme);
  }, [currentTheme]);

  const handleThemeChange = async (theme: ThemeKey) => {
    const success = await applyTheme(theme);
    if (success) {
      setSavedTheme(theme);
    }
  };

  const handlePreview = (theme: ThemeKey) => {
    setPreviewThemeKey(theme);
    previewTheme(theme);
  };

  const handleApplyPreview = async () => {
    if (previewThemeKey) {
      const success = await applyTheme(previewThemeKey);
      if (success) {
        setSavedTheme(previewThemeKey);
        setPreviewThemeKey(null);
      }
    }
  };

  const handleCancelPreview = () => {
    cancelPreview();
    setPreviewThemeKey(null);
  };

  const handleResetTheme = async () => {
    const success = await resetConfig();
    if (success) {
      setSavedTheme("amarelo");
    }
  };

  const currentThemeConfig = getCurrentThemeConfig();
  const themes = getAllThemes();

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <Palette className="h-8 w-8" />
            Configuração de Temas
          </h1>
          <p className="text-muted mt-2">
            Personalize a aparência do seu racha com diferentes temas
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleResetTheme}
            disabled={currentTheme === savedTheme}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar
          </Button>

          <Button onClick={handleResetTheme} disabled={isLoading}>
            <RotateCcw className="h-4 w-4 mr-2" />
            {isLoading ? "Resetando..." : "Resetar Configurações"}
          </Button>
        </div>
      </div>

      {/* Current Theme Info */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Tema Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-lg shadow-lg"
              style={{
                background: currentThemeConfig.gradient || currentThemeConfig.primary,
              }}
            />
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{currentThemeConfig.name}</h3>
              <p className="text-muted">{currentThemeConfig.description}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">
                  {currentTheme === savedTheme ? "Salvo" : "Não salvo"}
                </Badge>
                <Badge>{themes.length} temas disponíveis</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Selecionar Tema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeSelector
            currentTheme={currentTheme}
            onThemeChange={handleThemeChange}
            onPreview={handlePreview}
            showPreview={true}
          />
        </CardContent>
      </Card>

      {/* Theme Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted">Temas Básicos</p>
                <p className="text-2xl font-bold">
                  {
                    themes.filter(
                      (t) => !t.key.includes("corinthians") && !t.key.includes("palmeiras")
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted">Clubes Brasileiros</p>
                <p className="text-2xl font-bold">
                  {
                    themes.filter(
                      (t) =>
                        t.key.includes("corinthians") ||
                        t.key.includes("palmeiras") ||
                        t.key.includes("flamengo") ||
                        t.key.includes("santos")
                    ).length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted">Total de Temas</p>
                <p className="text-2xl font-bold">{themes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-info/10 border-info/20">
        <CardHeader>
          <CardTitle className="text-info">Como usar os temas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              • <strong>Prévia:</strong> Clique em "Prévia" para ver como o tema ficará antes de
              aplicar
            </p>
            <p>
              • <strong>Aplicar:</strong> Clique em "Aplicar" para usar o tema imediatamente
            </p>
            <p>
              • <strong>Salvar:</strong> Use o botão "Salvar Tema" para persistir sua escolha
            </p>
            <p>
              • <strong>Restaurar:</strong> Use "Restaurar" para voltar ao último tema salvo
            </p>
            <p>
              • <strong>Temas de Clubes:</strong> Temas especiais inspirados nos principais clubes
              brasileiros
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
