/**
 * Upload Service
 * Professional file upload service with validation, compression, and progress tracking
 */

import {
  FileValidationRules,
  UploadConfig,
  UploadProgress,
  UploadResult,
  ProcessedFile,
  ImageCropData,
  UPLOAD_PRESETS,
  FileCategory,
} from './types';

// Validation error messages
const ERROR_MESSAGES = {
  en: {
    FILE_TOO_LARGE: 'File size exceeds the maximum allowed size',
    INVALID_TYPE: 'File type is not allowed',
    IMAGE_TOO_SMALL: 'Image dimensions are too small',
    IMAGE_TOO_LARGE: 'Image dimensions are too large',
    INVALID_ASPECT_RATIO: 'Image aspect ratio is not correct',
    UPLOAD_FAILED: 'Upload failed. Please try again',
    NETWORK_ERROR: 'Network error. Please check your connection',
    SERVER_ERROR: 'Server error. Please try again later',
  },
  ar: {
    FILE_TOO_LARGE: 'حجم الملف يتجاوز الحد المسموح',
    INVALID_TYPE: 'نوع الملف غير مسموح',
    IMAGE_TOO_SMALL: 'أبعاد الصورة صغيرة جداً',
    IMAGE_TOO_LARGE: 'أبعاد الصورة كبيرة جداً',
    INVALID_ASPECT_RATIO: 'نسبة أبعاد الصورة غير صحيحة',
    UPLOAD_FAILED: 'فشل الرفع. حاول مرة أخرى',
    NETWORK_ERROR: 'خطأ في الشبكة. تحقق من اتصالك',
    SERVER_ERROR: 'خطأ في الخادم. حاول لاحقاً',
  },
};

export class UploadService {
  private config: UploadConfig;
  private language: 'en' | 'ar';
  private abortController: AbortController | null = null;

  constructor(category: FileCategory, language: 'en' | 'ar' = 'en') {
    this.config = UPLOAD_PRESETS[category];
    this.language = language;
  }

  /**
   * Get localized error message
   */
  private getErrorMessage(key: keyof typeof ERROR_MESSAGES['en']): string {
    return ERROR_MESSAGES[this.language][key];
  }

  /**
   * Format file size to human readable
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file extension from name
   */
  static getFileExtension(filename: string): string {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
  }

