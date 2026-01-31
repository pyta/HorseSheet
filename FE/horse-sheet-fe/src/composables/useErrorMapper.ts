import { useI18n } from 'vue-i18n';

export function useErrorMapper() {
  const { t } = useI18n();

  function mapApiError(error: any): string {
    if (!error) {
      return t('errors.generic.somethingWentWrong');
    }

    // Handle validation errors from API
    if (error.errors && typeof error.errors === 'object') {
      const firstError = Object.values(error.errors)[0];
      if (Array.isArray(firstError) && firstError.length > 0) {
        return String(firstError[0]);
      }
      if (typeof firstError === 'string') {
        return firstError;
      }
    }

    // Handle HTTP status codes
    if (error.status) {
      switch (error.status) {
        case 400:
          return error.message || t('errors.api.badRequest');
        case 401:
          return t('errors.api.unauthorized');
        case 403:
          return t('errors.api.forbidden');
        case 404:
          return t('errors.api.notFound');
        case 409:
          return t('common.messages.versionConflict');
        case 500:
        case 502:
        case 503:
          return t('errors.api.serverError');
        default:
          break;
      }
    }

    // Handle network errors
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return t('errors.api.timeout');
    }

    if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
      return t('errors.api.networkError');
    }

    // Use error message if available
    if (error.message) {
      return error.message;
    }

    // Fallback
    return t('errors.generic.somethingWentWrong');
  }

  return {
    mapApiError,
  };
}

