<template>
  <div class="project-form">
    <form @submit.prevent="submitForm" class="space-y-6">
      <!-- Form header -->
      <div class="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          {{ isEditMode ? 'Edit Project' : 'Create New Project' }}
        </h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ isEditMode ? 'Update your project information' : 'Fill in the details to create a new project' }}
        </p>
      </div>

      <!-- Form fields -->
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <div class="px-4 py-5 sm:p-6">
          <div class="grid grid-cols-1 gap-6">
            <!-- Title -->
            <div>
              <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
              <input
                id="title"
                v-model="form.title"
                type="text"
                class="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                :class="{ 'border-red-300': errors.title }"
              />
              <p v-if="errors.title" class="mt-2 text-sm text-red-600">{{ errors.title }}</p>
            </div>

            <!-- Description -->
            <div>
              <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                v-model="form.description"
                rows="4"
                class="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                :class="{ 'border-red-300': errors.description }"
              ></textarea>
              <p v-if="errors.description" class="mt-2 text-sm text-red-600">{{ errors.description }}</p>
            </div>

            <!-- Location fields -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Country -->
              <div>
                <label for="country" class="block text-sm font-medium text-gray-700">Country</label>
                <input
                  id="country"
                  v-model="form.country"
                  type="text"
                  class="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  :class="{ 'border-red-300': errors.country }"
                />
                <p v-if="errors.country" class="mt-2 text-sm text-red-600">{{ errors.country }}</p>
              </div>

              <!-- City -->
              <div>
                <label for="city" class="block text-sm font-medium text-gray-700">City</label>
                <input
                  id="city"
                  v-model="form.city"
                  type="text"
                  class="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  :class="{ 'border-red-300': errors.city }"
                />
                <p v-if="errors.city" class="mt-2 text-sm text-red-600">{{ errors.city }}</p>
              </div>
            </div>

            <!-- Token information -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Token Symbol -->
              <div>
                <label for="tokenSymbol" class="block text-sm font-medium text-gray-700">Token Symbol</label>
                <input
                  id="tokenSymbol"
                  v-model="form.tokenSymbol"
                  type="text"
                  class="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  :class="{ 'border-red-300': errors.tokenSymbol }"
                />
                <p v-if="errors.tokenSymbol" class="mt-2 text-sm text-red-600">{{ errors.tokenSymbol }}</p>
              </div>

              <!-- Total Tokens -->
              <div>
                <label for="totalTokens" class="block text-sm font-medium text-gray-700">Total Tokens</label>
                <input
                  id="totalTokens"
                  v-model.number="form.totalTokens"
                  type="number"
                  min="1"
                  class="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  :class="{ 'border-red-300': errors.totalTokens }"
                />
                <p v-if="errors.totalTokens" class="mt-2 text-sm text-red-600">{{ errors.totalTokens }}</p>
              </div>

              <!-- Price Per Token -->
              <div>
                <label for="pricePerToken" class="block text-sm font-medium text-gray-700">Price Per Token</label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    id="pricePerToken"
                    v-model.number="form.pricePerToken"
                    type="number"
                    min="0"
                    step="0.01"
                    class="focus:ring-primary-500 focus:border-primary-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    :class="{ 'border-red-300': errors.pricePerToken }"
                  />
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 sm:text-sm">USD</span>
                  </div>
                </div>
                <p v-if="errors.pricePerToken" class="mt-2 text-sm text-red-600">{{ errors.pricePerToken }}</p>
              </div>
            </div>

            <!-- Financial information -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Expected Yield -->
              <div>
                <label for="expectedYield" class="block text-sm font-medium text-gray-700">Expected Yield (%)</label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="expectedYield"
                    v-model.number="form.expectedYield"
                    type="number"
                    min="0"
                    step="0.01"
                    class="focus:ring-primary-500 focus:border-primary-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                    :class="{ 'border-red-300': errors.expectedYield }"
                  />
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
                <p v-if="errors.expectedYield" class="mt-2 text-sm text-red-600">{{ errors.expectedYield }}</p>
              </div>

              <!-- IRR -->
              <div>
                <label for="irr" class="block text-sm font-medium text-gray-700">IRR (%)</label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="irr"
                    v-model.number="form.irr"
                    type="number"
                    min="0"
                    step="0.01"
                    class="focus:ring-primary-500 focus:border-primary-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                    :class="{ 'border-red-300': errors.irr }"
                  />
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
                <p v-if="errors.irr" class="mt-2 text-sm text-red-600">{{ errors.irr }}</p>
              </div>

              <!-- Value Growth -->
              <div>
                <label for="valueGrowth" class="block text-sm font-medium text-gray-700">Value Growth (%)</label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="valueGrowth"
                    v-model.number="form.valueGrowth"
                    type="number"
                    min="0"
                    step="0.01"
                    class="focus:ring-primary-500 focus:border-primary-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                    :class="{ 'border-red-300': errors.valueGrowth }"
                  />
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span class="text-gray-500 sm:text-sm">%</span>
                  </div>
                </div>
                <p v-if="errors.valueGrowth" class="mt-2 text-sm text-red-600">{{ errors.valueGrowth }}</p>
              </div>
            </div>

            <!-- Tags -->
            <div>
              <label for="tags" class="block text-sm font-medium text-gray-700">Tags</label>
              <div class="mt-1">
                <div class="flex flex-wrap gap-2 mb-2">
                  <span
                    v-for="(tag, index) in form.tags"
                    :key="index"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-primary-100 text-primary-800"
                  >
                    {{ tag }}
                    <button
                      type="button"
                      @click="removeTag(index)"
                      class="ml-1.5 inline-flex text-primary-500 focus:outline-none"
                    >
                      <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fill-rule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>
                  </span>
                </div>
                <div class="flex">
                  <input
                    id="newTag"
                    v-model="newTag"
                    type="text"
                    placeholder="Add a tag"
                    class="focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    @keydown.enter.prevent="addTag"
                  />
                  <button
                    type="button"
                    @click="addTag"
                    class="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Add
                  </button>
                </div>
              </div>
              <p v-if="errors.tags" class="mt-2 text-sm text-red-600">{{ errors.tags }}</p>
            </div>

            <!-- Project Image -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Project Image</label>
              <div class="mt-1 flex items-center">
                <div v-if="imagePreview" class="flex-shrink-0 h-24 w-24 rounded-md overflow-hidden bg-gray-100">
                  <img :src="imagePreview" alt="Project image preview" class="h-full w-full object-cover" />
                </div>
                <div v-else class="flex-shrink-0 h-24 w-24 rounded-md overflow-hidden bg-gray-100">
                  <svg class="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div class="ml-5 flex-1">
                  <div class="relative">
                    <input
                      type="file"
                      ref="fileInput"
                      @change="handleFileChange"
                      accept="image/*"
                      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div class="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div class="space-y-1 text-center">
                        <svg
                          class="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                        <div class="flex text-sm text-gray-600">
                          <label
                            for="file-upload"
                            class="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                          >
                            <span>Upload a file</span>
                          </label>
                          <p class="pl-1">or drag and drop</p>
                        </div>
                        <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p v-if="errors.image" class="mt-2 text-sm text-red-600">{{ errors.image }}</p>
            </div>
          </div>
        </div>

        <!-- Form actions -->
        <div class="px-4 py-3 bg-gray-50 text-right sm:px-6">
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="cancel"
              class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                v-if="loading"
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {{ isEditMode ? 'Update Project' : 'Create Project' }}
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useProjectStore } from '../store/projectStore'
import type { CreateProjectRequest, UpdateProjectRequest } from '../types/Project'

