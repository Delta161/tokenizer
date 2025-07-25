<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  useForm, 
  useLoading, 
  useFileUpload, 
  useFormatter, 
  useNotification, 
  useConfirmation 
} from '@/composables'

// Define types
interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl?: string
  category: string
  inStock: boolean
}

interface ProductFormValues {
  name: string
  description: string
  price: number
  category: string
  inStock: boolean
}

interface ProductFormErrors {
  name?: string
  description?: string
  price?: string
  category?: string
  general?: string
}

// Props and emits
const props = defineProps<{
  productId?: string
}>()

const emit = defineEmits<{
  (e: 'saved', product: Product): void
  (e: 'cancelled'): void
}>()

// Use composables
const { isLoading, error: apiError, withLoading } = useLoading()
const { formatCurrency } = useFormatter()
const { success, error: showError } = useNotification()
const { confirmDanger } = useConfirmation()

const {
  file,
  filePreview,
  fileError,
  handleFileSelect,
  clearFile
} = useFileUpload({
  maxSizeInMB: 2,
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
})

// Form validation function
function validateProductForm(values: ProductFormValues): ProductFormErrors {
  const errors: ProductFormErrors = {}
  
  if (!values.name.trim()) {
    errors.name = 'Product name is required'
  } else if (values.name.length > 100) {
    errors.name = 'Product name must be less than 100 characters'
  }
  
  if (!values.description.trim()) {
    errors.description = 'Description is required'
  }
  
  if (values.price <= 0) {
    errors.price = 'Price must be greater than 0'
  }
  
  if (!values.category) {
    errors.category = 'Please select a category'
  }
  
  return errors
}

// Use form composable
const {
  values,
  errors,
  touched,
  isSubmitting,
  handleChange,
  handleSubmit,
  resetForm,
  setValues
} = useForm<ProductFormValues, ProductFormErrors>(
  {
    name: '',
    description: '',
    price: 0,
    category: '',
    inStock: true
  },
  validateProductForm
)

// State
const existingProduct = ref<Product | null>(null)
const isEditMode = computed(() => !!props.productId)
const formattedPrice = computed(() => formatCurrency(values.price))

// Categories (would typically come from an API)
const categories = [
  { id: 'electronics', name: 'Electronics' },
  { id: 'clothing', name: 'Clothing' },
  { id: 'books', name: 'Books' },
  { id: 'home', name: 'Home & Kitchen' },
  { id: 'sports', name: 'Sports & Outdoors' }
]

// Methods
async function fetchProduct() {
  if (!props.productId) return
  
  await withLoading(async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock product data
      const product: Product = {
        id: props.productId,
        name: 'Sample Product',
        description: 'This is a sample product description that would normally come from an API.',
        price: 99.99,
        imageUrl: 'https://via.placeholder.com/300',
        category: 'electronics',
        inStock: true
      }
      
      existingProduct.value = product
      
      // Set form values
      setValues({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        inStock: product.inStock
      })
      
      // Set file preview if product has an image
      if (product.imageUrl) {
        filePreview.value = product.imageUrl
      }
    } catch (err) {
      showError('Failed to load product')
    }
  })
}

async function saveProduct() {
  await handleSubmit(async (formValues) => {
    return withLoading(async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Create product object
        const savedProduct: Product = {
          id: existingProduct.value?.id || `product-${Date.now()}`,
          name: formValues.name,
          description: formValues.description,
          price: formValues.price,
          category: formValues.category,
          inStock: formValues.inStock,
          imageUrl: file.value ? URL.createObjectURL(file.value) : existingProduct.value?.imageUrl
        }
        
        // Show success message
        success(`Product ${isEditMode.value ? 'updated' : 'created'} successfully`)
        
        // Emit saved event
        emit('saved', savedProduct)
        
        return savedProduct
      } catch (err) {
        showError(`Failed to ${isEditMode.value ? 'update' : 'create'} product`)
        throw err
      }
    })
  })
}

async function handleCancel() {
  // If form has been modified, confirm before cancelling
  if (Object.keys(touched).some(key => touched[key as keyof typeof touched])) {
    const confirmed = await confirmDanger('You have unsaved changes. Are you sure you want to cancel?')
    if (!confirmed) return
  }
  
  emit('cancelled')
}

