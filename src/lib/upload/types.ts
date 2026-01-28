/**
 * Upload Service Types
 * Comprehensive type definitions for file upload system
 */

export type FileCategory = 
  | 'avatar'
  | 'document'
  | 'image'
  | 'attachment'
  | 'logo'
  | 'cover';

export type UploadStatus = 
  | 'idle'
  | 'selecting'
  | 'validating'
  | 'uploading'
  | 'processing'
  | 'success'
  | 'error';

export interface FileValidationRules {
  maxSize: number; // in bytes
  allowedTypes: string[];
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number; // width / height
  aspectRatioTolerance?: number; // percentage tolerance
}

export interface UploadConfig {
  category: FileCategory;
  validation: FileValidationRules;
  endpoint: string;
  generateThumbnail?: boolean;
  thumbnailSize?: { width: number; height: number };
  autoResize?: boolean;
  resizeTo?: { maxWidth: number; maxHeight: number; quality: number };
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed: number; // bytes per second
  remainingTime: number; // seconds
}

export interface UploadResult {
  success: boolean;
  url?: string;
  thumbnailUrl?: string;
  fileId?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  error?: string;
  errorCode?: string;
}

export interface ProcessedFile {
  file: File;
  preview: string;
  width?: number;
  height?: number;
  isValid: boolean;
  validationErrors: string[];
}

export interface ImageCropData {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
}

// Preset configurations for different use cases
export const UPLOAD_PRESETS: Record<FileCategory, UploadConfig> = {
  avatar: {
    category: 'avatar',
    validation: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      minWidth: 100,
      minHeight: 100,
      maxWidth: 4096,
      maxHeight: 4096,
      aspectRatio: 1,
      aspectRatioTolerance: 10,
    },
    endpoint: '/api/upload/avatar',
    generateThumbnail: true,
    thumbnailSize: { width: 150, height: 150 },
    autoResize: true,
    resizeTo: { maxWidth: 512, maxHeight: 512, quality: 0.9 },
  },
  document: {
    category: 'document',
    validation: {
      maxSize: 25 * 1024 * 1024, // 25MB
      allowedTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
      ],
    },
    endpoint: '/api/upload/document',
  },
  image: {
    category: 'image',
    validation: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      minWidth: 50,
      minHeight: 50,
      maxWidth: 8192,
      maxHeight: 8192,
    },
    endpoint: '/api/upload/image',
    generateThumbnail: true,
    thumbnailSize: { width: 300, height: 300 },
  },
  attachment: {
    category: 'attachment',
    validation: {
      maxSize: 50 * 1024 * 1024, // 50MB
      allowedTypes: [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'application/pdf',
        'application/zip',
        'application/x-rar-compressed',
        'text/plain',
        'text/csv',
      ],
    },
    endpoint: '/api/upload/attachment',
  },
  logo: {
    category: 'logo',
    validation: {
      maxSize: 2 * 1024 * 1024, // 2MB
      allowedTypes: ['image/png', 'image/svg+xml', 'image/webp'],
      minWidth: 50,
      minHeight: 50,
      maxWidth: 2048,
      maxHeight: 2048,
    },
    endpoint: '/api/upload/logo',
    autoResize: true,
    resizeTo: { maxWidth: 512, maxHeight: 512, quality: 0.95 },
  },
  cover: {
    category: 'cover',
    validation: {
      maxSize: 8 * 1024 * 1024, // 8MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      minWidth: 800,
      minHeight: 200,
      aspectRatio: 4, // 4:1 ratio
      aspectRatioTolerance: 20,
    },
    endpoint: '/api/upload/cover',
    autoResize: true,
    resizeTo: { maxWidth: 1920, maxHeight: 480, quality: 0.85 },
  },
};
