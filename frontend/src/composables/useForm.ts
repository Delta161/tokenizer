import { ref, reactive } from 'vue'

/**
 * Composable for form handling with validation
 * Provides reactive form state, validation, and submission handling
 */
export function useForm<T extends Record<string, any>, E extends Record<string, string | undefined>>(
  initialValues: T,
  validateFn: (values: T, field?: keyof T) => E
) {
  // Form state
  const values = reactive<T>({ ...initialValues })
  const errors = ref<E>({} as E)
  const isSubmitting = ref(false)
  const isValid = ref(false)
  const touched = reactive<Record<keyof T, boolean>>({} as Record<keyof T, boolean>)

  /**
   * Validate the entire form or a specific field
   * @param field - Optional field to validate
   * @returns boolean indicating if the form/field is valid
   */
  const validate = (field?: keyof T): boolean => {
    const newErrors = validateFn(values, field)
    
    if (field) {
      // Update only the specified field error
      errors.value = { ...errors.value, [field]: newErrors[field] }
    } else {
      // Update all errors
      errors.value = newErrors
    }

    // Check if form is valid (no errors)
    isValid.value = Object.values(errors.value).every(error => !error)
    
    return isValid.value
  }

  /**
   * Handle field change and validate
   * @param field - Field name
   */
  const handleChange = (field: keyof T) => {
    touched[field] = true
    validate(field)
  }

  /**
   * Reset form to initial values
   */
  const resetForm = () => {
    Object.keys(values).forEach(key => {
      values[key as keyof T] = initialValues[key as keyof T]
    })
    errors.value = {} as E
    isValid.value = false
    Object.keys(touched).forEach(key => {
      touched[key as keyof T] = false
    })
  }

  /**
   * Set form values
   * @param newValues - New values to set
   */
  const setValues = (newValues: Partial<T>) => {
    Object.keys(newValues).forEach(key => {
      values[key as keyof T] = newValues[key as keyof T]!
    })
    validate()
  }

  /**
   * Handle form submission
   * @param submitFn - Function to call on successful validation
   * @returns Promise with submission result
   */
  const handleSubmit = async <R>(submitFn: (values: T) => Promise<R>): Promise<R | undefined> => {
    isSubmitting.value = true
    
    try {
      // Validate all fields before submission
      const isFormValid = validate()
      if (!isFormValid) {
        return undefined
      }
      
      return await submitFn(values)
    } catch (error) {
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    validate,
    handleChange,
    resetForm,
    setValues,
    handleSubmit
  }
}