async function handleDelete() {
  const confirmed = await confirmDanger(
    'Are you sure you want to delete this product? This action cannot be undone.'
  )
  
  if (confirmed) {
    await withLoading(async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        success('Product deleted successfully')
        emit('cancelled')
      } catch (err) {
        showError('Failed to delete product')
      }
    })
  }
}

// Load product data if in edit mode
onMounted(() => {
  if (isEditMode.value) {
    fetchProduct()
  }
})
</script>

<template>
  <div class="product-form-container">
    <h2>{{ isEditMode ? 'Edit Product' : 'Create New Product' }}</h2>
    
    <div v-if="isLoading && !isSubmitting" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Loading product data...</p>
    </div>
    
    <form @submit.prevent="saveProduct" class="product-form">
      <div v-if="apiError" class="error-message">
        {{ apiError }}
      </div>
      
      <div class="form-grid">
        <!-- Left column - Form fields -->
        <div class="form-fields">
          <div class="form-group">
            <label for="name">Product Name</label>
            <input
              id="name"
              v-model="values.name"
              @input="handleChange('name')"
              :class="{ 'error': touched.name && errors.name }"
              type="text"
            />
            <p v-if="touched.name && errors.name" class="error-text">{{ errors.name }}</p>
          </div>
          
          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              v-model="values.description"
              @input="handleChange('description')"
              :class="{ 'error': touched.description && errors.description }"
              rows="4"
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
              min="0"
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
              :class="{ 'error': touched.category && errors.category }"
            >
              <option value="">Select a category</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
            <p v-if="touched.category && errors.category" class="error-text">{{ errors.category }}</p>
          </div>
          
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="values.inStock"
                @change="handleChange('inStock')"
              />
              <span>In Stock</span>
            </label>
          </div>
        </div>
        
        <!-- Right column - Image upload -->
        <div class="image-upload">
          <label>Product Image</label>
          <div 
            class="image-drop-area"
            :class="{ 'has-image': filePreview, 'has-error': fileError }"
          >
            <div v-if="!filePreview" class="upload-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
                <line x1="16" y1="5" x2="22" y2="5"></line>
                <line x1="19" y1="2" x2="19" y2="8"></line>
                <circle cx="9" cy="9" r="2"></circle>
                <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
              </svg>
              <p>Click or drag to upload an image</p>
            </div>
            
            <img v-else :src="filePreview" alt="Product image preview" class="image-preview" />
            
            <input
              type="file"
              accept="image/*"
              @change="handleFileSelect"
              class="file-input"
            />
            
            <button 
              v-if="filePreview" 
              type="button" 
              @click="clearFile" 
              class="remove-image-button"
            >
              Remove Image
            </button>
          </div>
          <p v-if="fileError" class="error-text">{{ fileError }}</p>
        </div>
      </div>
      
      <div class="form-actions">
        <button 
          type="button" 
          @click="handleCancel" 
          class="cancel-button"
          :disabled="isSubmitting || isLoading"
        >
          Cancel
        </button>
        
        <button 
          v-if="isEditMode" 
          type="button" 
          @click="handleDelete" 
          class="delete-button"
          :disabled="isSubmitting || isLoading"
        >
          Delete
        </button>
        
        <button 
          type="submit" 
          class="save-button"
          :disabled="isSubmitting || isLoading"
        >
          {{ isSubmitting ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.product-form-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
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

.checkbox-group {
  margin-top: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-label input {
  width: auto;
  margin-right: 0.5rem;
}

.image-drop-area {
  border: 2px dashed #ddd;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-drop-area:hover {
  border-color: #007bff;
}

.image-drop-area.has-error {
  border-color: #dc3545;
}

.upload-placeholder {
  color: #6c757d;
}

.upload-placeholder svg {
  margin-bottom: 1rem;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.image-preview {
  max-width: 100%;
  max-height: 300px;
  border-radius: 0.25rem;
}

.remove-image-button {
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-button {
  background-color: #f8f9fa;
  color: #212529;
  border: 1px solid #ddd;
}

.delete-button {
  background-color: #dc3545;
  color: white;
  border: none;
}

.save-button {
  background-color: #007bff;
  color: white;
  border: none;
}

button {
  padding: 0.75rem 1.5rem;
  border-radius: 0.25rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

button:hover:not(:disabled) {
  opacity: 0.9;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>