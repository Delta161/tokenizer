<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUser } from '../composables/useUser'
import { UserSettings } from '../types'

// Props
const props = defineProps<{
  initialSettings?: UserSettings
  loading?: boolean
}>()

// Emits
const emit = defineEmits<{
  'update:settings': [settings: UserSettings]
  'save': [settings: UserSettings]
}>()

// User composable
const { currentUser, updateCurrentUser } = useUser()

// Form state
const settings = ref<UserSettings>(props.initialSettings || {
  emailNotifications: true,
  pushNotifications: false,
  darkMode: false,
  language: 'en',
  timezone: 'UTC',
  twoFactorEnabled: false
})

// Form submission state
const isSubmitting = ref(false)
const submitError = ref('')
const submitSuccess = ref(false)

// Computed properties
const isLoading = computed(() => props.loading || isSubmitting.value)
const availableLanguages = ref([
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' }
])

const availableTimezones = ref([
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Australia/Sydney', label: 'Sydney' }
])

// Initialize settings from current user if available
onMounted(() => {
  if (currentUser.value?.settings && !props.initialSettings) {
    settings.value = { ...currentUser.value.settings }
  }
})

// Watch for changes and emit update event
function handleChange() {
  emit('update:settings', settings.value)
}

// Handle form submission
async function handleSubmit() {
  try {
    isSubmitting.value = true
    submitError.value = ''
    submitSuccess.value = false
    
    // Emit save event
    emit('save', settings.value)
    
    // If we have a current user, update their settings
    if (currentUser.value) {
      await updateCurrentUser({
        settings: settings.value
      })
    }
    
    submitSuccess.value = true
    setTimeout(() => {
      submitSuccess.value = false
    }, 3000)
  } catch (error) {
    submitError.value = error instanceof Error ? error.message : 'Failed to save settings'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="settings-form">
    <div v-if="submitSuccess" class="success-message">
      Settings saved successfully!
    </div>
    
    <div v-if="submitError" class="error-message">
      {{ submitError }}
    </div>
    
    <div class="form-section">
      <h3>Notifications</h3>
      
      <div class="form-group">
        <div class="toggle-control">
          <label for="emailNotifications">Email Notifications</label>
          <div class="toggle-switch">
            <input 
              type="checkbox" 
              id="emailNotifications" 
              v-model="settings.emailNotifications"
              @change="handleChange"
            />
            <span class="toggle-slider"></span>
          </div>
        </div>
        <p class="form-help">Receive email notifications for important updates and activity.</p>
      </div>
      
      <div class="form-group">
        <div class="toggle-control">
          <label for="pushNotifications">Push Notifications</label>
          <div class="toggle-switch">
            <input 
              type="checkbox" 
              id="pushNotifications" 
              v-model="settings.pushNotifications"
              @change="handleChange"
            />
            <span class="toggle-slider"></span>
          </div>
        </div>
        <p class="form-help">Receive browser push notifications for real-time updates.</p>
      </div>
    </div>
    
    <div class="form-section">
      <h3>Appearance</h3>
      
      <div class="form-group">
        <div class="toggle-control">
          <label for="darkMode">Dark Mode</label>
          <div class="toggle-switch">
            <input 
              type="checkbox" 
              id="darkMode" 
              v-model="settings.darkMode"
              @change="handleChange"
            />
            <span class="toggle-slider"></span>
          </div>
        </div>
        <p class="form-help">Enable dark mode for a more comfortable viewing experience in low light.</p>
      </div>
    </div>
    
    <div class="form-section">
      <h3>Localization</h3>
      
      <div class="form-group">
        <label for="language">Language</label>
        <select 
          id="language" 
          v-model="settings.language"
          @change="handleChange"
          class="form-select"
        >
          <option 
            v-for="lang in availableLanguages" 
            :key="lang.value" 
            :value="lang.value"
          >
            {{ lang.label }}
          </option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="timezone">Timezone</label>
        <select 
          id="timezone" 
          v-model="settings.timezone"
          @change="handleChange"
          class="form-select"
        >
          <option 
            v-for="tz in availableTimezones" 
            :key="tz.value" 
            :value="tz.value"
          >
            {{ tz.label }}
          </option>
        </select>
      </div>
    </div>
    
    <div class="form-section">
      <h3>Security</h3>
      
      <div class="form-group">
        <div class="toggle-control">
          <label for="twoFactorEnabled">Two-Factor Authentication</label>
          <div class="toggle-switch">
            <input 
              type="checkbox" 
              id="twoFactorEnabled" 
              v-model="settings.twoFactorEnabled"
              @change="handleChange"
            />
            <span class="toggle-slider"></span>
          </div>
        </div>
        <p class="form-help">Enable two-factor authentication for an additional layer of security.</p>
      </div>
    </div>
    
    <div class="form-actions">
      <button 
        type="submit" 
        class="btn-primary" 
        :disabled="isLoading"
      >
        <span v-if="isLoading">Saving...</span>
        <span v-else>Save Settings</span>
      </button>
    </div>
  </form>
</template>

<style scoped>
.settings-form {
  max-width: 600px;
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.form-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: var(--color-heading);
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-help {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--color-text-light);
}

.form-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-background);
  color: var(--color-text);
  font-size: 1rem;
}

.toggle-control {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: var(--color-primary);
}

input:focus + .toggle-slider {
  box-shadow: 0 0 1px var(--color-primary);
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.form-actions {
  margin-top: 2rem;
}

.btn-primary {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

.btn-primary:disabled {
  background-color: var(--color-border);
  cursor: not-allowed;
}

.success-message {
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: rgba(0, 200, 83, 0.1);
  color: #00c853;
  border-radius: 4px;
  font-weight: 500;
}

.error-message {
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: rgba(244, 67, 54, 0.1);
  color: #f44336;
  border-radius: 4px;
  font-weight: 500;
}
</style>