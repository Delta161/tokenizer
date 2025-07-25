<script setup lang="ts">
import { computed } from 'vue'
import { useForm, useFileUpload, useLoading, useFormatter } from '@/composables'

// Define props and emits
const emit = defineEmits(['success'])

// Define form validation function
function validateForm(values) {
  const errors = {}
  
  if (!values.title.trim()) {
    errors.title = 'Title is required'
  }
  
  if (!values.description.trim()) {
    errors.description = 'Description is required'
  }
  
  if (values.price <= 0) {
    errors.price = 'Price must be greater than 0'
  }
  
  return errors
}

// Use composables
const { isLoading, error, withLoading } = useLoading()
const { formatCurrency } = useFormatter()

const {
  file,
  filePreview,
  fileError,
  handleFileSelect,
  clearFile
} = useFileUpload({
  maxSizeInMB: 5,
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
})

const {
  values,
  errors,
  touched,
  isSubmitting,
  handleChange,
  handleSubmit,
  resetForm
} = useForm(
  {
    title: '',
    description: '',
    price: 0,
    category: ''
  },
  validateForm
)

// Computed properties
const formattedPrice = computed(() => formatCurrency(values.price))
const isFormValid = computed(() => Object.values(errors).every(error => !error))

// Form submission handler
async function submitForm() {
  await handleSubmit(async (formValues) => {
    return withLoading(async () => {
      // Create form data with file if present
      const formData = new FormData()
      
      // Add form values
      Object.entries(formValues).forEach(([key, value]) => {
        formData.append(key, value)
      })
      
      // Add file if present
      if (file.value) {
        formData.append('image', file.value)
      }
      
      // Submit to API (example)
      // const response = await api.post('/endpoint', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Reset form after successful submission
      resetForm()
      clearFile()
      
      // Emit success event
      emit('success')
      
      return { success: true }
    })
  })
}
</script>

<template>
  <form @submit.prevent="submitForm" class="form">
    <div class="form-group">
      <label for="title">Title</label>
      <input
        id="title"
        v-model="values.title"
        @input="handleChange('title')"
        :class="{ 'error': touched.title && errors.title }"
        type="text"
      />
      <p v-if="touched.title && errors.title" class="error-text">{{ errors.title }}</p>
    </div>
    
    <div class="form-group">
      <label for="description">Description</label>
      <textarea
        id="description"
        v-model="values.description"
        @input="handleChange('description')"
        :class="{ 'error': touched.description && errors.description }"
      ></textarea>
      <p v-if="touched.description && errors.description" class="error-text">{{ errors.description }}</p>
    </div>
    
    <div class="form-group">
      <label for="price">Price</label>
      <input
        id="price"
        v-model.number="values.price"
        @input="handleChange('price')"
        :class="{ 'error': touched.price && errors.price }"
        type="number"
        step="0.01"
      />
      <p v-if="touched.price && errors.price" class="error-text">{{ errors.price }}</p>
      <p v-if="values.price > 0" class="helper-text">Formatted: {{ formattedPrice }}</p>
    </div>
    
    <div class="form-group">
      <label for="category">Category</label>
      <select
        id="category"
        v-model="values.category"
        @change="handleChange('category')"
      >
        <option value="">Select a category</option>
        <option value="electronics">Electronics</option>
        <option value="clothing">Clothing</option>
        <option value="books">Books</option>
      </select>
    </div>
    
    <div class="form-group">
      <label for="image">Image</label>
      <input
        id="image"
        type="file"
        accept="image/*"
        @change="handleFileSelect"
      />
      <p v-if="fileError" class="error-text">{{ fileError }}</p>
      
      <div v-if="filePreview" class="image-preview">
        <img :src="filePreview" alt="Preview" />
        <button type="button" @click="clearFile" class="remove-button">Remove</button>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <button 
      type="submit" 
      :disabled="isSubmitting || isLoading || !isFormValid"
      class="submit-button"
    >
      {{ isSubmitting || isLoading ? 'Submitting...' : 'Submit' }}
    </button>
  </form>
</template>

<style scoped>
.form {
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input,
textarea,
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  font-size: 1rem;
}

input.error,
textarea.error,
select.error {
  border-color: #dc3545;
}

.error-text {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.helper-text {
  color: #6c757d;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.image-preview {
  margin-top: 1rem;
  position: relative;
}

.image-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 0.25rem;
}

.remove-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 0.75rem;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
}

.submit-button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 0.25rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
}

.submit-button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
</style>