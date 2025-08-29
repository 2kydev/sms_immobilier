
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette, Sun, Moon, Monitor } from 'lucide-react';
import ChangePasswordForm from '@/components/auth/ChangePasswordForm';

type Theme = 'light' | 'dark' | 'system';

const UserPreferences = () => {
  const [selectedTheme, setSelectedTheme] = useState<Theme>('system');

  useEffect(() => {
    // Load saved theme preference from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setSelectedTheme(savedTheme);
    }
  }, []);

  const applyTheme = (theme: Theme) => {
    const root = window.document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemPrefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const handleThemeChange = (theme: Theme) => {
    setSelectedTheme(theme);
    localStorage.setItem('theme', theme);
    applyTheme(theme);
  };

  const getThemeIcon = (theme: Theme) => {
    switch (theme) {
      case 'light': return <Sun className="h-4 w-4" />;
      case 'dark': return <Moon className="h-4 w-4" />;
      case 'system': return <Monitor className="h-4 w-4" />;
    }
  };

  const getThemeLabel = (theme: Theme) => {
    switch (theme) {
      case 'light': return 'Clair';
      case 'dark': return 'Sombre';
      case 'system': return 'Système';
    }
  };

  const themes: Theme[] = ['light', 'dark', 'system'];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle>Préférences</CardTitle>
          </div>
          <CardDescription>Personnalisez votre expérience utilisateur</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-3">Thème de l'interface</h4>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((theme) => (
                <Button
                  key={theme}
                  variant={selectedTheme === theme ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleThemeChange(theme)}
                  className="flex items-center gap-2 h-auto py-3"
                >
                  {getThemeIcon(theme)}
                  <span className="text-xs">{getThemeLabel(theme)}</span>
                </Button>
              ))}
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                Thème actuel: {getThemeLabel(selectedTheme)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <ChangePasswordForm />
    </div>
  );
};

export default UserPreferences;
