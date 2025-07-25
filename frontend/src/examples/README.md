# Error Handling System

This directory contains examples demonstrating the comprehensive error handling system implemented in the application. The system is designed to handle various types of errors in a consistent and user-friendly way.

## Components of the Error Handling System

### 1. Error Handler Service (`errorHandler.ts`)

The central service that processes and categorizes errors:

- Processes different error types (Axios errors, standard JavaScript errors)
- Categorizes errors into types (network, server, validation, etc.)
- Provides user-friendly notifications
- Maintains error history
- Integrates with the Error Store

### 2. Error Store (`errorStore.ts`)

A Pinia store that manages application error states:

- Tracks errors across the application
- Manages global errors that require user attention
- Handles retry functionality for failed operations
- Provides getters for error information

### 3. Form Error Handling (`useFormErrors.ts`)

A composable for handling form validation errors:

- Manages field-level errors
- Tracks touched fields for validation
- Handles API validation errors
- Provides form-level error messages

### 4. UI Components

- **ErrorBanner**: Displays global errors at the application level
- **NotificationContainer**: Shows toast notifications for non-critical errors
- **FormErrorMessage**: Displays field-level validation errors in forms

## Example Files

1. **ErrorHandlingExample.vue**: A comprehensive example demonstrating various error handling scenarios
2. **formValidations.ts**: Form validation functions used in the example
3. **errorSimulations.ts**: Functions to simulate different error types for demonstration

## How to Use

### Global Error Handling

```typescript
import errorHandler from '@/services/errorHandler';
import { useErrorStore } from '@/stores/errorStore';

const errorStore = useErrorStore();

try {
  // Your code that might throw an error
} catch (error) {
  // Process the error
  const appError = errorHandler.processError(error);
  
  // For critical errors, set as global error
  if (appError.type === ErrorType.SERVER || appError.type === ErrorType.NETWORK) {
    errorStore.setGlobalError(appError);
  }
  
  // Show a notification
  errorHandler.showErrorNotification(error);
}
```

### Form Error Handling

```typescript
import { useFormErrors } from '@/composables/useFormErrors';

const { 
  errors, 
  touched, 
  formError, 
  setFieldError, 
  touchField, 
  handleApiValidationErrors,
  clearAllErrors 
} = useFormErrors();

// Handle field validation
function validateField(value) {
  if (!value) {
    setFieldError('fieldName', 'Field is required');
  } else {
    setFieldError('fieldName', null);
  }
  touchField('fieldName');
}

// Handle API validation errors
try {
  await api.post('/endpoint', data);
} catch (error) {
  handleApiValidationErrors(error);
}
```

### Using the UI Components

```html
<!-- In your template -->
<FormErrorMessage :error="errors.fieldName" :touched="touched.fieldName" />
```

The `ErrorBanner` and `NotificationContainer` components are automatically included in the App.vue file and will display errors when they occur.

## Best Practices

1. **Always process errors through the error handler**:
   ```typescript
   errorHandler.processError(error);
   ```

2. **Use appropriate error types**:
   - Network errors for connectivity issues
   - Server errors for backend failures
   - Validation errors for form input issues
   - Authentication errors for login/permission problems

3. **Provide retry functionality** when appropriate:
   ```typescript
   errorStore.addToRetryQueue({ id: 'operation-id', operation: myFunction });
   ```

4. **Clear errors** when they're no longer relevant:
   ```typescript
   errorStore.clearGlobalError();
   clearAllErrors(); // For form errors
   ```