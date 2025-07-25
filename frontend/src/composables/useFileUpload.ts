import { ref } from 'vue'

interface FileValidationOptions {
  maxSizeInMB?: number
  allowedTypes?: string[]
}

/**
 * Composable for handling file uploads and image previews
 * Provides reactive file state, validation, and preview functionality
 */
export function useFileUpload(options: FileValidationOptions = {}) {
  const file = ref<File | null>(null)
  const filePreview = ref<string | null>(null)
  const fileError = ref<string | null>(null)
  
  // Default options
  const maxSizeInMB = options.maxSizeInMB || 5 // 5MB default
  const allowedTypes = options.allowedTypes || ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

  /**
   * Validate a file based on type and size
   * @param fileToValidate - File to validate
   * @returns boolean indicating if the file is valid
   */
  function validateFile(fileToValidate: File): boolean {
    fileError.value = null

    // Validate file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(fileToValidate.type)) {
      fileError.value = `Please select a valid file type. Allowed types: ${allowedTypes.map(type => type.replace('image/', '.')).join(', ')}`
      return false
    }
    
    // Validate file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024
    if (fileToValidate.size > maxSizeInBytes) {
      fileError.value = `File must be less than ${maxSizeInMB}MB`
      return false
    }
    
    return true
  }

  /**
   * Handle file selection from input
   * @param event - Input change event
   */
  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement
    const selectedFile = target.files?.[0] || null
    
    if (!selectedFile) {
      clearFile()
      return
    }
    
    if (validateFile(selectedFile)) {
      file.value = selectedFile
      
      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          filePreview.value = e.target?.result as string
        }
        reader.readAsDataURL(selectedFile)
      } else {
        // For non-image files, just show the filename
        filePreview.value = null
      }
    } else {
      // Invalid file, clear the input
      clearFile()
      if (target) target.value = ''
    }
  }

  /**
   * Clear the selected file and preview
   */
  function clearFile() {
    file.value = null
    filePreview.value = null
    fileError.value = null
  }

  return {
    file,
    filePreview,
    fileError,
    handleFileSelect,
    validateFile,
    clearFile
  }
}