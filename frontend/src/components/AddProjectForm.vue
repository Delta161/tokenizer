<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useApi } from '../composables/useApi'
import type { CreateProjectRequest, FormErrors } from '../types/Project'

// Router and API composables
const router = useRouter()
const { postNewProject, loading, error } = useApi()

// Form data
const formData = reactive<CreateProjectRequest>({
  projectTitle: '',
  location: '',
  description: '',
  tokenSymbol: '',
  totalTokens: 0,
  pricePerToken: 0,
  expectedYield: undefined,
  projectImage: undefined
})

// Form validation and UI state
const errors = ref<FormErrors>({})
const showSuccessMessage = ref(false)
const imagePreview = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

// Computed properties
const tokenSymbolLength = computed(() => formData.tokenSymbol.length)
const isFormValid = computed(() => {
  return (
    formData.projectTitle.trim() !== '' &&
    formData.location.trim() !== '' &&
    formData.description.trim() !== '' &&
    formData.tokenSymbol.trim() !== '' &&
    formData.tokenSymbol.length <= 8 &&
    formData.totalTokens > 0 &&
    formData.pricePerToken >= 0.01
  )
})

// Validation functions
function validateField(field: keyof CreateProjectRequest): string | undefined {
  switch (field) {
    case 'projectTitle':
      return formData.projectTitle.trim() === '' ? 'Project title is required' : undefined
    case 'location':
      return formData.location.trim() === '' ? 'Location is required' : undefined
    case 'description':
      return formData.description.trim() === '' ? 'Description is required' : undefined
    case 'tokenSymbol':
      if (formData.tokenSymbol.trim() === '') return 'Token symbol is required'
      if (formData.tokenSymbol.length > 8) return 'Token symbol must be 8 characters or less'
      if (!/^[A-Z0-9]+$/.test(formData.tokenSymbol)) return 'Token symbol must contain only uppercase letters and numbers'
      return undefined
    case 'totalTokens':
      return formData.totalTokens <= 0 ? 'Total tokens must be greater than 0' : undefined
    case 'pricePerToken':
      return formData.pricePerToken < 0.01 ? 'Price per token must be at least 0.01' : undefined
    case 'expectedYield':
      if (formData.expectedYield !== undefined && (formData.expectedYield < 0 || formData.expectedYield > 100)) {
        return 'Expected yield must be between 0 and 100'
      }
      return undefined
    default:
      return undefined
  }
}

