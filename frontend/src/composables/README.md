# Composables

This directory contains reusable Vue 3 composables (hooks) that can be used across the application.

## Available Composables

### useApi

Handles API requests with built-in loading and error states using Axios. Provides methods for common HTTP operations and file uploads.

```typescript
const { 
  get, 
  post, 
  put, 
  patch, 
  delete, 
  upload, 
  isLoading, 
  error, 
  clearError,
  api // Axios instance
} = useApi({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'X-Custom-Header': 'value' },
  handleAuth: true
})

// Make GET request
const data = await get('/users')

// Make POST request
const newUser = await post('/users', { name: 'John', email: 'john@example.com' })

// Upload a file
const formData = new FormData()
formData.append('file', fileInput.files[0])
const result = await upload('/upload', formData)
```

### useForm

Manages form state, validation, and submission.

```typescript
const { 
  values, 
  errors, 
  isSubmitting, 
  handleChange, 
  handleSubmit 
} = useForm(initialValues, validateFn)

// Handle form submission
handleSubmit(async (formValues) => {
  // Submit form data
})
```

### useLoading

Manages loading states and errors for async operations.

```typescript
const { isLoading, error, withLoading } = useLoading()

// Execute async function with loading state
const result = await withLoading(async () => {
  // Async operation
})
```

### useFileUpload

Handles file uploads with validation and preview functionality.

```typescript
const { 
  file, 
  filePreview, 
  fileError, 
  handleFileSelect, 
  clearFile 
} = useFileUpload({
  maxSizeInMB: 5,
  allowedTypes: ['image/jpeg', 'image/png']
})
```

### usePagination

Manages pagination state and navigation.

```typescript
const { 
  currentPage, 
  itemsPerPage, 
  totalItems, 
  offset, 
  hasNextPage, 
  hasPreviousPage, 
  nextPage, 
  previousPage 
} = usePagination({
  initialPage: 1,
  initialLimit: 10
})
```

### useFormatter

Provides formatting utilities for common data types.

```typescript
const { 
  formatCurrency, 
  formatPercentage, 
  formatDate, 
  formatNumber, 
  truncateText 
} = useFormatter()

// Format a currency value
const price = formatCurrency(100) // $100.00
```

### useNotification

Manages toast notifications and alerts.

```typescript
const { 
  notifications, 
  success, 
  error, 
  info, 
  warning, 
  dismiss 
} = useNotification()

// Show a success notification
const notificationId = success('Operation completed successfully')

// For app-wide notifications, use the global instance
import { useGlobalNotification } from '@/composables'
const { success } = useGlobalNotification()
success('Global notification')
```

### useConfirmation

Manages confirmation dialogs for user actions.

```typescript
const { confirm, confirmDanger, confirmAction } = useConfirmation()

// Confirm a dangerous action
async function deleteItem() {
  const confirmed = await confirmDanger('Are you sure you want to delete this item?')
  if (confirmed) {
    // Proceed with deletion
  }
}

// For app-wide confirmations, use the global instance
import { useGlobalConfirmation } from '@/composables'
const { confirmAction } = useGlobalConfirmation()
const proceed = await confirmAction('Do you want to proceed?')
```

## Best Practices

1. Import composables directly from the composables directory:
   ```typescript
   import { useForm, useLoading } from '@/composables'
   ```

2. Combine multiple composables to create more complex functionality:
   ```typescript
   const { values, handleSubmit } = useForm(initialValues, validateFn)
   const { withLoading } = useLoading()
   
   // Combine form submission with loading state
   handleSubmit(async (formValues) => {
     return withLoading(async () => {
       // Submit form data
     })
   })
   ```

3. Create domain-specific composables in module directories that use these shared composables.

## Examples

Check the `examples` directory for sample components that demonstrate how to use these composables.