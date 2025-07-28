<template>
  <div class="client-application-form">
    <h2 class="text-xl font-semibold mb-4">Client Application</h2>
    
    <form @submit.prevent="submitApplication" class="space-y-4">
      <!-- Company Name -->
      <div class="form-group">
        <label for="companyName" class="block text-sm font-medium text-gray-700">Company Name *</label>
        <input 
          id="companyName" 
          v-model="formData.companyName" 
          type="text" 
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          :class="{ 'border-red-500': errors.companyName }"
          required
        >
        <p v-if="errors.companyName" class="mt-1 text-sm text-red-600">{{ errors.companyName }}</p>
      </div>
      
      <!-- Contact Email -->
      <div class="form-group">
        <label for="contactEmail" class="block text-sm font-medium text-gray-700">Contact Email *</label>
        <input 
          id="contactEmail" 
          v-model="formData.contactEmail" 
          type="email" 
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          :class="{ 'border-red-500': errors.contactEmail }"
          required
        >
        <p v-if="errors.contactEmail" class="mt-1 text-sm text-red-600">{{ errors.contactEmail }}</p>
      </div>
      
      <!-- Contact Phone -->
      <div class="form-group">
        <label for="contactPhone" class="block text-sm font-medium text-gray-700">Contact Phone</label>
        <input 
          id="contactPhone" 
          v-model="formData.contactPhone" 
          type="tel" 
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          :class="{ 'border-red-500': errors.contactPhone }"
        >
        <p v-if="errors.contactPhone" class="mt-1 text-sm text-red-600">{{ errors.contactPhone }}</p>
      </div>
      
      <!-- Country -->
      <div class="form-group">
        <label for="country" class="block text-sm font-medium text-gray-700">Country *</label>
        <select 
          id="country" 
          v-model="formData.country" 
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          :class="{ 'border-red-500': errors.country }"
          required
        >
          <option value="" disabled>Select a country</option>
          <option v-for="country in countries" :key="country.code" :value="country.code">
            {{ country.name }}
          </option>
        </select>
        <p v-if="errors.country" class="mt-1 text-sm text-red-600">{{ errors.country }}</p>
      </div>
      
      <!-- Legal Entity Number -->
      <div class="form-group">
        <label for="legalEntityNumber" class="block text-sm font-medium text-gray-700">Legal Entity Number</label>
        <input 
          id="legalEntityNumber" 
          v-model="formData.legalEntityNumber" 
          type="text" 
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          :class="{ 'border-red-500': errors.legalEntityNumber }"
        >
        <p v-if="errors.legalEntityNumber" class="mt-1 text-sm text-red-600">{{ errors.legalEntityNumber }}</p>
      </div>
      
      <!-- Wallet Address -->
      <div class="form-group">
        <label for="walletAddress" class="block text-sm font-medium text-gray-700">Wallet Address</label>
        <input 
          id="walletAddress" 
          v-model="formData.walletAddress" 
          type="text" 
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          :class="{ 'border-red-500': errors.walletAddress }"
        >
        <p v-if="errors.walletAddress" class="mt-1 text-sm text-red-600">{{ errors.walletAddress }}</p>
      </div>
      
      <!-- Submit Button -->
      <div class="form-group">
        <button 
          type="submit" 
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          :disabled="loading"
        >
          <span v-if="loading">Submitting...</span>
          <span v-else>Submit Application</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { clientController } from '../controllers/client.controller'
import { validateClientApplication } from '../validators/clientValidators'
import type { ClientApplicationRequest } from '../types/Client'

// Sample countries list - in a real app, this would come from an API or config
const countries = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  // Add more countries as needed
]

const router = useRouter()
const loading = ref(false)
const errors = reactive<Record<string, string>>({})

// Form data
const formData = reactive<ClientApplicationRequest>({
  companyName: '',
  contactEmail: '',
  contactPhone: '',
  country: '',
  legalEntityNumber: '',
  walletAddress: ''
})

/**
 * Submit the client application
 */
async function submitApplication() {
  // Clear previous errors
  Object.keys(errors).forEach(key => delete errors[key])
  
  // Validate form data
  const validation = validateClientApplication(formData)
  
  if (!validation.success) {
    // Map validation errors to form fields
    validation.error?.errors.forEach(err => {
      if (err.path.length > 0) {
        errors[err.path[0]] = err.message
      }
    })
    return
  }
  
  loading.value = true
  
  try {
    // In a real implementation, this would call a service method to submit the application
    // await clientService.submitApplication(validation.data)
    
    // For now, we'll just simulate a successful submission
    setTimeout(() => {
      loading.value = false
      // Redirect to success page or dashboard
      router.push('/client/application-submitted')
    }, 1500)
  } catch (error) {
    console.error('Error submitting client application:', error)
    loading.value = false
    // Handle submission error
  }
}
</script>

<style scoped>
.client-application-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>