function validateForm(): boolean {
  const newErrors: FormErrors = {}
  
  // Validate all required fields
  const fields: (keyof CreateProjectRequest)[] = [
    'projectTitle',
    'location', 
    'description',
    'tokenSymbol',
    'totalTokens',
    'pricePerToken',
    'expectedYield'
  ]
  
  fields.forEach(field => {
    const error = validateField(field)
    if (error) {
      newErrors[field] = error
    }
  })
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// File handling
function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      errors.value.projectImage = 'Please select a valid image file'
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      errors.value.projectImage = 'Image file must be less than 5MB'
      return
    }
    
    formData.projectImage = file
    errors.value.projectImage = undefined
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function removeImage() {
  formData.projectImage = undefined
  imagePreview.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Form submission
async function handleSubmit() {
  if (!validateForm()) {
    return
  }
  
  try {
    const response = await postNewProject(formData)
    
    if (response.success) {
      showSuccessMessage.value = true
      // Redirect to projects page after a short delay
      setTimeout(() => {
        router.push('/projects')
      }, 2000)
    } else {
      // Handle validation errors from backend
      if (response.errors) {
        // Map backend errors to form errors
        Object.keys(response.errors).forEach(field => {
          if (response.errors![field] && response.errors![field].length > 0) {
            errors.value[field as keyof FormErrors] = response.errors![field][0]
          }
        })
      }
      
      // Show general error message
      if (response.message && !response.errors) {
        errors.value.general = response.message
      }
    }
  } catch (err) {
    const errorMessage = (err as Error).message
    
    // Try to parse error response for validation errors
    try {
      const errorData = JSON.parse(errorMessage)
      if (errorData.errors) {
        Object.keys(errorData.errors).forEach(field => {
          if (errorData.errors[field] && errorData.errors[field].length > 0) {
            errors.value[field as keyof FormErrors] = errorData.errors[field][0]
          }
        })
      } else {
        errors.value.general = errorData.message || 'An error occurred while creating the project'
      }
    } catch {
      errors.value.general = errorMessage || 'An error occurred while creating the project'
    }
  }
}

// Input handlers with validation
function handleInput(field: keyof CreateProjectRequest) {
  // Clear field error when user starts typing
  if (errors.value[field]) {
    errors.value[field] = undefined
  }
  
  // Auto-uppercase token symbol
  if (field === 'tokenSymbol') {
    formData.tokenSymbol = formData.tokenSymbol.toUpperCase()
  }
}

function dismissError() {
  errors.value.general = undefined
}
</script>

<template>
  <div class="form-container">
    <div class="form-wrapper">
      <div class="form-header">
        <h2>Add New Project</h2>
        <p>Create a new tokenized real estate project</p>
      </div>
    
    <!-- Success Message -->
    <div v-if="showSuccessMessage" class="bg-green-100">
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        Project created successfully! Redirecting to projects page...
      </div>
    </div>
    
    <!-- Error Alert -->
    <div v-if="errors.general" class="bg-red-100">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          {{ errors.general }}
        </div>
        <button @click="dismissError" class="text-red-500 hover:text-red-700">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
    
    <form @submit.prevent="handleSubmit">
      <!-- Project Title -->
      <div>
        <label for="projectTitle">
          Project Title *
        </label>
        <input
          id="projectTitle"
          v-model="formData.projectTitle"
          @input="handleInput('projectTitle')"
          type="text"
          required
          :class="{ 'border-red-500': errors.projectTitle }"
          placeholder="Enter project title"
          aria-describedby="projectTitle-error"
        />
        <p v-if="errors.projectTitle" id="projectTitle-error" class="text-red-600">
          {{ errors.projectTitle }}
        </p>
      </div>
      
      <!-- Location -->
      <div>
        <label for="location">
          Location *
        </label>
        <input
          id="location"
          v-model="formData.location"
          @input="handleInput('location')"
          type="text"
          required
          :class="{ 'border-red-500': errors.location }"
          placeholder="Enter property location"
          aria-describedby="location-error"
        />
        <p v-if="errors.location" id="location-error" class="text-red-600">
          {{ errors.location }}
        </p>
      </div>
      
      <!-- Description -->
      <div>
        <label for="description">
          Description *
        </label>
        <textarea
          id="description"
          v-model="formData.description"
          @input="handleInput('description')"
          required
          rows="4"
          :class="{ 'border-red-500': errors.description }"
          placeholder="Describe the property and investment opportunity"
          aria-describedby="description-error"
        ></textarea>
        <p v-if="errors.description" id="description-error" class="text-red-600">
          {{ errors.description }}
        </p>
      </div>
      
      <!-- Token Symbol -->
      <div>
        <label for="tokenSymbol">
          Token Symbol * ({{ tokenSymbolLength }}/8)
        </label>
        <input
          id="tokenSymbol"
          v-model="formData.tokenSymbol"
          @input="handleInput('tokenSymbol')"
          type="text"
          required
          maxlength="8"
          :class="{ 'border-red-500': errors.tokenSymbol }"
          placeholder="e.g., PROP1"
          aria-describedby="tokenSymbol-error tokenSymbol-help"
        />
        <p id="tokenSymbol-help" class="text-gray-500">
          Uppercase letters and numbers only, max 8 characters
        </p>
        <p v-if="errors.tokenSymbol" id="tokenSymbol-error" class="text-red-600">
          {{ errors.tokenSymbol }}
        </p>
      </div>
      
      <!-- Total Tokens and Price Per Token -->
        <div class="token-fields">
          <div>
            <label for="totalTokens">
              Total Tokens *
            </label>
            <input
              id="totalTokens"
              v-model.number="formData.totalTokens"
              @input="handleInput('totalTokens')"
              type="number"
              required
              min="1"
              step="1"
              :class="{ 'border-red-500': errors.totalTokens }"
              placeholder="1000"
              aria-describedby="totalTokens-error"
            />
            <p v-if="errors.totalTokens" id="totalTokens-error" class="text-red-600">
              {{ errors.totalTokens }}
            </p>
          </div>
          
          <div>
            <label for="pricePerToken">
              Price Per Token (ETH) *
            </label>
            <input
              id="pricePerToken"
              v-model.number="formData.pricePerToken"
              @input="handleInput('pricePerToken')"
              type="number"
              required
              min="0.01"
              step="0.01"
              :class="{ 'border-red-500': errors.pricePerToken }"
              placeholder="0.1"
              aria-describedby="pricePerToken-error"
            />
            <p v-if="errors.pricePerToken" id="pricePerToken-error" class="text-red-600">
              {{ errors.pricePerToken }}
            </p>
          </div>
        </div>
      
      <!-- Expected Yield -->
      <div>
        <label for="expectedYield">
          Expected Annual Yield (%) - Optional
        </label>
        <input
          id="expectedYield"
          v-model.number="formData.expectedYield"
          @input="handleInput('expectedYield')"
          type="number"
          min="0"
          max="100"
          step="0.1"
          :class="{ 'border-red-500': errors.expectedYield }"
          placeholder="8.5"
          aria-describedby="expectedYield-error"
        />
        <p v-if="errors.expectedYield" id="expectedYield-error" class="text-red-600">
          {{ errors.expectedYield }}
        </p>
      </div>
      
      <!-- Project Image -->
      <div>
        <label for="projectImage">
          Project Image - Optional
        </label>
        <div class="space-y-4">
          <input
            id="projectImage"
            ref="fileInput"
            @change="handleFileSelect"
            type="file"
            accept="image/*"
            :class="{ 'border-red-500': errors.projectImage }"
            aria-describedby="projectImage-error projectImage-help"
          />
          <p id="projectImage-help" class="text-gray-500">
            Upload an image of the property (max 5MB, JPG/PNG)
          </p>
          <p v-if="errors.projectImage" id="projectImage-error" class="text-red-600">
            {{ errors.projectImage }}
          </p>
          
          <!-- Image Preview -->
          <div v-if="imagePreview" class="relative inline-block">
            <img :src="imagePreview" alt="Project preview" class="w-32 h-32 object-cover rounded-md border" />
            <button
              @click="removeImage"
              type="button"
              class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        </div>
      </div>
      
      <!-- Submit Button -->
      <div class="form-actions">
        <button
          type="button"
          @click="router.push('/projects')"
          class="btn btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="!isFormValid || loading"
          class="btn btn-primary"
        >
          <span v-if="loading" class="flex items-center">
            <div class="loading-spinner mr-2"></div>
            Creating Project...
          </span>
          <span v-else>Create Project</span>
        </button>
      </div>
    </form>
    </div>
  </div>
</template>

<style scoped>
.form-container {
  min-height: calc(100vh - 120px);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  margin-top: 1rem;
}

.form-wrapper {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 800px;
}

.form-header {
  text-align: center;
  margin-bottom: 3rem;
}

.form-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-header p {
  color: #64748b;
  font-size: 1.1rem;
  opacity: 0.8;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn {
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.image-preview {
  margin-top: 1rem;
  text-align: center;
}

.image-preview img {
  max-width: 200px;
  max-height: 150px;
  border-radius: 12px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Form field styling to match the design system */
form > div {
  margin-bottom: 1.5rem;
}

.token-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

input, textarea, select {
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  box-sizing: border-box;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.text-red-600 {
  color: #dc2626;
}

.text-gray-500 {
  color: #6b7280;
}

.bg-green-100 {
  background-color: #dcfce7;
  border: 1px solid #bbf7d0;
  color: #166534;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.bg-red-100 {
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@media (max-width: 768px) {
  .form-container {
    padding: 1rem;
  }
  
  .form-wrapper {
    padding: 2rem;
  }
  
  .form-header h2 {
    font-size: 2rem;
  }
  
  .token-fields {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>