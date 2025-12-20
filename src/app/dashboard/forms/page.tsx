'use client';

import { Download, FileText } from 'lucide-react';
import { useState } from 'react';

import { DashboardPageWrapper } from '@/components/core/Dashboard/DashboardPageWrapper';
import { Button } from '@/components/ui/button';
import {
  useDownloadFreelancerFormTemplate,
  useVisibleFormTemplates,
} from '@/hooks/queries/useFormTemplates';
import { formatFileSize } from '@/services/formTemplateService';
import type { FormTemplate } from '@/types/formTemplate';

const FreelancerFormsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data: templates, isLoading, isFetching } = useVisibleFormTemplates();
  const downloadMutation = useDownloadFreelancerFormTemplate();

  // Filter templates based on search query
  const filteredTemplates =
    templates?.filter(
      (template) =>
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.fileName.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const handleDownload = (template: FormTemplate) => {
    setDownloadingId(template.id);
    downloadMutation.mutate(
      {
        id: template.id,
        filename: template.fileName,
      },
      {
        onSettled: () => {
          setDownloadingId(null);
        },
      },
    );
  };

  return (
    <DashboardPageWrapper
      header={<h1 className="font-poppins font-bold text-2xl text-charcoal">Form Templates</h1>}
    >
      <div className="space-y-6 lg:space-y-8">
        {/* Templates List */}
        {isLoading && !templates ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery
                ? 'No templates found matching your search.'
                : 'No form templates available.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{template.title}</h3>
                      <p className="text-sm text-muted-foreground">{template.fileName}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">File Size:</span>
                    <span className="font-medium">{formatFileSize(template.fileSize)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created:</span>
                    <span className="font-medium">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => handleDownload(template)}
                  disabled={downloadingId === template.id}
                >
                  {downloadingId === template.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardPageWrapper>
  );
};

export default FreelancerFormsPage;
