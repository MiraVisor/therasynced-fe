'use client';

import { AlertCircle, CheckCircle, FileText, Image as ImageIcon, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  deleteFile,
  type FileUploadOptions,
  formatFileSize,
  getFilePreviewUrl,
  isImageFile,
  isPdfFile,
  revokeFilePreviewUrl,
  uploadMultipleFiles,
  type UploadResult,
  validateFile,
} from '@/utils/fileUpload';

export interface FileUploadProps {
  multiple?: boolean;
  maxFiles?: number;
  options?: FileUploadOptions;
  onUpload?: (results: UploadResult[]) => void;
  onRemove?: (fileId: string) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  acceptedFileTypes?: string;
}

interface UploadedFile {
  id: string;
  file: File;
  url?: string;
  previewUrl: string;
  uploading: boolean;
  progress: number;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  multiple = false,
  maxFiles = 5,
  options = {},
  onUpload,
  onRemove,
  onError,
  className,
  disabled = false,
  placeholder = 'Click to upload or drag and drop',
  acceptedFileTypes = '.jpg,.jpeg,.png,.pdf',
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);

      // Check if adding these files would exceed maxFiles
      if (uploadedFiles.length + fileArray.length > maxFiles) {
        onError?.(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Validate files
      for (const file of fileArray) {
        const validation = validateFile(file, options);
        if (!validation.valid) {
          onError?.(validation.error || 'Invalid file');
          return;
        }
      }

      setIsUploading(true);

      // Create file objects for UI
      const newFiles: UploadedFile[] = fileArray.map((file) => ({
        id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        file,
        previewUrl: getFilePreviewUrl(file),
        uploading: true,
        progress: 0,
      }));

      setUploadedFiles((prev) => [...prev, ...newFiles]);

      try {
        // Upload files
        const uploadResults = await uploadMultipleFiles(
          fileArray,
          options,
          (fileIndex, progress) => {
            setUploadedFiles((prev) =>
              prev.map((f, index) => {
                const newFileIndex = prev.length - fileArray.length + fileIndex;
                if (index === newFileIndex) {
                  return { ...f, progress: progress.percentage };
                }
                return f;
              }),
            );
          },
        );

        // Update files with results
        setUploadedFiles((prev) =>
          prev.map((file, index) => {
            const resultIndex = index - (prev.length - fileArray.length);
            const result = uploadResults[resultIndex];

            if (result?.success) {
              return {
                ...file,
                uploading: false,
                url: result.url,
                progress: 100,
              };
            } else if (result) {
              return {
                ...file,
                uploading: false,
                error: result.error,
                progress: 0,
              };
            }
            return file;
          }),
        );

        // Call onUpload with results
        onUpload?.(uploadResults);
      } catch (error) {
        console.error('Upload error:', error);
        onError?.(error instanceof Error ? error.message : 'Upload failed');

        // Mark all files as failed
        setUploadedFiles((prev) =>
          prev.map((file) => ({
            ...file,
            uploading: false,
            error: 'Upload failed',
            progress: 0,
          })),
        );
      } finally {
        setIsUploading(false);
      }
    },
    [uploadedFiles.length, maxFiles, options, onUpload, onError],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (disabled) return;

      const { files } = e.dataTransfer;
      handleFileSelect(files);
    },
    [disabled, handleFileSelect],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files);
    },
    [handleFileSelect],
  );

  const handleRemoveFile = useCallback(
    async (fileId: string) => {
      const file = uploadedFiles.find((f) => f.id === fileId);
      if (!file) return;

      // Revoke preview URL to free memory
      revokeFilePreviewUrl(file.previewUrl);

      // If file was successfully uploaded, delete from server
      if (file.url) {
        try {
          await deleteFile(fileId);
          onRemove?.(fileId);
        } catch (error) {
          console.error('Delete error:', error);
          onError?.(error instanceof Error ? error.message : 'Delete failed');
        }
      }

      // Remove from local state
      setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
    },
    [uploadedFiles, onRemove, onError],
  );

  // Unused variable removed - was: const _canAddMoreFiles = uploadedFiles.length < maxFiles;

  return (
    <div className={cn('w-full', className)}>
      {/* Upload Area */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors',
          isDragOver && !disabled
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-pointer',
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple={multiple}
          accept={acceptedFileTypes}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-900">{placeholder}</p>
            <p className="text-xs text-gray-500 mt-1">
              {acceptedFileTypes} up to {formatFileSize(options.maxSize || 5 * 1024 * 1024)}
            </p>
            {multiple && <p className="text-xs text-gray-500 mt-1">Maximum {maxFiles} files</p>}
          </div>
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {/* File Icon */}
                <div className="flex-shrink-0">
                  {isImageFile(file.file.type) ? (
                    <ImageIcon className="h-8 w-8 text-blue-500" />
                  ) : isPdfFile(file.file.type) ? (
                    <FileText className="h-8 w-8 text-red-500" />
                  ) : (
                    <FileText className="h-8 w-8 text-gray-500" />
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.file.size)}</p>

                  {/* Progress Bar */}
                  {file.uploading && (
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-primary h-1 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{file.progress}% uploaded</p>
                    </div>
                  )}

                  {/* Error Message */}
                  {file.error && (
                    <div className="flex items-center mt-1">
                      <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                      <p className="text-xs text-red-600">{file.error}</p>
                    </div>
                  )}

                  {/* Success Message */}
                  {file.url && !file.uploading && (
                    <div className="flex items-center mt-1">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      <p className="text-xs text-green-600">Uploaded successfully</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Remove Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(file.id);
                }}
                disabled={file.uploading}
                className="flex-shrink-0 text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Status */}
      {isUploading && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">Uploading files...</p>
        </div>
      )}
    </div>
  );
};
