"use client";

/**
 * File Upload Component
 * Professional drag & drop file upload with preview and progress
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { UploadService, UploadProgress, UploadResult, ProcessedFile, FileCategory } from '@/lib/upload';

// Icons
const UploadCloudIcon = () => (
  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const FileIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ImageIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface FileItem {
  id: string;
  file: File;
  preview?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  result?: UploadResult;
  error?: string;
}

interface FileUploadProps {
  category?: FileCategory;
  multiple?: boolean;
  maxFiles?: number;
  onUpload?: (results: UploadResult[]) => void;
  onRemove?: (fileId: string) => void;
  disabled?: boolean;
  language?: 'en' | 'ar';
  showList?: boolean;
  compact?: boolean;
  className?: string;
  acceptedTypes?: string;
}

const TRANSLATIONS = {
  en: {
    dragDrop: 'Drag & drop files here',
    or: 'or',
    browse: 'Browse Files',
    supportedFormats: 'Supported formats',
    maxSize: 'Max size',
    uploading: 'Uploading',
    processing: 'Processing',
    uploaded: 'Uploaded',
    failed: 'Failed',
    remove: 'Remove',
    retry: 'Retry',
    cancel: 'Cancel',
    files: 'files',
    file: 'file',
  },
  ar: {
    dragDrop: 'اسحب وأفلت الملفات هنا',
    or: 'أو',
    browse: 'تصفح الملفات',
    supportedFormats: 'الصيغ المدعومة',
    maxSize: 'الحد الأقصى',
    uploading: 'جاري الرفع',
    processing: 'جاري المعالجة',
    uploaded: 'تم الرفع',
    failed: 'فشل',
    remove: 'حذف',
    retry: 'إعادة المحاولة',
    cancel: 'إلغاء',
    files: 'ملفات',
    file: 'ملف',
  },
};

export function FileUpload({
  category = 'attachment',
  multiple = false,
  maxFiles = 10,
  onUpload,
  onRemove,
  disabled = false,
  language = 'en',
  showList = true,
  compact = false,
  className = '',
  acceptedTypes,
}: FileUploadProps) {
  const t = TRANSLATIONS[language];
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadService] = useState(() => new UploadService(category, language));
  
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const getAcceptedTypes = () => {
    if (acceptedTypes) return acceptedTypes;
    // Get from upload service config
    return undefined;
  };

  const handleFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    
    const newFiles: FileItem[] = [];
    const filesToProcess = Array.from(fileList).slice(0, multiple ? maxFiles - files.length : 1);
    
    for (const file of filesToProcess) {
      const id = generateId();
      const isImage = UploadService.isImage(file);
      
      const fileItem: FileItem = {
        id,
        file,
        preview: isImage ? URL.createObjectURL(file) : undefined,
        status: 'pending',
        progress: 0,
      };
      
      newFiles.push(fileItem);
    }
    
    if (!multiple) {
      // Clear existing files for single upload
      files.forEach(f => f.preview && URL.revokeObjectURL(f.preview));
      setFiles(newFiles);
    } else {
      setFiles(prev => [...prev, ...newFiles]);
    }
    
    // Start uploading
    for (const fileItem of newFiles) {
      await uploadFile(fileItem);
    }
  }, [files, multiple, maxFiles]);

  const uploadFile = async (fileItem: FileItem) => {
    setFiles(prev => prev.map(f => 
      f.id === fileItem.id ? { ...f, status: 'uploading' } : f
    ));
    
    try {
      const result = await uploadService.upload(fileItem.file, (progress) => {
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, progress: progress.percentage } : f
        ));
      });
      
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: result.success ? 'success' : 'error', result, error: result.error, progress: 100 }
          : f
      ));
      
      if (result.success) {
        onUpload?.([result]);
      }
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id 
          ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' }
          : f
      ));
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  }, [disabled, handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = '';
  }, [handleFiles]);

  const handleRemoveFile = useCallback((fileId: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter(f => f.id !== fileId);
    });
    onRemove?.(fileId);
  }, [onRemove]);

  const handleRetry = useCallback((fileItem: FileItem) => {
    uploadFile(fileItem);
  }, []);

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      files.forEach(f => f.preview && URL.revokeObjectURL(f.preview));
    };
  }, []);

  const formatFileSize = (bytes: number) => UploadService.formatFileSize(bytes);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-xl transition-all
          ${isDragOver 
            ? 'border-[var(--primary)] bg-[var(--primary)]/5' 
            : 'border-[var(--card-border)] hover:border-[var(--primary)]/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${compact ? 'p-4' : 'p-8'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className={`text-[var(--foreground-muted)] ${isDragOver ? 'scale-110' : ''} transition-transform`}>
            <UploadCloudIcon />
          </div>
          
          <p className={`mt-2 text-[var(--foreground)] font-medium ${compact ? 'text-sm' : ''}`}>
            {t.dragDrop}
          </p>
          
          <p className={`text-[var(--foreground-muted)] ${compact ? 'text-xs' : 'text-sm'}`}>
            {t.or}{' '}
            <span className="text-[var(--primary)] hover:underline">
              {t.browse}
            </span>
          </p>
          
          {!compact && (
            <p className="mt-2 text-xs text-[var(--foreground-muted)]">
              {t.maxSize}: {formatFileSize(50 * 1024 * 1024)}
            </p>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptedTypes()}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />
      </div>

      {/* File list */}
      {showList && files.length > 0 && (
        <div className="space-y-2">
          {files.map((fileItem) => (
            <div
              key={fileItem.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--card-border)]"
            >
              {/* Preview/Icon */}
              <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-[var(--card)] flex items-center justify-center">
                {fileItem.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={fileItem.preview}
                    alt={fileItem.file.name}
                    className="w-full h-full object-cover"
                  />
                ) : UploadService.isImage(fileItem.file) ? (
                  <span className="text-[var(--primary)]"><ImageIcon /></span>
                ) : (
                  <span className="text-[var(--foreground-muted)]"><FileIcon /></span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--foreground)] truncate">
                  {fileItem.file.name}
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  {formatFileSize(fileItem.file.size)}
                </p>
                
                {/* Progress bar */}
                {fileItem.status === 'uploading' && (
                  <div className="mt-2 h-1.5 w-full bg-[var(--card-border)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--primary)] rounded-full transition-all duration-300"
                      style={{ width: `${fileItem.progress}%` }}
                    />
                  </div>
                )}
                
                {/* Error message */}
                {fileItem.status === 'error' && fileItem.error && (
                  <p className="mt-1 text-xs text-[var(--error)]">{fileItem.error}</p>
                )}
              </div>

              {/* Status/Actions */}
              <div className="flex-shrink-0 flex items-center gap-2">
                {fileItem.status === 'uploading' && (
                  <span className="text-xs text-[var(--foreground-muted)]">
                    {fileItem.progress}%
                  </span>
                )}
                
                {fileItem.status === 'success' && (
                  <span className="text-[var(--success)]">
                    <CheckCircleIcon />
                  </span>
                )}
                
                {fileItem.status === 'error' && (
                  <>
                    <span className="text-[var(--error)]">
                      <XCircleIcon />
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRetry(fileItem); }}
                      className="text-xs text-[var(--primary)] hover:underline"
                    >
                      {t.retry}
                    </button>
                  </>
                )}
                
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemoveFile(fileItem.id); }}
                  className="p-1.5 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
