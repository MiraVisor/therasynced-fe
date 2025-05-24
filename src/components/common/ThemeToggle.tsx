'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { Switch } from '@/components/ui/switch';

export const ThemeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const isDarkMode = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <div className="flex items-center gap-2">
      <Sun className={`h-4 w-4 ${!isDarkMode ? 'text-yellow-500' : 'text-gray-600'}`} />

      <Switch checked={isDarkMode} onCheckedChange={toggleTheme} />

      <Moon className={`h-4 w-4 ${isDarkMode ? 'text-yellow-500' : 'text-gray-600'}`} />
    </div>
  );
};
