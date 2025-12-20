'use client';

import { ExternalLink, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCookie } from '@/lib/utils';
import { useAuth } from '@/redux/hooks/useAppHooks';
import { BACKEND_URL } from '@/services/endpoints';
import formTemplateService from '@/services/formTemplateService';
import { FormTemplateResponseDto } from '@/types/formTemplateTypes';
import { ROLES } from '@/types/types';

export default function FormTemplatesPage() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [templates, setTemplates] = useState<FormTemplateResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/authentication/sign-in');
      return;
    }
    if (role && role !== ROLES.FREELANCER) {
      toast.error('Access denied. Freelancer privileges required.');
      router.push('/dashboard');
      return;
    }
    if (role === ROLES.FREELANCER) {
      setIsAuthorized(true);
      loadTemplates();
    }
  }, [isAuthenticated, role, router]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await formTemplateService.getVisible();
      setTemplates(data);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load form templates');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (template: FormTemplateResponseDto) => {
    try {
      setDownloadingIds((prev) => new Set(prev).add(template.id));

      // Get auth token
      const token = getCookie('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      // Fetch PDF as blob using POST with token in request body (GDPR compliant)
      const response = await fetch(`${BACKEND_URL}/freelancer/forms/${template.id}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch form template');
      }

      // Create blob from response
      const blob = await response.blob();

      // Create object URL from blob
      const blobUrl = URL.createObjectURL(blob);

      // Create a temporary anchor element and click it to open in new tab
      // This approach works better than window.open() for avoiding popup blockers
      const link = document.createElement('a');
      link.href = blobUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      // Append to body, click, then remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up blob URL after a delay to allow the browser to load it
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 1000);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to open form template');
    } finally {
      setDownloadingIds((prev) => {
        const next = new Set(prev);
        next.delete(template.id);
        return next;
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (!isAuthorized || role !== ROLES.FREELANCER) {
    return null;
  }

  return (
    <DashboardPageWrapper
      header={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <h1 className="font-poppins font-bold text-2xl text-charcoal">Form Templates</h1>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="font-inter text-muted-foreground">Loading form templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-inter text-muted-foreground">
                  No form templates available at this time.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => {
              const isDownloading = downloadingIds.has(template.id);
              return (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="font-poppins font-semibold text-lg text-charcoal">
                          {template.title}
                        </CardTitle>
                        <CardDescription className="font-inter text-sm mt-1">
                          {template.fileName}
                        </CardDescription>
                      </div>
                      <FileText className="h-8 w-8 text-primary flex-shrink-0 ml-2" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Button
                        onClick={() => handleDownload(template)}
                        disabled={isDownloading}
                        className="w-full font-inter"
                      >
                        {isDownloading ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Opening...
                          </>
                        ) : (
                          <>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open PDF
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardPageWrapper>
  );
}
