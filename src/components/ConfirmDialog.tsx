"use client";

/**
 * Professional Confirm Dialog Component
 * Reusable confirmation modal with bilingual support
 */

import React, { useEffect, useCallback } from "react";

// Icons
const WarningIcon = () => (
  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const InfoIcon = () => (
  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export type ConfirmDialogVariant = "danger" | "warning" | "info" | "success";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
  language?: "en" | "ar";
  loading?: boolean;
  itemName?: string;
}

const TRANSLATIONS = {
  en: {
    confirm: "Confirm",
    cancel: "Cancel",
    delete: "Delete",
    areYouSure: "Are you sure?",
    thisActionCannotBeUndone: "This action cannot be undone.",
  },
  ar: {
    confirm: "تأكيد",
    cancel: "إلغاء",
    delete: "حذف",
    areYouSure: "هل أنت متأكد؟",
    thisActionCannotBeUndone: "لا يمكن التراجع عن هذا الإجراء.",
  },
};

const VARIANT_STYLES: Record<
  ConfirmDialogVariant,
  {
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    buttonClass: string;
  }
> = {
  danger: {
    icon: <TrashIcon />,
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
    buttonClass:
      "bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white",
  },
  warning: {
    icon: <WarningIcon />,
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    buttonClass:
      "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 text-white",
  },
  info: {
    icon: <InfoIcon />,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    buttonClass:
      "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white",
  },
  success: {
    icon: <CheckCircleIcon />,
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
    buttonClass:
      "bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white",
  },
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = "danger",
  language = "en",
  loading = false,
  itemName,
}: ConfirmDialogProps) {
  const t = TRANSLATIONS[language];
  const styles = VARIANT_STYLES[variant];

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    },
    [onClose, loading]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  const defaultConfirmText =
    variant === "danger" ? t.delete : t.confirm;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={loading ? undefined : onClose}
      />

      {/* Dialog */}
      <div
        className="relative w-full max-w-md transform transition-all animate-in fade-in zoom-in-95 duration-200"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <div className="bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          {/* Content */}
          <div className="p-6 text-center">
            {/* Icon */}
            <div
              className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${styles.iconBg}`}
            >
              <span className={styles.iconColor}>{styles.icon}</span>
            </div>

            {/* Title */}
            <h3
              id="confirm-dialog-title"
              className="text-xl font-semibold text-[var(--foreground)] mb-2"
            >
              {title}
            </h3>

            {/* Item name if provided */}
            {itemName && (
              <p className="text-lg font-medium text-[var(--foreground-secondary)] mb-2">
                &quot;{itemName}&quot;
              </p>
            )}

            {/* Message */}
            <p
              id="confirm-dialog-description"
              className="text-[var(--foreground-muted)] text-sm"
            >
              {message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-4 pt-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="theme-btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText || t.cancel}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className={`flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variant === "danger" ? "theme-btn-danger" : "theme-btn-primary"}`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>{language === "ar" ? "جاري..." : "Loading..."}</span>
                </>
              ) : (
                confirmText || defaultConfirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for easier usage
interface UseConfirmDialogOptions {
  language?: "en" | "ar";
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
  itemName?: string;
}

export function useConfirmDialog(options: UseConfirmDialogOptions = {}) {
  const [state, setState] = React.useState<{
    isOpen: boolean;
    options: ConfirmOptions | null;
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    options: null,
    resolve: null,
  });

  const confirm = useCallback(
    (confirmOptions: ConfirmOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        setState({
          isOpen: true,
          options: confirmOptions,
          resolve,
        });
      });
    },
    []
  );

  const handleClose = useCallback(() => {
    state.resolve?.(false);
    setState({ isOpen: false, options: null, resolve: null });
  }, [state]);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState({ isOpen: false, options: null, resolve: null });
  }, [state]);

  const DialogComponent = state.options ? (
    <ConfirmDialog
      isOpen={state.isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={state.options.title}
      message={state.options.message}
      confirmText={state.options.confirmText}
      cancelText={state.options.cancelText}
      variant={state.options.variant}
      itemName={state.options.itemName}
      language={options.language}
    />
  ) : null;

  return { confirm, DialogComponent };
}

export default ConfirmDialog;
