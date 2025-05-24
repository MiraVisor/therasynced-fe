'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      variant="outline"
      size="icon"
      className="relative"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] transition-transform duration-300 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 transition-transform duration-300 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