const props = defineProps<{
  projectId?: string
}>()

const router = useRouter()
const route = useRoute()
const projectStore = useProjectStore()

// State
const form = ref<CreateProjectRequest & { id?: string }>({  
  title: '',
  description: '',
  country: '',
  city: '',
  tokenSymbol: '',
  totalTokens: 0,
  pricePerToken: 0,
  expectedYield: 0,
  irr: 0,
  valueGrowth: 0,
  tags: []
})

const errors = ref<Record<string, string>>({})
const loading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const newTag = ref('')

// Computed
const isEditMode = computed(() => !!props.projectId)

// Methods
function addTag() {
  if (newTag.value.trim() && !form.value.tags.includes(newTag.value.trim())) {
    form.value.tags.push(newTag.value.trim())
    newTag.value = ''
  }
}

function removeTag(index: number) {
  form.value.tags.splice(index, 1)
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    imageFile.value = target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(imageFile.value)
  }
}

async function uploadImage(projectId: string): Promise<void> {
  if (!imageFile.value) return

  try {
    const formData = new FormData()
    formData.append('image', imageFile.value)
    await projectStore.uploadProjectImage(projectId, formData)
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

function validateForm(): boolean {
  errors.value = {}
  let isValid = true

  if (!form.value.title) {
    errors.value.title = 'Title is required'
    isValid = false
  }

  if (!form.value.description) {
    errors.value.description = 'Description is required'
    isValid = false
  }

  if (!form.value.country) {
    errors.value.country = 'Country is required'
    isValid = false
  }

  if (!form.value.tokenSymbol) {
    errors.value.tokenSymbol = 'Token symbol is required'
    isValid = false
  }

  if (!form.value.totalTokens || form.value.totalTokens <= 0) {
    errors.value.totalTokens = 'Total tokens must be greater than 0'
    isValid = false
  }

  if (!form.value.pricePerToken || form.value.pricePerToken <= 0) {
    errors.value.pricePerToken = 'Price per token must be greater than 0'
    isValid = false
  }

  return isValid
}

async function submitForm() {
  if (!validateForm()) return

  loading.value = true
  errors.value = {}

  try {
    if (isEditMode.value && props.projectId) {
      // Update existing project
      const updateData: UpdateProjectRequest = {
        id: props.projectId,
        ...form.value
      }
      const updatedProject = await projectStore.updateProject(updateData)

      // Upload new image if selected
      if (imageFile.value) {
        await uploadImage(updatedProject.id)
      }

      router.push(`/projects/${updatedProject.id}`)
    } else {
      // Create new project
      const newProject = await projectStore.createProject(form.value)

      // Upload image if selected
      if (imageFile.value && newProject.id) {
        await uploadImage(newProject.id)
      }

      router.push(`/projects/${newProject.id}`)
    }
  } catch (err: any) {
    console.error('Error submitting form:', err)
    
    // Handle validation errors from the server
    if (err.errors) {
      errors.value = err.errors
    } else {
      errors.value.general = err.message || 'An error occurred. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

function cancel() {
  if (isEditMode.value && props.projectId) {
    router.push(`/projects/${props.projectId}`)
  } else {
    router.push('/projects')
  }
}

// Load project data if in edit mode
onMounted(async () => {
  if (isEditMode.value && props.projectId) {
    loading.value = true
    try {
      const project = await projectStore.fetchProjectById(props.projectId)
      if (project) {
        // Map project data to form
        form.value = {
          id: project.id,
          title: project.title || project.projectTitle || '',
          description: project.description || '',
          country: project.country || '',
          city: project.city || '',
          tokenSymbol: project.tokenSymbol || '',
          totalTokens: project.totalTokens || 0,
          pricePerToken: project.pricePerToken || 0,
          expectedYield: project.expectedYield || project.apr || 0,
          irr: project.irr || 0,
          valueGrowth: project.valueGrowth || 0,
          tags: project.tags || (project.tag ? [project.tag] : [])
        }

        // Set image preview if available
        if (project.projectImage) {
          imagePreview.value = project.projectImage
        } else if (project.imageUrls && project.imageUrls.length > 0) {
          imagePreview.value = project.imageUrls[0]
        }
      }
    } catch (error) {
      console.error('Error loading project:', error)
    } finally {
      loading.value = false
    }
  }
})
</script>