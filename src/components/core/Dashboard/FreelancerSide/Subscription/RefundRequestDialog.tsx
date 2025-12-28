'use client';

import { AlertCircle, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { uploadSingleImage } from '@/services/imageUploadService';
import refundService, { CreateRefundRequestDto } from '@/services/refundService';
import { getFilePreviewUrl, revokeFilePreviewUrl, validateFile } from '@/utils/fileUpload';

interface RefundRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  invoiceAmount: number;
  onSuccess?: () => void;
}

interface AttachmentFile {
  id: string;
  file: File;
  previewUrl: string;
  url?: string;
  uploading: boolean;
  error?: string;
}

export function RefundRequestDialog({
  isOpen,
  onClose,
  invoiceId,
  invoiceAmount,
  onSuccess,
}: RefundRequestDialogProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [attachmentFiles, setAttachmentFiles] = useState<AttachmentFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxFiles = 5;

  const handleImageSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);

      // Check if adding these files would exceed maxFiles
      if (attachmentFiles.length + fileArray.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Validate files
      const validFiles: File[] = [];
      for (const file of fileArray) {
        const validation = validateFile(file, {
          maxSize: 5 * 1024 * 1024, // 5MB
          allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
        });
        if (!validation.valid) {
          toast.error(validation.error || `Invalid file: ${file.name}`);
          continue;
        }
        validFiles.push(file);
      }

      if (validFiles.length === 0) return;

      // Create preview objects
      const newFiles: AttachmentFile[] = validFiles.map((file) => ({
        id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        file,
        previewUrl: getFilePreviewUrl(file),
        uploading: false,
      }));

      setAttachmentFiles((prev) => [...prev, ...newFiles]);
    },
    [attachmentFiles.length],
  );

  const handleRemoveAttachment = (id: string) => {
    setAttachmentFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.previewUrl && !file.url) {
        // Revoke preview URL if it's a local preview
        revokeFilePreviewUrl(file.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for the refund');
      return;
    }

    setIsSubmitting(true);

    try {
      // Automatically upload any files that haven't been uploaded yet
      const filesToUpload = attachmentFiles.filter((f) => !f.url && !f.uploading && !f.error);

      if (filesToUpload.length > 0) {
        // Mark files as uploading
        setAttachmentFiles((prev) =>
          prev.map((f) =>
            filesToUpload.some((ftu) => ftu.id === f.id) ? { ...f, uploading: true } : f,
          ),
        );

        // Upload all pending files
        const uploadPromises = filesToUpload.map(async (attachmentFile) => {
          try {
            const result = await uploadSingleImage(attachmentFile.file);
            if (result.success && result.url) {
              return { id: attachmentFile.id, url: result.url, error: undefined };
            } else {
              return {
                id: attachmentFile.id,
                url: undefined,
                error: result.error || 'Upload failed',
              };
            }
          } catch (error) {
            return {
              id: attachmentFile.id,
              url: undefined,
              error: error instanceof Error ? error.message : 'Upload failed',
            };
          }
        });

        const results = await Promise.all(uploadPromises);

        // Update files with URLs or errors
        let updatedFiles: AttachmentFile[] = [];
        setAttachmentFiles((prev) => {
          updatedFiles = prev.map((f) => {
            const result = results.find((r) => r.id === f.id);
            if (result) {
              if (result.url) {
                // Revoke preview URL and use uploaded URL
                revokeFilePreviewUrl(f.previewUrl);
                return { ...f, url: result.url, uploading: false, previewUrl: result.url };
              } else {
                return { ...f, uploading: false, error: result.error };
              }
            }
            return f;
          });
          return updatedFiles;
        });

        // Check for upload errors
        const hasErrors = results.some((r) => !r.url);
        if (hasErrors) {
          const errorCount = results.filter((r) => !r.url).length;
          toast.error(`${errorCount} image(s) failed to upload. Please remove them and try again.`);
          setIsSubmitting(false);
          return;
        }

        const successCount = results.filter((r) => r.url).length;
        if (successCount > 0) {
          toast.success(`${successCount} image(s) uploaded successfully`);
        }

        // Get all successfully uploaded URLs from updated files
        const uploadedUrls = updatedFiles.filter((f) => f.url).map((f) => f.url!);

        // Submit the refund request
        const data: CreateRefundRequestDto = {
          invoiceId,
          amount: invoiceAmount, // Auto-select from invoice
          reason: reason.trim(),
          description: description.trim() || undefined,
          attachments: uploadedUrls.length > 0 ? uploadedUrls : undefined,
        };

        const response = await refundService.create(data);
        if (response.success) {
          toast.success('Refund request submitted successfully');
          onSuccess?.();
          handleClose();
        } else {
          toast.error(response.message || 'Failed to submit refund request');
        }
      } else {
        // No files to upload, get existing URLs
        const uploadedUrls = attachmentFiles.filter((f) => f.url).map((f) => f.url!);

        // Submit the refund request
        const data: CreateRefundRequestDto = {
          invoiceId,
          amount: invoiceAmount, // Auto-select from invoice
          reason: reason.trim(),
          description: description.trim() || undefined,
          attachments: uploadedUrls.length > 0 ? uploadedUrls : undefined,
        };

        const response = await refundService.create(data);
        if (response.success) {
          toast.success('Refund request submitted successfully');
          onSuccess?.();
          handleClose();
        } else {
          toast.error(response.message || 'Failed to submit refund request');
        }
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to submit refund request';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Clean up preview URLs
    attachmentFiles.forEach((f) => {
      if (f.previewUrl && !f.url) {
        revokeFilePreviewUrl(f.previewUrl);
      }
    });

    setReason('');
    setDescription('');
    setAttachmentFiles([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-poppins font-bold">Request Refund</DialogTitle>
          <DialogDescription>
            Submit a refund request for invoice {invoiceId}. An admin will review your request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Invoice Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Invoice Amount: <strong>EUR {invoiceAmount.toFixed(2)}</strong>
            </AlertDescription>
          </Alert>

          {/* Refund Amount - Read Only */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-semibold">
              Refund Amount (EUR) *
            </Label>
            <Input
              id="amount"
              type="text"
              value={`EUR ${invoiceAmount.toFixed(2)}`}
              readOnly
              disabled
              className="w-full bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">
              Refund amount is automatically set based on your invoice
            </p>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-sm font-semibold">
              Reason for Refund *
            </Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Service not provided, Technical issue"
              className="w-full"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              Detailed Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide additional details about your refund request..."
              rows={4}
              className="w-full"
            />
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Attachments (Optional)</Label>
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                multiple
                onChange={(e) => {
                  handleImageSelect(e.target.files);
                  // Reset input to allow selecting the same file again
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting || attachmentFiles.length >= maxFiles}
                className="w-full"
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Select Images ({attachmentFiles.length}/{maxFiles})
              </Button>

              {/* Preview Attachments */}
              {attachmentFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {attachmentFiles.map((attachment) => (
                    <div key={attachment.id} className="relative group">
                      <div className="aspect-square rounded-md border overflow-hidden bg-gray-100">
                        <img
                          src={attachment.url || attachment.previewUrl}
                          alt="Attachment preview"
                          className="w-full h-full object-cover"
                        />
                        {attachment.uploading && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                          </div>
                        )}
                        {attachment.error && (
                          <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center p-2">
                            <p className="text-xs text-white text-center">{attachment.error}</p>
                          </div>
                        )}
                        {attachment.url && (
                          <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">
                            Uploaded
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(attachment.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleRemoveAttachment(attachment.id);
                          }
                        }}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        title="Remove image"
                        aria-label="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Select images to support your refund request (max {maxFiles} images, 5MB each). Images
              will be automatically uploaded when you submit the request.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !reason.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
