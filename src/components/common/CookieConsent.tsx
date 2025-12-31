'use client';

import { Check, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useStoreCookieConsent } from '@/hooks/queries/useDataRights';

type CookieCategory = 'essential' | 'analytics' | 'marketing';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

const COOKIE_CONSENT_KEY = 'cookie-consent';
const COOKIE_PREFERENCES_KEY = 'cookie-preferences';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
  });

  const storeCookieConsentMutation = useStoreCookieConsent();

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);

    if (!consent) {
      setShowBanner(true);
    } else if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(parsed);
      } catch (e) {
        // Invalid preferences, show banner again
        setShowBanner(true);
      }
    }
  }, []);

  const handleAcceptAll = async () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    await savePreferences(allAccepted);
    setShowBanner(false);
  };

  const handleRejectAll = async () => {
    const onlyEssential: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    await savePreferences(onlyEssential);
    setShowBanner(false);
  };

  const handleSavePreferences = async () => {
    await savePreferences(preferences);
    setShowBanner(false);
    setShowSettings(false);
  };

  const savePreferences = async (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));

    // Apply preferences to actual cookie usage
    applyCookiePreferences(prefs);

    // Optionally sync with backend (if user is authenticated)
    try {
      // Check if user is authenticated (token exists)
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('token='))
        ?.split('=')[1];

      if (token) {
        // Sync with backend
        await storeCookieConsentMutation.mutateAsync(prefs);
      }
    } catch (error) {
      // Silently fail - localStorage is the primary storage
      // Error is already handled by mutation
    }

    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('cookie-consent-updated', { detail: prefs }));
  };

  const applyCookiePreferences = (prefs: CookiePreferences) => {
    // Essential cookies are always enabled (handled by existing code)
    // Analytics cookies
    if (!prefs.analytics) {
      // Disable analytics tracking
      // This would typically disable Google Analytics, etc.
      if (typeof window !== 'undefined' && (window as any).gtag) {
        // Disable Google Analytics
        (window as any).gtag('consent', 'update', {
          analytics_storage: 'denied',
        });
      }
    } else {
      // Enable analytics tracking
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          analytics_storage: 'granted',
        });
      }
    }

    // Marketing cookies
    if (!prefs.marketing) {
      // Disable marketing tracking
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          ad_storage: 'denied',
        });
      }
    } else {
      // Enable marketing tracking
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          ad_storage: 'granted',
        });
      }
    }
  };

  const handlePreferenceChange = (category: CookieCategory, value: boolean) => {
    if (category === 'essential') {
      return; // Essential cookies cannot be disabled
    }
    setPreferences((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const openSettings = () => {
    setShowSettings(true);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
      {/* Cookie Consent Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Cookie Consent
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                We use cookies to enhance your experience, analyze site usage, and assist in our
                marketing efforts. Essential cookies are required for the site to function properly.
                You can manage your preferences at any time.{' '}
                <a
                  href="/cookies"
                  className="text-primary hover:underline font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more
                </a>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={openSettings}
                className="w-full sm:w-auto"
              >
                <Settings className="w-4 h-4 mr-2" />
                Customize
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectAll}
                className="w-full sm:w-auto"
              >
                Reject All
              </Button>
              <Button
                size="sm"
                onClick={handleAcceptAll}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cookie Preferences</DialogTitle>
            <DialogDescription>
              Manage your cookie preferences. Essential cookies are required for the site to
              function and cannot be disabled.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Essential Cookies */}
            <div className="space-y-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="essential" className="text-base font-semibold cursor-pointer">
                    Essential Cookies
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Required for the website to function. These include authentication, security,
                    and session management cookies. These cannot be disabled.
                  </p>
                </div>
                <div className="ml-4">
                  <Switch
                    id="essential"
                    checked={preferences.essential}
                    disabled
                    className="opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="space-y-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="analytics" className="text-base font-semibold cursor-pointer">
                    Analytics Cookies
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Help us understand how visitors interact with our website by collecting and
                    reporting information anonymously. This helps us improve our services.
                  </p>
                </div>
                <div className="ml-4">
                  <Switch
                    id="analytics"
                    checked={preferences.analytics}
                    onCheckedChange={(checked) => handlePreferenceChange('analytics', checked)}
                  />
                </div>
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="space-y-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="marketing" className="text-base font-semibold cursor-pointer">
                    Marketing Cookies
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Used to deliver personalized advertisements and track campaign performance.
                    These cookies may be set by third-party advertising partners.
                  </p>
                </div>
                <div className="ml-4">
                  <Switch
                    id="marketing"
                    checked={preferences.marketing}
                    onCheckedChange={(checked) => handlePreferenceChange('marketing', checked)}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                You can change these preferences at any time by clicking the cookie settings link in
                the footer or clearing your browser cookies.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowSettings(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSavePreferences} className="bg-primary hover:bg-primary/90">
                  <Check className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Helper function to check if consent has been given
export function hasCookieConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(COOKIE_CONSENT_KEY) === 'true';
}

// Helper function to get cookie preferences
export function getCookiePreferences(): CookiePreferences {
  if (typeof window === 'undefined') {
    return {
      essential: true,
      analytics: false,
      marketing: false,
    };
  }

  const saved = localStorage.getItem(COOKIE_PREFERENCES_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return {
        essential: true,
        analytics: false,
        marketing: false,
      };
    }
  }

  return {
    essential: true,
    analytics: false,
    marketing: false,
  };
}

// Helper function to check if a specific category is allowed
export function isCookieCategoryAllowed(category: CookieCategory): boolean {
  const preferences = getCookiePreferences();
  return preferences[category] === true;
}
