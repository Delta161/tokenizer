<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useFileUpload, useLoading, useNotification } from '@/composables'
import * as projectService from '../services/projectService'
import type { CreateProjectRequest, FormErrors } from '../types/Project'

// Router
const router = useRouter()

// Initialize composables
const { isLoading } = useLoading()
const { showSuccess, showError } = useNotification()

// Form validation schema
const validateForm = (values: CreateProjectRequest) => {
  const errors: Partial<Record<keyof CreateProjectRequest, string>> = {}
  
  if (!values.projectTitle.trim()) errors.projectTitle = 'Project title is required'
  if (!values.location.trim()) errors.location = 'Location is required'
  if (!values.description.trim()) errors.description = 'Description is required'
  
  if (!values.tokenSymbol.trim()) {
    errors.tokenSymbol = 'Token symbol is required'
  } else if (values.tokenSymbol.length > 8) {
    errors.tokenSymbol = 'Token symbol must be 8 characters or less'
  } else if (!/^[A-Z0-9]+$/.test(values.tokenSymbol)) {
    errors.tokenSymbol = 'Token symbol must contain only uppercase letters and numbers'
  }
  
  if (values.totalTokens <= 0) errors.totalTokens = 'Total tokens must be greater than 0'
  if (values.pricePerToken < 0.01) errors.pricePerToken = 'Price per token must be at least 0.01'
  
  if (values.expectedYield !== undefined && (values.expectedYield < 0 || values.expectedYield > 100)) {
    errors.expectedYield = 'Expected yield must be between 0 and 100'
  }
  
  return errors
}

// Initialize form
const { 
  values: formData, 
  errors, 
  handleChange, 
  handleSubmit,
  setFieldValue,
  isSubmitting,
  setErrors
} = useForm<CreateProjectRequest>({
  initialValues: {
    projectTitle: '',
    location: '',
    description: '',
    tokenSymbol: '',
    totalTokens: 0,
    pricePerToken: 0,
    expectedYield: undefined,
    projectImage: undefined
  },
  validate: validateForm,
  onSubmit: async (values) => {
    try {
      const response = await projectService.createProject(values)
      showSuccess('Project created successfully!')
      
      // Redirect to projects page after a short delay
      setTimeout(() => {
        router.push('/projects')
      }, 1500)
      
    } catch (err) {
      // Try to parse error response for validation errors
      if (err instanceof Error) {
        try {
          const errorData = JSON.parse(err.message)
          if (errorData.errors) {
            setErrors(errorData.errors)
          } else {
            showError(errorData.message || 'Failed to create project')
          }
        } catch {
          showError(err.message || 'Failed to create project')
        }
      } else {
        showError('An unexpected error occurred')
      }
      throw err
    }
  }
})

// File upload handling
const { 
  file: projectImage, 
  filePreview: imagePreview, 
  fileError, 
  handleFileSelect, 
  clearFile: removeImage 
} = useFileUpload({
  maxSizeInMB: 5,
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  onFileSelected: (file) => {
    setFieldValue('projectImage', file)
  }
})

// Reference to file input element
const fileInput = ref<HTMLInputElement | null>(null)

// Computed properties
const tokenSymbolLength = computed(() => formData.tokenSymbol.length)
const isFormValid = computed(() => Object.keys(validateForm(formData)).length === 0)

// Input handlers with special behavior
function handleTokenSymbolInput(event: Event) {
  const input = event.target as HTMLInputElement
  const value = input.value.toUpperCase()
  setFieldValue('tokenSymbol', value)
}

function dismissError() {
  setErrors({ general: undefined })
}
</script>

<template>
  <div class="form-container">
    <div class="form-wrapper">
      <div class="form-header">
        <h2>Add New Project</h2>
        <p>Create a new tokenized real estate project</p>
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
          @input="handleChange('projectTitle')"
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
          @input="handleChange('location')"
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
          @input="handleChange('description')"
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
          @input="handleTokenSymbolInput"
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
              @input="handleChange('totalTokens')"
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
              @input="handleChange('pricePerToken')"
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
          @input="handleChange('expectedYield')"
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
            :class="{ 'border-red-500': fileError }"
            aria-describedby="projectImage-error projectImage-help"
          />
          <p id="projectImage-help" class="text-gray-500">
            Upload an image of the property (max 5MB, JPG/PNG/GIF/WebP)
          </p>
          <p v-if="fileError" id="projectImage-error" class="text-red-600">
            {{ fileError }}
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
          :disabled="!isFormValid || isSubmitting || isLoading"
          class="btn btn-primary"
        >
          <span v-if="isSubmitting || isLoading" class="flex items-center">
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