'use client';

import * as React from 'react';
import { Upload, X } from 'lucide-react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/utils/fileUpload';

interface FileUploadProps {
  maxFiles?: number;
  maxSize?: number;
  value: File[];
  onValueChange: (files: File[]) => void;
  onFileReject?: (file: File, message: string) => void;
  multiple?: boolean;
  accept?: string;
  className?: string;
  disabled?: boolean;
  fileTitles?: string[];
  onTitlesChange?: (titles: string[]) => void;
  showTitles?: boolean;
}

export function FileUpload({
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  value,
  onValueChange,
  onFileReject,
  multiple = true,
  accept = '.jpg,.jpeg,.png,.pdf',
  className,
  disabled = false,
  fileTitles = [],
  onTitlesChange,
  showTitles = true,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = React.useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);

      // Check max files
      if (value.length + fileArray.length > maxFiles) {
        const message = `Maximum ${maxFiles} files allowed. You tried to add ${fileArray.length} file(s), but only ${maxFiles - value.length} slot(s) remaining.`;
        toast.error(message);
        if (onFileReject) {
          fileArray.forEach((file) => onFileReject(file, message));
        }
        return;
      }

      // Validate each file
      const validFiles: File[] = [];
      fileArray.forEach((file) => {
        // Check file size
        if (file.size > maxSize) {
          const message = `File "${file.name}" exceeds ${formatFileSize(maxSize)} limit`;
          toast.error(message);
          if (onFileReject) {
            onFileReject(file, message);
          }
          return;
        }

        // Check file type
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        const acceptedTypes = accept.split(',').map((t) => t.trim().toLowerCase());
        if (!acceptedTypes.some((type) => fileExtension.includes(type.replace('.', '')))) {
          const message = `File "${file.name}" is not an accepted type. Accepted: ${accept}`;
          toast.error(message);
          if (onFileReject) {
            onFileReject(file, message);
          }
          return;
        }

        validFiles.push(file);
      });

      if (validFiles.length > 0) {
        const newFiles = [...value, ...validFiles];
        onValueChange(newFiles);

        // Initialize titles for new files
        if (showTitles && onTitlesChange) {
          const newTitles = validFiles.map((file) =>
            file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          );
          onTitlesChange([...fileTitles, ...newTitles]);
        }
      }
    },
    [
      value,
      maxFiles,
      maxSize,
      accept,
      onValueChange,
      onFileReject,
      fileTitles,
      onTitlesChange,
      showTitles,
    ],
  );

  const handleDragOver = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (!disabled) {
        handleFileSelect(e.dataTransfer.files);
      }
    },
    [disabled, handleFileSelect],
  );

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files);
      // Reset input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFileSelect],
  );

  const handleRemoveFile = React.useCallback(
    (index: number) => {
      const newFiles = value.filter((_, i) => i !== index);
      onValueChange(newFiles);
      if (showTitles && onTitlesChange) {
        const newTitles = fileTitles.filter((_, i) => i !== index);
        onTitlesChange(newTitles);
      }
    },
    [value, fileTitles, onValueChange, onTitlesChange, showTitles],
  );

  const handleTitleChange = React.useCallback(
    (index: number, title: string) => {
      if (onTitlesChange) {
        const newTitles = [...fileTitles];
        newTitles[index] = title;
        onTitlesChange(newTitles);
      }
    },
    [fileTitles, onTitlesChange],
  );

  const canAddMore = value.length < maxFiles;

  const handleDropzoneClick = React.useCallback(() => {
    if (!disabled && canAddMore) {
      fileInputRef.current?.click();
    }
  }, [disabled, canAddMore]);

  return (
    <div className={cn('w-full', className)}>
      <FileUploadDropzone
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        isDragOver={isDragOver}
        disabled={disabled || !canAddMore}
        onClick={handleDropzoneClick}
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="flex items-center justify-center rounded-full border p-2.5">
            <Upload className="size-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-sm">Drag & drop files here</p>
          <p className="text-muted-foreground text-xs">
            Or click to browse (max {maxFiles} files, up to {formatFileSize(maxSize)} each)
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || !canAddMore}
        />
      </FileUploadDropzone>

      {value.length > 0 && (
        <FileUploadList>
          {value.map((file, index) => (
            <FileUploadItem key={index} file={file}>
              <FileUploadItemPreview file={file} />
              <FileUploadItemMetadata file={file} />
              {showTitles && (
                <div className="mt-2">
                  <Input
                    value={fileTitles[index] || ''}
                    onChange={(e) => handleTitleChange(index, e.target.value)}
                    placeholder={`Enter title for ${file.name}`}
                    className="text-sm"
                  />
                </div>
              )}
              <FileUploadItemDelete asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => handleRemoveFile(index)}
                >
                  <X />
                </Button>
              </FileUploadItemDelete>
            </FileUploadItem>
          ))}
        </FileUploadList>
      )}
    </div>
  );
}

interface FileUploadDropzoneProps {
  children: React.ReactNode;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  isDragOver: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

function FileUploadDropzone({
  children,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragOver,
  disabled,
  onClick,
}: FileUploadDropzoneProps) {
  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-lg p-8 transition-colors',
        isDragOver && !disabled ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'cursor-pointer hover:border-primary/50',
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface FileUploadTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  onClick?: () => void;
}

function FileUploadTrigger({ children, asChild, onClick }: FileUploadTriggerProps) {
  if (asChild) {
    return <>{children}</>;
  }
  return <div onClick={onClick}>{children}</div>;
}

interface FileUploadListProps {
  children: React.ReactNode;
}

function FileUploadList({ children }: FileUploadListProps) {
  return <div className="mt-4 space-y-2">{children}</div>;
}

interface FileUploadItemProps {
  children: React.ReactNode;
  file: File;
}

function FileUploadItem({ children, file }: FileUploadItemProps) {
  return <div className="flex items-start gap-3 rounded-lg border p-3 bg-card">{children}</div>;
}

interface FileUploadItemPreviewProps {
  file: File;
}

function FileUploadItemPreview({ file }: FileUploadItemPreviewProps) {
  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');

  if (isImage) {
    const previewUrl = URL.createObjectURL(file);
    return (
      <div className="flex-shrink-0">
        <img
          src={previewUrl}
          alt={file.name}
          className="h-12 w-12 rounded object-cover"
          onLoad={() => URL.revokeObjectURL(previewUrl)}
        />
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded bg-muted">
      {isPdf ? (
        <Upload className="h-6 w-6 text-muted-foreground" />
      ) : (
        <Upload className="h-6 w-6 text-muted-foreground" />
      )}
    </div>
  );
}

interface FileUploadItemMetadataProps {
  file: File;
}

function FileUploadItemMetadata({ file }: FileUploadItemMetadataProps) {
  return (
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate">{file.name}</p>
      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
    </div>
  );
}

interface FileUploadItemDeleteProps {
  children: React.ReactNode;
  asChild?: boolean;
}

function FileUploadItemDelete({ children, asChild }: FileUploadItemDeleteProps) {
  if (asChild) {
    return <>{children}</>;
  }
  return <div>{children}</div>;
}
