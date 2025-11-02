import { Download, X, ZoomIn, ZoomOut } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DocumentPreviewProps {
  url: string;
  fileName?: string;
  type?: string;
  onDownload?: () => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  url,
  fileName,
  type,
  onDownload,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const isImage = type?.startsWith('image/') || url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isPdf = type?.includes('pdf') || url.match(/\.pdf$/i);

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'document';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  return (
    <>
      <div
        className="relative w-full h-48 border border-border rounded-lg overflow-hidden cursor-pointer group"
        onClick={() => setIsOpen(true)}
      >
        {isImage ? (
          <Image
            src={url}
            alt={fileName || 'Preview'}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <div className="text-center">
              <p className="font-inter text-sm text-muted-foreground mb-2">
                {fileName || 'Document'}
              </p>
              <p className="font-open-sans text-xs text-muted-foreground">Click to preview</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="font-inter text-sm text-white">Click to preview</span>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="font-poppins font-semibold">
              {fileName || 'Document Preview'}
            </DialogTitle>
            <DialogDescription className="font-open-sans text-sm">
              Preview document
            </DialogDescription>
          </DialogHeader>
          <div className="relative px-6 pb-6">
            {isImage ? (
              <div className="relative w-full h-[60vh] overflow-auto bg-muted rounded-lg">
                <div
                  className="flex items-center justify-center p-4"
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
                >
                  <Image
                    src={url}
                    alt={fileName || 'Preview'}
                    width={800}
                    height={600}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            ) : isPdf ? (
              <iframe src={url} className="w-full h-[60vh] border rounded-lg" />
            ) : (
              <div className="w-full h-[60vh] flex items-center justify-center bg-muted rounded-lg">
                <p className="font-open-sans text-base text-muted-foreground">
                  Preview not available for this file type
                </p>
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 0.5}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="font-inter text-sm text-muted-foreground min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 3}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleResetZoom}>
                  Reset
                </Button>
              </div>
              <Button variant="default" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
