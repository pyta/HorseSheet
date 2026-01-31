import { useI18n } from 'vue-i18n';

export function useValidationMessages() {
  const { t } = useI18n();

  function getValidationMessage(fieldName: string, errorType: string): string {
    const key = `validation.${fieldName}.${errorType}`;
    const message = t(key);
    
    // If translation key doesn't exist, try generic required message
    if (message === key) {
      if (errorType === 'required') {
        return t('validation.required');
      }
      return t('errors.validation.fieldRequired');
    }
    
    return message;
  }

  function getFieldValidationMessage(fieldName: string, errorType: string): string {
    return getValidationMessage(fieldName, errorType);
  }

  return {
    getValidationMessage,
    getFieldValidationMessage,
  };
}

