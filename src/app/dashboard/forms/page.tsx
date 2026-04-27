'use client';

import { ExternalLink, FileText, Lock, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { GuidedEmptyState } from '@/components/core/Dashboard/FreelancerSide/GuidedEmptyState';
import { Button } from '@/components/ui/button';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Input } from '@/components/ui/input';
import {
  useGetFreelancerFormTemplateSignedUrl,
  useVisibleFormTemplates,
} from '@/hooks/queries/useFormTemplates';
import { useMySubscription } from '@/hooks/queries/useSubscription';
import { formatFileSize } from '@/services/formTemplateService';
import type { FormTemplate } from '@/types/formTemplate';
import { isInTrial } from '@/utils/subscriptionHelpers';

const FreelancerFormsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Tier gate - Bronze users are blocked from accessing form templates.
  // Backend also enforces this (403 on the list endpoint) but we want a
  // friendly upgrade prompt instead of just an error state.
  const { data: subscription, isLoading: isLoadingSubscription } = useMySubscription();
  const canAccessForms =
    subscription?.canAccessCustomForms === true || isInTrial(subscription ?? null);

  const { data: templates, isLoading } = useVisibleFormTemplates({
    enabled: canAccessForms && !isLoadingSubscription,
  });
  const signedUrlMutation = useGetFreelancerFormTemplateSignedUrl();

  // Filter templates based on search query
  const filteredTemplates =
    templates?.filter(
      (template) =>
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.fileName.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const handleOpenForm = async (template: FormTemplate) => {
    setDownloadingId(template.id);
    try {
      const data = await signedUrlMutation.mutateAsync(template.id);

      // Fetch the PDF as a blob to avoid CORS issues
      const response = await fetch(data.signedUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch PDF');
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      // Open the blob URL in a new tab
      window.open(blobUrl, '_blank');

      // Clean up the blob URL after a delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

      setDownloadingId(null);
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error('Failed to load PDF. Please try again.');
      setDownloadingId(null);
    }
  };

  return (
    <DashboardPageWrapper
      header={
        <div className="space-y-2">
          <h1 className="font-poppins font-bold text-2xl text-charcoal">Form Templates</h1>
          <p className="font-inter text-muted-foreground">
            Access and download form templates for your practice
          </p>
        </div>
      }
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Tier gate: Bronze sees upgrade prompt instead of the page */}
        {!isLoadingSubscription && !canAccessForms ? (
          <div className="border-2 border-dashed border-gray-200 rounded-2xl py-16 px-6 text-center bg-white
            <div className="w-14 h-14 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-xl font-poppins font-bold text-charcoal mb-2">
              Custom intake forms require Silver or Gold
            </h2>
            <p className="text-sm font-inter text-muted-foreground max-w-md mx-auto mb-6">
              Use professionally designed form templates to collect client information before
              sessions. This feature is available on the Silver and Gold plans.
            </p>
            <Link href="/dashboard/account?tab=subscription&view=plans">
              <Button size="lg" className="bg-primary">
                Compare Plans
              </Button>
            </Link>
          </div>
        ) : null}

        {/* Search Bar */}
        {canAccessForms && templates && templates.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search forms by name or filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full max-w-md"
            />
          </div>
        )}

        {/* Stats */}
        {canAccessForms && !isLoading && templates && templates.length > 0 && (
          <div className="flex items-center gap-4 text-sm font-inter text-muted-foreground">
            <span>
              {filteredTemplates.length} {filteredTemplates.length === 1 ? 'form' : 'forms'}
              {searchQuery && ` found`}
            </span>
          </div>
        )}

        {/* Templates List - only shown to users with access */}
        {canAccessForms && isLoading && !templates ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : canAccessForms && filteredTemplates.length === 0 ? (
          <GuidedEmptyState
            icon={FileText}
            title={searchQuery ? 'No templates found' : 'No form templates available'}
            description={
              searchQuery
                ? "Try adjusting your search terms to find what you're looking for."
                : "Forms help you collect information before sessions. Templates will appear here once they're available."
            }
          />
        ) : canAccessForms ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <EnhancedCard
                key={template.id}
                variant="default"
                interactive
                className="group border border-gray-200/80 shadow-soft backdrop-blur-sm bg-white/80 rounded-xl hover:shadow-md transition-all"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-poppins font-semibold text-lg text-charcoal truncate">
                          {template.title}
                        </h3>
                        <p className="text-sm font-inter text-muted-foreground truncate">
                          {template.fileName}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-inter">File Size:</span>
                      <span className="font-medium font-inter text-charcoal">
                        {formatFileSize(template.fileSize)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-inter">Created:</span>
                      <span className="font-medium font-inter text-charcoal">
                        {new Date(template.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4"
                    onClick={() => handleOpenForm(template)}
                    disabled={downloadingId === template.id}
                  >
                    {downloadingId === template.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Opening...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Form
                      </>
                    )}
                  </Button>
                </div>
              </EnhancedCard>
            ))}
          </div>
        ) : null}
      </div>
    </DashboardPageWrapper>
  );
};

export default FreelancerFormsPage;
