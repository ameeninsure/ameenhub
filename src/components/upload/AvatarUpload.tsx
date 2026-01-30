"use client";

/**
 * Avatar Upload Component
 * Professional avatar upload with simple crop functionality
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { UploadService, UploadProgress, UploadResult, ProcessedFile } from '@/lib/upload';

// Icons
const CameraIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h4l2-3h6l2 3h4v12H3V7zm9 9a4 4 0 100-8 4 4 0 000 8z" />
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

const MinusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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
    uploading: 'Uploading...',
    uploadSuccess: 'Upload successful!',
    uploadError: 'Upload failed',
    cancel: 'Cancel',
    save: 'Save',
    dragToMove: 'Drag to move • Scroll to zoom',
  },
  ar: {
    uploadPhoto: 'رفع صورة',
    changePhoto: 'تغيير الصورة',
    removePhoto: 'حذف الصورة',
    uploading: 'جاري الرفع...',
    uploadSuccess: 'تم الرفع بنجاح!',
    uploadError: 'فشل الرفع',
    cancel: 'إلغاء',
    save: 'حفظ',
    dragToMove: 'اسحب للتحريك • مرر للتكبير',
  },
};

const SIZE_CLASSES = {
  sm: { container: 'w-16 h-16', button: 'w-6 h-6', text: 'text-lg' },
  md: { container: 'w-24 h-24', button: 'w-8 h-8', text: 'text-2xl' },
  lg: { container: 'w-32 h-32', button: 'w-10 h-10', text: 'text-3xl' },
  xl: { container: 'w-40 h-40', button: 'w-12 h-12', text: 'text-4xl' },
};

// Crop area size in the modal
const CROP_SIZE = 240;
const OUTPUT_SIZE = 512;
const MAX_PREVIEW_SIZE = 400; // Maximum size for image preview in modal

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [uploadService] = useState(() => new UploadService('avatar', language));
  
  const [status, setStatus] = useState<'idle' | 'cropping' | 'uploading' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>(currentImage || '');
  
  // Crop state
  const [imageSrc, setImageSrc] = useState<string>('');
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasTransparency, setHasTransparency] = useState(false);
  
  const processedFileRef = useRef<ProcessedFile | null>(null);

  // Update preview when currentImage changes
  useEffect(() => {
    setPreviewUrl(currentImage || '');
  }, [currentImage]);

  // Calculate display size for the image (fit within MAX_PREVIEW_SIZE while maintaining aspect ratio)
  const calculateDisplaySize = useCallback((imgWidth: number, imgHeight: number) => {
    const maxSize = MAX_PREVIEW_SIZE;
    
    if (imgWidth <= maxSize && imgHeight <= maxSize) {
      return { width: imgWidth, height: imgHeight };
    }
    
    const ratio = imgWidth / imgHeight;
    if (imgWidth > imgHeight) {
      return { width: maxSize, height: maxSize / ratio };
    } else {
      return { width: maxSize * ratio, height: maxSize };
    }
  }, []);

  // Check if image has transparency (PNG with alpha)
  const checkTransparency = useCallback((img: HTMLImageElement): boolean => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    
    // Sample a small portion of the image
    const sampleSize = Math.min(100, img.naturalWidth, img.naturalHeight);
    canvas.width = sampleSize;
    canvas.height = sampleSize;
    
    ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
    const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
    
    // Check alpha channel
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] < 255) {
        return true;
      }
    }
    return false;
  }, []);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setError('');
    
    try {
      const processed = await uploadService.processFile(file);
      
      if (!processed.isValid) {
        setError(processed.validationErrors.join('\n'));
        setStatus('error');
        setTimeout(() => setStatus('idle'), 3000);
        return;
      }
      
      processedFileRef.current = processed;
      
      // Load image to get dimensions
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        setImageNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
        
        // Check for transparency
        const isPng = file.type === 'image/png';
        if (isPng) {
          setHasTransparency(checkTransparency(img));
        } else {
          setHasTransparency(false);
        }
        
        // Calculate display size
        const display = calculateDisplaySize(img.naturalWidth, img.naturalHeight);
        setDisplaySize(display);
        
        // Reset scale
        setScale(1);
        
        // Center the crop area initially
        setCropPosition({
          x: (display.width - CROP_SIZE) / 2,
          y: (display.height - CROP_SIZE) / 2,
        });
        
        setImageSrc(processed.preview);
        setStatus('cropping');
      };
      img.src = processed.preview;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [uploadService, calculateDisplaySize, checkTransparency]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    e.target.value = '';
  }, [handleFileSelect]);

  // Mouse/Touch handlers for dragging the crop area
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if click is inside crop area
    if (
      x >= cropPosition.x &&
      x <= cropPosition.x + CROP_SIZE &&
      y >= cropPosition.y &&
      y <= cropPosition.y + CROP_SIZE
    ) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - cropPosition.x, y: e.clientY - cropPosition.y });
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  }, [cropPosition]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    
    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;
    
    // Constrain to image bounds (using scaled size)
    const scaledWidth = displaySize.width * scale;
    const scaledHeight = displaySize.height * scale;
    newX = Math.max(0, Math.min(scaledWidth - CROP_SIZE, newX));
    newY = Math.max(0, Math.min(scaledHeight - CROP_SIZE, newY));
    
    setCropPosition({ x: newX, y: newY });
  }, [isDragging, dragStart, displaySize, scale]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  // Wheel handler for zooming
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    // Minimum scale: ensure image is at least as large as crop area
    const minScale = Math.max(
      CROP_SIZE / displaySize.width,
      CROP_SIZE / displaySize.height
    );
    setScale(prev => Math.max(minScale, Math.min(3, prev + delta)));
  }, [displaySize]);

  // Get scaled display size
  const getScaledSize = useCallback(() => {
    return {
      width: displaySize.width * scale,
      height: displaySize.height * scale,
    };
  }, [displaySize, scale]);

  // Calculate minimum scale
  const getMinScale = useCallback(() => {
    return Math.max(
      CROP_SIZE / displaySize.width,
      CROP_SIZE / displaySize.height,
      0.5
    );
  }, [displaySize]);

  // Adjust crop position when scale changes to keep it within bounds
  useEffect(() => {
    if (status !== 'cropping') return;
    
    const scaledWidth = displaySize.width * scale;
    const scaledHeight = displaySize.height * scale;
    
    setCropPosition(prev => ({
      x: Math.max(0, Math.min(scaledWidth - CROP_SIZE, prev.x)),
      y: Math.max(0, Math.min(scaledHeight - CROP_SIZE, prev.y)),
    }));
  }, [scale, displaySize, status]);

  // Save cropped image
  const handleSave = useCallback(async () => {
    if (!imageRef.current || !canvasRef.current) return;
    
    setStatus('uploading');
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');
      
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      
      // Clear with transparent background (preserves transparency for PNGs)
      ctx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      
      const img = imageRef.current;
      const scaledSize = getScaledSize();
      
      // Calculate the scale between scaled display size and natural size
      const scaleX = img.naturalWidth / scaledSize.width;
      const scaleY = img.naturalHeight / scaledSize.height;
      
      // Calculate source coordinates in natural image
      const srcX = cropPosition.x * scaleX;
      const srcY = cropPosition.y * scaleY;
      
      // Draw the cropped portion scaled to output size
      ctx.drawImage(
        img,
        srcX,
        srcY,
        CROP_SIZE * scaleX,
        CROP_SIZE * scaleY,
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE
      );
      
      // Apply circular mask
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Convert to blob - use PNG to preserve transparency
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Failed to create blob'))),
          'image/png',
          1
        );
      });
      
      const croppedFile = new File([blob], 'avatar.png', { type: 'image/png' });
      
      // Upload
      const result = await uploadService.upload(croppedFile, setProgress);
      
      if (result.success) {
        setPreviewUrl(result.url || URL.createObjectURL(blob));
        setStatus('success');
        onUpload?.(result);
        
        setTimeout(() => {
          setStatus('idle');
          setImageSrc('');
        }, 1500);
      } else {
        setError(result.error || t.uploadError);
        setStatus('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.uploadError);
      setStatus('error');
    }
  }, [cropPosition, getScaledSize, uploadService, onUpload, t.uploadError]);

  const handleCancel = useCallback(() => {
    setImageSrc('');
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

  // Crop Modal
  if (status === 'cropping' && imageSrc) {
    const scaledSize = getScaledSize();
    const minScale = getMinScale();
    
    // Checkered background for transparency
    const checkeredBg = hasTransparency 
      ? 'bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%3E%3Crect%20width%3D%228%22%20height%3D%228%22%20fill%3D%22%23ccc%22%2F%3E%3Crect%20x%3D%228%22%20y%3D%228%22%20width%3D%228%22%20height%3D%228%22%20fill%3D%22%23ccc%22%2F%3E%3C%2Fsvg%3E")]'
      : '';
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
        <div className="relative flex flex-col items-center max-w-[90vw] max-h-[85vh]">
          {/* Close button */}
          <button
            onClick={handleCancel}
            className="absolute -top-10 right-0 p-2 text-white/60 hover:text-white transition-colors z-10"
            aria-label="Close"
          >
            <XIcon />
          </button>

          {/* Image container with crop overlay */}
          <div
            ref={containerRef}
            className={`relative select-none overflow-hidden ${checkeredBg}`}
            style={{ 
              width: scaledSize.width, 
              height: scaledSize.height,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
          >
            {/* The image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt="Crop"
              className="select-none pointer-events-none"
              style={{
                width: scaledSize.width,
                height: scaledSize.height,
              }}
              draggable={false}
            />
            
            {/* Dark overlay using SVG mask */}
            <svg 
              className="absolute inset-0 pointer-events-none"
              width={scaledSize.width}
              height={scaledSize.height}
              style={{ width: scaledSize.width, height: scaledSize.height }}
            >
              <defs>
                <mask id="avatarCropMask">
                  <rect x="0" y="0" width={scaledSize.width} height={scaledSize.height} fill="white" />
                  <circle 
                    cx={cropPosition.x + CROP_SIZE / 2} 
                    cy={cropPosition.y + CROP_SIZE / 2} 
                    r={CROP_SIZE / 2} 
                    fill="black" 
                  />
                </mask>
              </defs>
              <rect 
                x="0" 
                y="0" 
                width={scaledSize.width} 
                height={scaledSize.height} 
                fill="rgba(0,0,0,0.7)" 
                mask="url(#avatarCropMask)" 
              />
            </svg>
            
            {/* Crop area border */}
            <div
              className="absolute border-2 border-white rounded-full pointer-events-none"
              style={{
                left: cropPosition.x,
                top: cropPosition.y,
                width: CROP_SIZE,
                height: CROP_SIZE,
              }}
            />
          </div>

          {/* Hidden canvas */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Zoom controls */}
          <div className="flex items-center gap-3 mt-6 w-64">
            <button
              onClick={() => setScale(Math.max(minScale, scale - 0.2))}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Zoom out"
            >
              <MinusIcon />
            </button>
            <input
              type="range"
              min={minScale}
              max={3}
              step={0.01}
              value={scale}
              onChange={(e) => setScale(Math.max(minScale, parseFloat(e.target.value)))}
              className="flex-1 h-1 rounded-full appearance-none bg-white/20 cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none 
                [&::-webkit-slider-thumb]:w-4 
                [&::-webkit-slider-thumb]:h-4 
                [&::-webkit-slider-thumb]:rounded-full 
                [&::-webkit-slider-thumb]:bg-white 
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:w-4 
                [&::-moz-range-thumb]:h-4 
                [&::-moz-range-thumb]:rounded-full 
                [&::-moz-range-thumb]:bg-white 
                [&::-moz-range-thumb]:border-0"
            />
            <button
              onClick={() => setScale(Math.min(3, scale + 0.2))}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Zoom in"
            >
              <PlusIcon />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 rounded-full bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-colors"
            >
              {t.save}
            </button>
          </div>

          {/* Help text */}
          <p className="mt-3 text-white/40 text-sm">{t.dragToMove}</p>
        </div>
      </div>
    );
  }

  // Uploading state
  if (status === 'uploading') {
    return (
      <div className={`relative ${sizeClass.container} ${className}`}>
        <div className="w-full h-full rounded-full bg-[var(--background-secondary)] flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-10 h-10 mx-auto">
              <svg className="w-10 h-10 transform -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="var(--card-border)"
                  strokeWidth="3"
                  fill="none"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="var(--primary)"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={100}
                  strokeDashoffset={100 - (100 * (progress?.percentage || 0)) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-[var(--foreground)]">
                {progress?.percentage || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <div className={`relative ${sizeClass.container} ${className}`}>
        <div className="w-full h-full rounded-full bg-green-500 flex items-center justify-center text-white">
          <CheckIcon />
        </div>
      </div>
    );
  }

  // Main avatar display
  return (
    <div className={`relative ${sizeClass.container} ${className}`}>
      {/* Avatar */}
      <div
        className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center cursor-pointer group"
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
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <CameraIcon />
            </div>
          </>
        ) : (
          <>
            <span className={`text-white font-bold ${sizeClass.text}`}>
              {initials}
            </span>
            <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
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
        className={`absolute bottom-0 right-0 ${sizeClass.button} rounded-full bg-[var(--card)] border-2 border-[var(--background)] flex items-center justify-center text-[var(--foreground-secondary)] hover:bg-[var(--card-hover)] hover:text-[var(--primary)] transition-colors shadow-lg disabled:opacity-50`}
      >
        <CameraIcon />
      </button>

      {/* Remove button */}
      {showRemoveButton && previewUrl && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={disabled}
          className="absolute top-0 right-0 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50"
        >
          <XIcon />
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
      />

      {/* Error tooltip */}
      {status === 'error' && error && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full z-10 w-max max-w-[200px] p-2 rounded-lg bg-red-500 text-white text-xs text-center shadow-lg">
          {error}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rotate-45" />
        </div>
      )}
    </div>
  );
}

export default AvatarUpload;
