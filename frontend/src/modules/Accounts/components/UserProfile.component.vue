<!-- src/modules/Accounts/components/UserProfile.component.vue -->
<template>
  <section class="user-profile">
    <div v-if="loading" class="loading">
      Loading profile…
    </div>
    <div v-else-if="error" class="error">
      <p>Error: {{ error }}</p>
    </div>
    <div v-else>
      <!-- Toggle between edit form and display card -->
      <div v-if="isEditing">
        <form @submit.prevent="saveProfile" class="edit-form">
          <div class="form-row">
            <label for="firstName">First Name</label>
            <input id="firstName" v-model="editForm.firstName" required />
          </div>
          <div class="form-row">
            <label for="lastName">Last Name</label>
            <input id="lastName" v-model="editForm.lastName" required />
          </div>
          <div class="form-row">
            <label for="bio">Bio</label>
            <textarea id="bio" v-model="editForm.bio" />
          </div>
          <div class="form-row">
            <label for="location">Location</label>
            <input id="location" v-model="editForm.location" />
          </div>
          <!-- Add more fields as needed -->
          <div class="form-actions">
            <button type="submit">Save</button>
            <button type="button" @click="cancelEdit">Cancel</button>
          </div>
        </form>
      </div>
      <div v-else>
        <UserProfileCard
          :user="user"
          :editable="editable"
          @update="startEdit"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import apiClient from '@/services/apiClient'
import UserProfileCard from './UserProfileCard.vue'

// Props: userId (optional) for admin editing, editable flag
defineProps<{ userId?: string; editable?: boolean }>()

// State variables
const user = ref<any | null>(null)
const loading = ref<boolean>(true)
const error = ref<string | null>(null)
const isEditing = ref<boolean>(false)
const editForm = reactive({
  firstName: '',
  lastName: '',
  bio: '',
  location: '',
})

// Fetch the user data on mount
onMounted(async () => {
  try {
    const url = props.userId ? `/users/${props.userId}` : '/users/profile'
    const response = await apiClient.get(url)
    user.value = response.data.user

    // Pre-fill the edit form with the existing data
    editForm.firstName = user.value?.firstName || ''
    editForm.lastName = user.value?.lastName || ''
    editForm.bio = user.value?.bio || ''
    editForm.location = user.value?.location || ''
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load profile'
  } finally {
    loading.value = false
  }
})

// Start editing
function startEdit() {
  isEditing.value = true
}

// Cancel editing and reset form
function cancelEdit() {
  if (user.value) {
    editForm.firstName = user.value.firstName || ''
    editForm.lastName = user.value.lastName || ''
    editForm.bio = user.value.bio || ''
    editForm.location = user.value.location || ''
  }
  isEditing.value = false
}

// Save the profile changes
async function saveProfile() {
  if (!user.value) return
  try {
    loading.value = true
    const dataToSend = { ...editForm }

    // PATCH /users/profile for the current user, or /users/:id for admin
    const url = props.userId ? `/users/${props.userId}` : '/users/profile'
    const response = await apiClient.patch(url, dataToSend)
    user.value = response.data.user

    // Update form state with returned data
    editForm.firstName = user.value.firstName || ''
    editForm.lastName = user.value.lastName || ''
    editForm.bio = user.value.bio || ''
    editForm.location = user.value.location || ''
    isEditing.value = false
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to update user'
  } finally {
    loading.value = false
  }
}

const editable = props.editable ?? true
</script>

<style scoped>
.user-profile {
  max-width: 600px;
  margin: 0 auto;
}
.loading {
  text-align: center;
  padding: 1rem;
}
.error {
  color: red;
  text-align: center;
}
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.form-row {
  display: flex;
  flex-direction: column;
}
.form-actions {
  display: flex;
  gap: 1rem;
}
</style>
