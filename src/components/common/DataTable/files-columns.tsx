'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Award, Eye, File, FileText, Image as ImageIcon, Shield, Trash2, User } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FreelancerFile, FreelancerFileType } from '@/types/types';
import { formatFileSize } from '@/utils/fileUpload';

// Get file type icon
const getFileTypeIconComponent = (fileType: FreelancerFileType) => {
  switch (fileType) {
    case 'CERTIFICATE':
      return <Award className="h-4 w-4 text-green-600" />;
    case 'VERIFICATION_DOCUMENT':
      return <Shield className="h-4 w-4 text-blue-600" />;
    case 'PROFILE_PICTURE':
      return <User className="h-4 w-4 text-purple-600" />;
    default:
      return <File className="h-4 w-4 text-gray-600" />;
  }
};

// Get file type badge
const getFileTypeBadge = (fileType: FreelancerFileType) => {
  switch (fileType) {
    case 'CERTIFICATE':
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Certificate
        </Badge>
      );
    case 'VERIFICATION_DOCUMENT':
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          Document
        </Badge>
      );
    case 'PROFILE_PICTURE':
      return (
        <Badge variant="secondary" className="bg-purple-100 text-purple-800">
          Profile
        </Badge>
      );
    default:
      return <Badge variant="outline">Other</Badge>;
  }
};

// Get file icon based on MIME type (if available)
const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
    return <ImageIcon className="h-4 w-4 text-blue-500" />;
  } else if (extension === 'pdf') {
    return <FileText className="h-4 w-4 text-red-500" />;
  } else {
    return <FileText className="h-4 w-4 text-gray-500" />;
  }
};

export const createFilesColumns = (
  onDeleteFile?: (fileUrl: string, fileType: string) => void,
): ColumnDef<FreelancerFile>[] => [
  {
    accessorKey: 'fileName',
    header: 'File Name',
    cell: ({ row }) => {
      const file = row.original;
      return (
        <div className="flex items-center space-x-3">
          {getFileIcon(file.fileName)}
          <div className="flex flex-col">
            <span className="font-medium text-sm truncate max-w-[200px]" title={file.fileName}>
              {file.fileName}
            </span>
            <span className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'fileType',
    header: 'Type',
    cell: ({ row }) => {
      const fileType = row.getValue('fileType');
      return (
        <div className="flex items-center space-x-2">
          {getFileTypeIconComponent(fileType)}
          {getFileTypeBadge(fileType)}
        </div>
      );
    },
  },
  {
    accessorKey: 'uploadedAt',
    header: 'Upload Date',
    cell: ({ row }) => {
      const date = new Date(row.getValue('uploadedAt'));
      return (
        <div className="text-sm">
          <div>{date.toLocaleDateString()}</div>
          <div className="text-xs text-gray-500">{date.toLocaleTimeString()}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status');
      if (!status) {
        return <Badge variant="outline">No Status</Badge>;
      }

      switch (status.toUpperCase()) {
        case 'APPROVED':
          return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
        case 'PENDING':
          return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
        case 'REJECTED':
          return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
        default:
          return <Badge variant="outline">{status}</Badge>;
      }
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const file = row.original;

      return (
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(file.url, '_blank')}
            title="View file"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {onDeleteFile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteFile(file.url, file.fileType)}
              title="Delete file"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    },
  },
];