  /**
   * Generate unique filename
   */
  static generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = UploadService.getFileExtension(originalName);
    return `${timestamp}-${random}.${ext}`;
  }

  /**
   * Check if file is an image
   */
  static isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  /**
   * Get image dimensions
   */
  static getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      if (!UploadService.isImage(file)) {
        reject(new Error('File is not an image'));
        return;
      }

      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }

  /**
   * Validate file against rules
   */
  async validateFile(file: File): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const rules = this.config.validation;

    // Check file size
    if (file.size > rules.maxSize) {
      errors.push(
        `${this.getErrorMessage('FILE_TOO_LARGE')} (${UploadService.formatFileSize(rules.maxSize)})`
      );
    }

    // Check file type
    if (!rules.allowedTypes.includes(file.type)) {
      errors.push(this.getErrorMessage('INVALID_TYPE'));
    }

    // Check image dimensions if applicable
    if (UploadService.isImage(file)) {
      try {
        const dimensions = await UploadService.getImageDimensions(file);

        if (rules.minWidth && dimensions.width < rules.minWidth) {
          errors.push(`${this.getErrorMessage('IMAGE_TOO_SMALL')} (min: ${rules.minWidth}px)`);
        }

        if (rules.minHeight && dimensions.height < rules.minHeight) {
          errors.push(`${this.getErrorMessage('IMAGE_TOO_SMALL')} (min: ${rules.minHeight}px)`);
        }

        if (rules.maxWidth && dimensions.width > rules.maxWidth) {
          errors.push(`${this.getErrorMessage('IMAGE_TOO_LARGE')} (max: ${rules.maxWidth}px)`);
        }

        if (rules.maxHeight && dimensions.height > rules.maxHeight) {
          errors.push(`${this.getErrorMessage('IMAGE_TOO_LARGE')} (max: ${rules.maxHeight}px)`);
        }

        // Check aspect ratio
        if (rules.aspectRatio) {
          const actualRatio = dimensions.width / dimensions.height;
          const tolerance = (rules.aspectRatioTolerance || 5) / 100;
          const minRatio = rules.aspectRatio * (1 - tolerance);
          const maxRatio = rules.aspectRatio * (1 + tolerance);

          if (actualRatio < minRatio || actualRatio > maxRatio) {
            errors.push(this.getErrorMessage('INVALID_ASPECT_RATIO'));
          }
        }
      } catch (error) {
        errors.push('Failed to read image dimensions');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Process file (create preview, validate)
   */
  async processFile(file: File): Promise<ProcessedFile> {
    const validation = await this.validateFile(file);
    let preview = '';
    let width: number | undefined;
    let height: number | undefined;

    if (UploadService.isImage(file)) {
      preview = URL.createObjectURL(file);
      try {
        const dimensions = await UploadService.getImageDimensions(file);
        width = dimensions.width;
        height = dimensions.height;
      } catch {
        // Ignore dimension errors
      }
    }

    return {
      file,
      preview,
      width,
      height,
      isValid: validation.isValid,
      validationErrors: validation.errors,
    };
  }

  /**
   * Compress/resize image using canvas
   */
  async compressImage(
    file: File,
    options: { maxWidth: number; maxHeight: number; quality: number }
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);

        let { width, height } = img;
        const { maxWidth, maxHeight, quality } = options;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Create canvas and draw
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Use better image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          file.type,
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image for compression'));
      };

      img.src = url;
    });
  }

  /**
   * Crop image using canvas
   */
  async cropImage(file: File, cropData: ImageCropData): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);

        const canvas = document.createElement('canvas');
        canvas.width = cropData.width;
        canvas.height = cropData.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Apply transformations
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((cropData.rotation * Math.PI) / 180);
        ctx.scale(cropData.scale, cropData.scale);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        // Draw cropped area
        ctx.drawImage(
          img,
          cropData.x,
          cropData.y,
          cropData.width,
          cropData.height,
          0,
          0,
          cropData.width,
          cropData.height
        );

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to crop image'));
              return;
            }

            const croppedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });

            resolve(croppedFile);
          },
          file.type,
          0.92
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image for cropping'));
      };

      img.src = url;
    });
  }

  /**
   * Create thumbnail
   */
  async createThumbnail(file: File): Promise<string> {
    if (!this.config.thumbnailSize) {
      return '';
    }

    const { width, height } = this.config.thumbnailSize;
    const thumbnailFile = await this.compressImage(file, {
      maxWidth: width,
      maxHeight: height,
      quality: 0.8,
    });

    return URL.createObjectURL(thumbnailFile);
  }

  /**
   * Upload file with progress tracking
   */
  async upload(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    // Validate first
    const validation = await this.validateFile(file);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', '),
        errorCode: 'VALIDATION_ERROR',
      };
    }

    // Auto-resize if configured
    let fileToUpload = file;
    if (this.config.autoResize && this.config.resizeTo && UploadService.isImage(file)) {
      try {
        fileToUpload = await this.compressImage(file, this.config.resizeTo);
      } catch (error) {
        console.warn('Auto-resize failed, uploading original file');
      }
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('category', this.config.category);
    formData.append('originalName', file.name);

    // Setup abort controller
    this.abortController = new AbortController();

    try {
      const startTime = Date.now();
      let lastLoaded = 0;
      let lastTime = startTime;

      const response = await new Promise<Response>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const now = Date.now();
            const timeDiff = (now - lastTime) / 1000;
            const loadedDiff = event.loaded - lastLoaded;
            const speed = timeDiff > 0 ? loadedDiff / timeDiff : 0;
            const remaining = speed > 0 ? (event.total - event.loaded) / speed : 0;

            onProgress({
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100),
              speed,
              remainingTime: remaining,
            });

            lastLoaded = event.loaded;
            lastTime = now;
          }
        });

        xhr.addEventListener('load', () => {
          resolve(new Response(xhr.responseText, { status: xhr.status }));
        });

        xhr.addEventListener('error', () => {
          reject(new Error(this.getErrorMessage('NETWORK_ERROR')));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'));
        });

        xhr.open('POST', this.config.endpoint);
        xhr.send(formData);

        // Handle abort
        this.abortController?.signal.addEventListener('abort', () => {
          xhr.abort();
        });
      });

      if (!response.ok) {
        if (response.status >= 500) {
          return {
            success: false,
            error: this.getErrorMessage('SERVER_ERROR'),
            errorCode: 'SERVER_ERROR',
          };
        }

        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.message || this.getErrorMessage('UPLOAD_FAILED'),
          errorCode: errorData.code || 'UPLOAD_FAILED',
        };
      }

      const data = await response.json();

      return {
        success: true,
        url: data.url,
        thumbnailUrl: data.thumbnailUrl,
        fileId: data.fileId,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        width: data.width,
        height: data.height,
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'Upload cancelled') {
        return {
          success: false,
          error: error.message,
          errorCode: 'CANCELLED',
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : this.getErrorMessage('UPLOAD_FAILED'),
        errorCode: 'UNKNOWN_ERROR',
      };
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Cancel ongoing upload
   */
  cancelUpload(): void {
    this.abortController?.abort();
  }

  /**
   * Convert data URL to File
   */
  static dataURLtoFile(dataURL: string, filename: string): File {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  /**
   * Convert File to data URL
   */
  static fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

// Export singleton instances for common use cases
export const avatarUploader = new UploadService('avatar');
export const imageUploader = new UploadService('image');
export const documentUploader = new UploadService('document');
