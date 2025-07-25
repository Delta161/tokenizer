import { ref, computed } from 'vue';
import { ErrorType } from '@/services/errorHandler';
import errorHandler from '@/services/errorHandler';

/**
 * Interface for form field errors
 */
interface FieldErrors {
  [field: string]: string | null;
}

/**
 * Interface for field touched state
 */
interface FieldTouched {
  [field: string]: boolean;
}

/**
 * Composable for handling form validation errors
 */
export function useFormErrors() {
  // State
  const errors = ref<FieldErrors>({});
  const touched = ref<FieldTouched>({});
  const formSubmitted = ref(false);
  const formError = ref<string | null>(null);

  // Computed
  const hasErrors = computed(() => {
    return Object.values(errors.value).some(error => error !== null);
  });

  const touchedFields = computed(() => {
    return Object.keys(touched.value).filter(field => touched.value[field]);
  });

  /**
   * Set an error for a specific field
   */
  function setFieldError(field: string, message: string | null) {
    errors.value = { ...errors.value, [field]: message };
  }

  /**
   * Set multiple field errors at once
   */
  function setFieldErrors(fieldErrors: FieldErrors) {
    errors.value = { ...errors.value, ...fieldErrors };
  }

  /**
   * Clear error for a specific field
   */
  function clearFieldError(field: string) {
    setFieldError(field, null);
  }

  /**
   * Clear all field errors
   */
  function clearAllErrors() {
    errors.value = {};
    formError.value = null;
  }

  /**
   * Mark a field as touched
   */
  function touchField(field: string) {
    touched.value = { ...touched.value, [field]: true };
  }

  /**
   * Mark multiple fields as touched
   */
  function touchFields(fields: string[]) {
    const newTouched = { ...touched.value };
    fields.forEach(field => {
      newTouched[field] = true;
    });
    touched.value = newTouched;
  }

  /**
   * Mark all fields as touched
   */
  function touchAll() {
    const newTouched: FieldTouched = {};
    Object.keys(errors.value).forEach(field => {
      newTouched[field] = true;
    });
    touched.value = newTouched;
  }

  /**
   * Reset touched state for all fields
   */
  function resetTouched() {
    touched.value = {};
  }

  /**
   * Set form as submitted
   */
  function setSubmitted(submitted = true) {
    formSubmitted.value = submitted;
    if (submitted) {
      touchAll();
    }
  }

  /**
   * Handle API validation errors
   */
  function handleApiValidationErrors(error: unknown) {
    const appError = errorHandler.processError(error);
    
    // Set form error for non-validation errors
    if (appError.type !== ErrorType.VALIDATION) {
      formError.value = appError.message;
      return;
    }
    
    // Handle validation errors with field details
    if (appError.details) {
      const fieldErrors: FieldErrors = {};
      
      // Process field errors from API response
      Object.entries(appError.details).forEach(([field, detail]) => {
        if (typeof detail === 'string') {
          fieldErrors[field] = detail;
        } else if (detail && typeof detail === 'object' && 'message' in detail) {
          fieldErrors[field] = detail.message as string;
        }
      });
      
      setFieldErrors(fieldErrors);
      touchAll();
    } else {
      // Generic validation error without field details
      formError.value = appError.message;
    }
  }

  return {
    // State
    errors,
    touched,
    formSubmitted,
    formError,
    
    // Computed
    hasErrors,
    touchedFields,
    
    // Methods
    setFieldError,
    setFieldErrors,
    clearFieldError,
    clearAllErrors,
    touchField,
    touchFields,
    touchAll,
    resetTouched,
    setSubmitted,
    handleApiValidationErrors
  };
}