"use client";

/**
 * Avatar Upload Component
 * Professional avatar/profile picture upload with preview, crop, and validation
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { UploadService, UploadProgress, UploadResult, ProcessedFile } from '@/lib/upload';

// Icons
const CameraIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h4l2-3h6l2 3h4v12H3V7zm9 9a4 4 0 100-8 4 4 0 000 8z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ZoomInIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
  </svg>
);

const ZoomOutIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
  </svg>
);

const RotateIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

interface AvatarUploadProps {
  currentImage?: string;
  initials?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onUpload?: (result: UploadResult) => void;
  onRemove?: () => void;
  disabled?: boolean;
  language?: 'en' | 'ar';
  showRemoveButton?: boolean;
  className?: string;
}

const TRANSLATIONS = {
  en: {
    uploadPhoto: 'Upload Photo',
    changePhoto: 'Change Photo',
    removePhoto: 'Remove Photo',
    dragOrClick: 'Drag & drop or click to upload',
    supportedFormats: 'JPG, PNG, WebP up to 5MB',
    uploading: 'Uploading...',
    processing: 'Processing...',
    uploadSuccess: 'Upload successful!',
    uploadError: 'Upload failed',
    crop: 'Crop',
    cancel: 'Cancel',
    save: 'Save',
    zoom: 'Zoom',
    rotate: 'Rotate',
    preview: 'Preview',
  },
  ar: {
    uploadPhoto: 'رفع صورة',
    changePhoto: 'تغيير الصورة',
    removePhoto: 'حذف الصورة',
    dragOrClick: 'اسحب وأفلت أو انقر للرفع',
    supportedFormats: 'JPG، PNG، WebP حتى 5 ميجا',
    uploading: 'جاري الرفع...',
    processing: 'جاري المعالجة...',
    uploadSuccess: 'تم الرفع بنجاح!',
    uploadError: 'فشل الرفع',
    crop: 'قص',
    cancel: 'إلغاء',
    save: 'حفظ',
    zoom: 'تكبير',
    rotate: 'تدوير',
    preview: 'معاينة',
  },
};

const SIZE_CLASSES = {
  sm: { container: 'w-16 h-16', button: 'w-6 h-6', text: 'text-lg' },
  md: { container: 'w-24 h-24', button: 'w-8 h-8', text: 'text-2xl' },
  lg: { container: 'w-32 h-32', button: 'w-10 h-10', text: 'text-3xl' },
  xl: { container: 'w-40 h-40', button: 'w-12 h-12', text: 'text-4xl' },
};

export function AvatarUpload({
  currentImage,
  initials = 'U',
  size = 'lg',
  onUpload,
  onRemove,
  disabled = false,
  language = 'en',
  showRemoveButton = true,
  className = '',
}: AvatarUploadProps) {
  const t = TRANSLATIONS[language];
  const sizeClass = SIZE_CLASSES[size];
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadService] = useState(() => new UploadService('avatar', language));
  
  const [status, setStatus] = useState<'idle' | 'selecting' | 'cropping' | 'uploading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>(currentImage || '');
  
  // Crop state
  const [cropImage, setCropImage] = useState<string>('');
  const [cropScale, setCropScale] = useState(1);
  const [cropRotation, setCropRotation] = useState(0);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);
  const processedFileRef = useRef<ProcessedFile | null>(null);

  // Update preview when currentImage changes
  useEffect(() => {
    if (currentImage) {
      setPreviewUrl(currentImage);
    }
  }, [currentImage]);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setStatus('selecting');
    setError('');
    
    try {
      const processed = await uploadService.processFile(file);
      
      if (!processed.isValid) {
        setError(processed.validationErrors.join('\n'));
        setStatus('error');
        return;
      }
      
      processedFileRef.current = processed;
      setCropImage(processed.preview);
      setCropScale(1);
      setCropRotation(0);
      setCropPosition({ x: 0, y: 0 });
      setStatus('cropping');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
      setStatus('error');
    }
  }, [uploadService]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    handleFileSelect(e.dataTransfer.files);
  }, [disabled, handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset input value to allow selecting same file again
    e.target.value = '';
  }, [handleFileSelect]);

  const handleCropMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropPosition.x, y: e.clientY - cropPosition.y });
  }, [cropPosition]);

  const handleCropMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setCropPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleCropMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleSaveCrop = useCallback(async () => {
    if (!processedFileRef.current || !cropCanvasRef.current || !cropImageRef.current) return;
    
    setStatus('uploading');
    
    try {
      const canvas = cropCanvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = cropImageRef.current;
      
      if (!ctx) throw new Error('Canvas context not available');
      
      // Set canvas size (square for avatar)
      const outputSize = 512;
      canvas.width = outputSize;
      canvas.height = outputSize;
      
      // Clear canvas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, outputSize, outputSize);
      
      // Calculate dimensions
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const containerSize = 280; // Match the crop container size
      
      let drawWidth: number, drawHeight: number;
      if (imgAspect > 1) {
        drawHeight = containerSize * cropScale;
        drawWidth = drawHeight * imgAspect;
      } else {
        drawWidth = containerSize * cropScale;
        drawHeight = drawWidth / imgAspect;
      }
      
      // Apply transformations
      ctx.save();
      ctx.translate(outputSize / 2, outputSize / 2);
      ctx.rotate((cropRotation * Math.PI) / 180);
      
      // Map crop position to output size
      const scaleFactor = outputSize / containerSize;
      const offsetX = cropPosition.x * scaleFactor;
      const offsetY = cropPosition.y * scaleFactor;
      
      ctx.drawImage(
        img,
        -drawWidth * scaleFactor / 2 + offsetX,
        -drawHeight * scaleFactor / 2 + offsetY,
        drawWidth * scaleFactor,
        drawHeight * scaleFactor
      );
      ctx.restore();
      
      // Convert to file
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Failed to create blob'))),
          'image/jpeg',
          0.92
        );
      });
      
      const croppedFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      
      // Upload
      const result = await uploadService.upload(croppedFile, setProgress);
      
      if (result.success) {
        setPreviewUrl(result.url || URL.createObjectURL(blob));
        setStatus('success');
        onUpload?.(result);
        
        // Reset after success
        setTimeout(() => {
          setStatus('idle');
          setCropImage('');
        }, 1500);
      } else {
        setError(result.error || t.uploadError);
        setStatus('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.uploadError);
      setStatus('error');
    }
  }, [uploadService, cropScale, cropRotation, cropPosition, onUpload, t.uploadError]);

  const handleCancelCrop = useCallback(() => {
    setCropImage('');
    setStatus('idle');
    if (processedFileRef.current?.preview) {
      URL.revokeObjectURL(processedFileRef.current.preview);
    }
    processedFileRef.current = null;
  }, []);

  const handleRemove = useCallback(() => {
    setPreviewUrl('');
    onRemove?.();
  }, [onRemove]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (processedFileRef.current?.preview) {
        URL.revokeObjectURL(processedFileRef.current.preview);
      }
    };
  }, []);

  // Render crop modal
  if (status === 'cropping' && cropImage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div 
          className="theme-modal w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--card-border)]">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">
              {t.crop}
            </h3>
            <button
              onClick={handleCancelCrop}
              className="p-2 rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--background-secondary)] transition-colors"
            >
              <XIcon />
            </button>
          </div>

          {/* Crop area */}
          <div className="p-4">
            <div
              className="relative w-[280px] h-[280px] mx-auto overflow-hidden rounded-full bg-[var(--background-secondary)] cursor-move"
              onMouseDown={handleCropMouseDown}
              onMouseMove={handleCropMouseMove}
              onMouseUp={handleCropMouseUp}
              onMouseLeave={handleCropMouseUp}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={cropImageRef}
                src={cropImage}
                alt="Crop preview"
                className="absolute pointer-events-none select-none"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) translate(${cropPosition.x}px, ${cropPosition.y}px) scale(${cropScale}) rotate(${cropRotation}deg)`,
                  maxWidth: 'none',
                  minWidth: '100%',
                  minHeight: '100%',
                  objectFit: 'cover',
                }}
                draggable={false}
              />
              
              {/* Overlay guide */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 border-4 border-white/30 rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-px h-full bg-white/20" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-px bg-white/20" />
                </div>
              </div>
            </div>

            {/* Hidden canvas for processing */}
            <canvas ref={cropCanvasRef} className="hidden" />

            {/* Controls */}
            <div className="mt-4 space-y-3">
              {/* Zoom */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCropScale(Math.max(0.5, cropScale - 0.1))}
                  className="p-2 rounded-lg bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--card-hover)] transition-colors"
                >
                  <ZoomOutIcon />
                </button>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={cropScale}
                  onChange={(e) => setCropScale(parseFloat(e.target.value))}
                  className="flex-1 h-2 rounded-full appearance-none bg-[var(--background-secondary)] accent-[var(--primary)]"
                />
                <button
                  onClick={() => setCropScale(Math.min(3, cropScale + 0.1))}
                  className="p-2 rounded-lg bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--card-hover)] transition-colors"
                >
                  <ZoomInIcon />
                </button>
              </div>

              {/* Rotate */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCropRotation(cropRotation - 90)}
                  className="p-2 rounded-lg bg-[var(--background-secondary)] text-[var(--foreground-secondary)] hover:bg-[var(--card-hover)] transition-colors"
                >
                  <RotateIcon />
                </button>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={cropRotation}
                  onChange={(e) => setCropRotation(parseInt(e.target.value))}
                  className="flex-1 h-2 rounded-full appearance-none bg-[var(--background-secondary)] accent-[var(--primary)]"
                />
                <span className="text-sm text-[var(--foreground-muted)] w-12 text-center">
                  {cropRotation}°
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-[var(--card-border)]">
            <button
              onClick={handleCancelCrop}
              className="theme-btn-secondary"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSaveCrop}
              className="theme-btn-primary"
            >
              {t.save}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render uploading state
  if (status === 'uploading') {
    return (
      <div className={`relative ${sizeClass.container} ${className}`}>
        <div className="w-full h-full rounded-full bg-[var(--background-secondary)] flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto mb-2">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="var(--card-border)"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="var(--primary)"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={125.6}
                  strokeDashoffset={125.6 - (125.6 * (progress?.percentage || 0)) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-[var(--foreground)]">
                {progress?.percentage || 0}%
              </span>
            </div>
            <span className="text-xs text-[var(--foreground-muted)]">
              {t.uploading}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Render success state
  if (status === 'success') {
    return (
      <div className={`relative ${sizeClass.container} ${className}`}>
        <div className="w-full h-full rounded-full bg-[var(--success)] flex items-center justify-center">
          <CheckIcon />
        </div>
      </div>
    );
  }

  // Render main component
  return (
    <div className={`relative ${sizeClass.container} ${className}`}>
      {/* Avatar display */}
      <div
        className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center cursor-pointer group"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        {previewUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <CameraIcon />
            </div>
          </>
        ) : (
          <>
            <span className={`text-white font-bold ${sizeClass.text}`}>
              {initials}
            </span>
            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <CameraIcon />
            </div>
          </>
        )}
      </div>

      {/* Camera button */}
      <button
        type="button"
        onClick={() => !disabled && fileInputRef.current?.click()}
        disabled={disabled}
        className={`absolute bottom-0 right-0 ${sizeClass.button} rounded-full bg-[var(--card)] border-2 border-[var(--background)] flex items-center justify-center text-[var(--foreground-secondary)] hover:bg-[var(--card-hover)] hover:text-[var(--primary)] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <CameraIcon />
      </button>

      {/* Remove button */}
      {showRemoveButton && previewUrl && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={disabled}
          className={`absolute top-0 right-0 w-6 h-6 rounded-full bg-[var(--error)] text-white flex items-center justify-center hover:bg-[var(--error-dark)] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <XIcon />
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
      />

      {/* Error tooltip */}
      {status === 'error' && error && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full z-10 w-max max-w-[200px] p-2 rounded-lg bg-[var(--error)] text-white text-xs text-center shadow-lg">
          {error}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--error)] rotate-45" />
        </div>
      )}
    </div>
  );
}

export default AvatarUpload;
