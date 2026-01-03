/**
 * Contextual error message utilities for better UX
 */

export interface ErrorContext {
  action: string;
  entity?: string;
  retryAction?: () => void;
}

export const getContextualErrorMessage = (
  error: unknown,
  context: ErrorContext,
): { message: string; action?: string; onAction?: () => void } => {
  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Something went wrong';

  // Network/connection errors
  if (
    errorMessage.toLowerCase().includes('network') ||
    errorMessage.toLowerCase().includes('connection') ||
    errorMessage.toLowerCase().includes('fetch')
  ) {
    return {
      message: `Couldn't ${context.action}. Check your connection and try again.`,
      action: 'Retry',
      onAction: context.retryAction,
    };
  }

  // Rate limiting
  if (
    errorMessage.toLowerCase().includes('rate limit') ||
    errorMessage.toLowerCase().includes('too many')
  ) {
    return {
      message: 'Too many requests. Please wait a moment and try again.',
    };
  }

  // Validation errors
  if (
    errorMessage.toLowerCase().includes('invalid') ||
    errorMessage.toLowerCase().includes('validation') ||
    errorMessage.toLowerCase().includes('required')
  ) {
    return {
      message: `Please check your input and try again. ${errorMessage}`,
    };
  }

  // Permission/authorization errors
  if (
    errorMessage.toLowerCase().includes('permission') ||
    errorMessage.toLowerCase().includes('unauthorized') ||
    errorMessage.toLowerCase().includes('forbidden')
  ) {
    return {
      message: "You don't have permission to perform this action.",
    };
  }

  // Not found errors
  if (
    errorMessage.toLowerCase().includes('not found') ||
    errorMessage.toLowerCase().includes('does not exist')
  ) {
    return {
      message: `${context.entity || 'Item'} not found. It may have been deleted.`,
    };
  }

  // Default contextual message
  return {
    message: `Couldn't ${context.action}. ${errorMessage}`,
    action: context.retryAction ? 'Retry' : undefined,
    onAction: context.retryAction,
  };
};
