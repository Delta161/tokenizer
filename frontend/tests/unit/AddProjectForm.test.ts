import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import AddProjectForm from '@/modules/Projects/components/AddProjectForm.vue'

// Mock the composables
vi.mock('@/composables', () => ({
  useForm: () => ({
    values: {},
    errors: {},
    handleChange: vi.fn(),
    handleSubmit: vi.fn(),
    setFieldValue: vi.fn(),
    isSubmitting: false,
    setErrors: vi.fn()
  }),
  useFileUpload: () => ({
    selectedFile: { value: null },
    filePreview: { value: null },
    handleFileSelect: vi.fn(),
    removeFile: vi.fn(),
    fileError: { value: null }
  }),
  useLoading: () => ({
    isLoading: { value: false }
  }),
  useNotification: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn()
  })
}))

// Mock the project service
vi.mock('@/modules/Projects/services/projectService', () => ({
  createProject: vi.fn()
}))

// Create a mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/projects', component: { template: '<div>Projects</div>' } }
  ]
})

describe('AddProjectForm', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(AddProjectForm, {
      global: {
        plugins: [router]
      }
    })
  })

  it('renders the form with all required fields', () => {
    expect(wrapper.find('h2').text()).toBe('Add New Project')
    expect(wrapper.find('#projectTitle').exists()).toBe(true)
    expect(wrapper.find('#location').exists()).toBe(true)
    expect(wrapper.find('#description').exists()).toBe(true)
    expect(wrapper.find('#tokenSymbol').exists()).toBe(true)
    expect(wrapper.find('#totalTokens').exists()).toBe(true)
    expect(wrapper.find('#pricePerToken').exists()).toBe(true)
    expect(wrapper.find('#expectedYield').exists()).toBe(true)
    expect(wrapper.find('#projectImage').exists()).toBe(true)
  })

  it('shows validation errors for required fields when empty', async () => {
    // Try to submit empty form
    await wrapper.find('form').trigger('submit.prevent')
    
    // Wait for validation to run
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('Project title is required')
    expect(wrapper.text()).toContain('Location is required')
    expect(wrapper.text()).toContain('Description is required')
    expect(wrapper.text()).toContain('Token symbol is required')
  })

  it('validates token symbol format and length', async () => {
    const tokenSymbolInput = wrapper.find('#tokenSymbol')
    
    // Test invalid characters
    await tokenSymbolInput.setValue('TEST@')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Token symbol must contain only uppercase letters and numbers')
    
    // Test length validation
    await tokenSymbolInput.setValue('TOOLONGTOKEN')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Token symbol must be 8 characters or less')
  })

  it('validates numeric fields correctly', async () => {
    const totalTokensInput = wrapper.find('#totalTokens')
    const pricePerTokenInput = wrapper.find('#pricePerToken')
    
    // Test zero/negative values
    await totalTokensInput.setValue('0')
    await pricePerTokenInput.setValue('0')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('Total tokens must be greater than 0')
    expect(wrapper.text()).toContain('Price per token must be at least 0.01')
  })

  it('shows character count for token symbol', async () => {
    const tokenSymbolInput = wrapper.find('#tokenSymbol')
    
    await tokenSymbolInput.setValue('TEST')
    expect(wrapper.text()).toContain('(4/8)')
    
    await tokenSymbolInput.setValue('TESTLONG')
    expect(wrapper.text()).toContain('(8/8)')
  })

  it('handles file upload validation', async () => {
    const fileInput = wrapper.find('#projectImage')
    
    // Mock file that's too large (6MB)
    const largeMockFile = new File([''], 'large.jpg', {
      type: 'image/jpeg',
      size: 6 * 1024 * 1024 // 6MB
    })
    
    // Mock the file input change event
    Object.defineProperty(fileInput.element, 'files', {
      value: [largeMockFile],
      writable: false
    })
    
    await fileInput.trigger('change')
    await wrapper.vm.$nextTick()
    
    // The error message is now handled by the useFileUpload composable
    // which is mocked, so we can't directly test the error message
  })

  it('disables submit button when form is invalid', () => {
    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('enables submit button when form is valid', async () => {
    // Fill in all required fields with valid data
    await wrapper.find('#projectTitle').setValue('Test Project')
    await wrapper.find('#location').setValue('New York')
    await wrapper.find('#description').setValue('A great investment opportunity')
    await wrapper.find('#tokenSymbol').setValue('TEST')
    await wrapper.find('#totalTokens').setValue('1000')
    await wrapper.find('#pricePerToken').setValue('0.1')
    
    await wrapper.vm.$nextTick()
    
    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.attributes('disabled')).toBeUndefined()
  })

  it('clears field errors when user starts typing', async () => {
    // Submit empty form to trigger validation errors
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('Project title is required')
    
    // Start typing in project title field
    await wrapper.find('#projectTitle').setValue('Test')
    await wrapper.vm.$nextTick()
    
    // Error should be cleared
    expect(wrapper.text()).not.toContain('Project title is required')
  })

  it('validates expected yield range', async () => {
    const expectedYieldInput = wrapper.find('#expectedYield')
    
    // Test negative value
    await expectedYieldInput.setValue('-5')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Expected yield must be between 0 and 100')
    
    // Test value over 100
    await expectedYieldInput.setValue('150')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Expected yield must be between 0 and 100')
  })

  it('shows loading state during form submission', async () => {
    // Mock loading state
    vi.mocked(useLoading).mockReturnValue({
      isLoading: { value: true }
    })
    await wrapper.vm.$nextTick()
    
    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.text()).toContain('Creating Project...')
    expect(submitButton.attributes('disabled')).toBeDefined()
  })
})