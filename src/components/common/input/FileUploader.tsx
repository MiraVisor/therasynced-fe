'use client';

import { File, FileText, Image as ImageIcon, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  acceptedTypes?: string;
  maxSize?: number; // in bytes
  currentFile?: string | null; // Current file URL if any
  isLoading?: boolean;
  label?: string;
  description?: string;
  variant?: 'image' | 'document';
}

export const FileUploader = ({
  onFileSelect,
  onRemove,
  acceptedTypes = 'image/jpeg,image/jpg,image/png,image/webp,application/pdf',
  maxSize = 5 * 1024 * 1024, // 5MB default
  currentFile,
  isLoading = false,
  label = 'Upload file',
  description = 'Drag and drop or click to upload',
  variant = 'document',
}: FileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) return;

    setError(null);

    // Check file type
    const acceptedTypesArray = acceptedTypes.split(',').map((type) => type.trim());
    const fileType = file.type;
    if (!acceptedTypesArray.includes(fileType)) {
      setError(`File type not supported. Accepted types: ${acceptedTypes}`);
      return;
    }

    // Check file size
    if (file.size > maxSize) {
      setError(`File is too large. Maximum size: ${(maxSize / (1024 * 1024)).toFixed(0)}MB`);
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const getFileIcon = () => {
    if (!currentFile) return null;

    if (currentFile.includes('.pdf')) {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    if (currentFile.includes('image') || currentFile.match(/\.(jpg|jpeg|png|webp)$/i)) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
    }
    return <File className="h-8 w-8 text-gray-500" />;
  };

  return (
    <div className="space-y-3">
      <div>
        {label && <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>}
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>

      <div
        className={`
          border-2 border-dashed rounded-lg p-6 transition-colors
          ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'}
          ${currentFile ? 'border-solid bg-gray-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {currentFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {getFileIcon()}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {currentFile.split('/').pop()}
                </p>
                <p className="text-xs text-gray-500">File uploaded</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              disabled={isLoading}
              className="ml-3"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-4">
            <LoadingSpinner />
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-2">
              {description || 'Drag and drop or click to upload'}
            </p>
            <Button type="button" variant="outline" onClick={handleClick}>
              Select File
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Max size: {(maxSize / (1024 * 1024)).toFixed(0)}MB
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes}
        onChange={handleInputChange}
        className="hidden"
      />

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
          {error}
        </div>
      )}
    </div>
  );
};
