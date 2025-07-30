<template>
  <section class="user-profile">
    <!-- Loading and error states -->
    <div v-if="loading" class="loading">
      Loading profile…
    </div>
    <div v-else-if="error" class="error">
      Error: {{ error }}
    </div>
    <div v-else-if="user">
      <!-- Edit form -->
      <form v-if="isEditing" @submit.prevent="saveProfile" class="edit-form">
        <div class="form-row">
          <label for="firstName">First Name</label>
          <input id="firstName" v-model="editForm.firstName" required />
        </div>
        <div class="form-row">
          <label for="lastName">Last Name</label>
          <input id="lastName" v-model="editForm.lastName" required />
        </div>
        <div class="form-row">
          <label for="email">Email</label>
          <input id="email" v-model="editForm.email" type="email" required />
        </div>
        <div class="form-row">
          <label for="bio">Bio</label>
          <textarea id="bio" v-model="editForm.bio" />
        </div>
        <div class="form-row">
          <label for="location">Location</label>
          <input id="location" v-model="editForm.location" />
        </div>
        <div class="form-row">
          <label for="website">Website</label>
          <input id="website" v-model="editForm.website" type="url" />
        </div>
        <div class="form-row">
          <label for="twitter">Twitter</label>
          <input id="twitter" v-model="editForm.socialLinks.twitter" />
        </div>
        <div class="form-row">
          <label for="linkedin">LinkedIn</label>
          <input id="linkedin" v-model="editForm.socialLinks.linkedin" />
        </div>
        <div class="form-row">
          <label for="github">GitHub</label>
          <input id="github" v-model="editForm.socialLinks.github" />
        </div>
        <div class="form-actions">
          <button type="submit">Save</button>
          <button type="button" @click="cancelEdit">Cancel</button>
        </div>
      </form>

      <!-- Display card -->
      <div v-else>
        <!-- You can replace this with a UserProfileCard component -->
        <div class="profile-card">
          <h2>{{ user.firstName }} {{ user.lastName }}</h2>
          <p>Email: {{ user.email }}</p>
          <p v-if="user.bio">Bio: {{ user.bio }}</p>
          <p v-if="user.location">Location: {{ user.location }}</p>
          <p v-if="user.website">
            Website:
            <a :href="user.website" target="_blank">{{ user.website }}</a>
          </p>
          <p v-if="user.socialLinks?.twitter">
            Twitter:
            <a :href="'https://twitter.com/' + user.socialLinks.twitter" target="_blank">@{{ user.socialLinks.twitter }}</a>
          </p>
          <p v-if="user.socialLinks?.linkedin">
            LinkedIn:
            <a :href="'https://linkedin.com/in/' + user.socialLinks.linkedin" target="_blank">{{ user.socialLinks.linkedin }}</a>
          </p>
          <p v-if="user.socialLinks?.github">
            GitHub:
            <a :href="'https://github.com/' + user.socialLinks.github" target="_blank">{{ user.socialLinks.github }}</a>
          </p>
          <button v-if="editable" @click="startEdit">Edit</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Imports
import { ref, reactive, onMounted } from 'vue';
import { UserService } from '../services/userService';
import type { User, UserProfile } from '../types/userTypes';

// Props: optional userId (for admin) and editable flag
interface Props {
  userId?: string;
  editable?: boolean;
}
const props = defineProps<Props>();

// Instantiate the service
const userService = new UserService();

// State
const user = ref<User | null>(null);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);
const isEditing = ref<boolean>(false);

// Editable form state
const editForm = reactive<Partial<UserProfile>>({
  firstName: '',
  lastName: '',
  email: '',
  bio: '',
  location: '',
  website: '',
  socialLinks: {
    twitter: '',
    linkedin: '',
    github: ''
  }
});

// Load user on mount
onMounted(async () => {
  try {
    if (props.userId) {
      user.value = await userService.getUserById(props.userId);
    } else {
      user.value = await userService.getCurrentUser();
    }
    // Prepopulate edit form with user data
    if (user.value) {
      editForm.firstName = user.value.firstName;
      editForm.lastName = user.value.lastName;
      editForm.email = user.value.email;
      editForm.bio = user.value.bio ?? '';
      editForm.location = user.value.location ?? '';
      editForm.website = user.value.website ?? '';
      editForm.socialLinks = {
        twitter: user.value.socialLinks?.twitter ?? '',
        linkedin: user.value.socialLinks?.linkedin ?? '',
        github: user.value.socialLinks?.github ?? ''
      };
    }
  } catch (err: any) {
    error.value = err?.message || 'Failed to load user';
  } finally {
    loading.value = false;
  }
});

// Toggle edit mode
function startEdit() {
  isEditing.value = true;
}

function cancelEdit() {
  // Reset form to existing user data
  if (user.value) {
    editForm.firstName = user.value.firstName;
    editForm.lastName = user.value.lastName;
    editForm.email = user.value.email;
    editForm.bio = user.value.bio ?? '';
    editForm.location = user.value.location ?? '';
    editForm.website = user.value.website ?? '';
    editForm.socialLinks = {
      twitter: user.value.socialLinks?.twitter ?? '',
      linkedin: user.value.socialLinks?.linkedin ?? '',
      github: user.value.socialLinks?.github ?? ''
    };
  }
  isEditing.value = false;
}

// Save profile changes
async function saveProfile() {
  if (!user.value) return;
  try {
    loading.value = true;
    const id = props.userId || user.value.id;
    const updated = await userService.updateUser(id, editForm as any);
    // Update local state
    user.value = updated;
    // Exit edit mode
    isEditing.value = false;
  } catch (err: any) {
    error.value = err?.message || 'Failed to update user';
  } finally {
    loading.value = false;
  }
}

const editable = props.editable ?? true;
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
  padding: 1rem;
}
.profile-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
}
.profile-card h2 {
  margin-bottom: 0.5rem;
}
.form-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}
</style>
