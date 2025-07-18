<script setup lang="ts">
import { computed } from 'vue';
import { useUser } from '../composables';
import type { User } from '../types';

// Define props
const props = defineProps<{
  user: User;
  isEditable?: boolean;
}>();

// Define emits
const emit = defineEmits<{
  edit: [];
}>();

// Use user composable
const { getUserInitials } = useUser();

// Computed properties
const fullName = computed(() => `${props.user.firstName} ${props.user.lastName}`);
const initials = computed(() => getUserInitials(props.user));
const hasAvatar = computed(() => !!props.user.profile?.avatarUrl);
const avatarUrl = computed(() => props.user.profile?.avatarUrl);
const hasCompanyInfo = computed(() => !!props.user.profile?.company || !!props.user.profile?.position);
const companyInfo = computed(() => {
  const parts = [];
  if (props.user.profile?.position) parts.push(props.user.profile.position);
  if (props.user.profile?.company) parts.push(props.user.profile.company);
  return parts.join(' at ');
});

// Handle edit button click
function handleEdit() {
  emit('edit');
}
</script>

<template>
  <div class="user-profile-card">
    <div class="user-profile-header">
      <div class="user-avatar">
        <img v-if="hasAvatar" :src="avatarUrl" :alt="fullName" />
        <div v-else class="user-initials">{{ initials }}</div>
      </div>
      
      <div class="user-info">
        <h2 class="user-name">{{ fullName }}</h2>
        <p v-if="hasCompanyInfo" class="user-company">{{ companyInfo }}</p>
        <p class="user-email">{{ user.email }}</p>
      </div>
      
      <button 
        v-if="isEditable" 
        class="edit-button"
        @click="handleEdit"
        type="button"
      >
        Edit Profile
      </button>
    </div>
    
    <div v-if="user.profile" class="user-profile-details">
      <div v-if="user.profile.bio" class="user-bio">
        <h3>About</h3>
        <p>{{ user.profile.bio }}</p>
      </div>
      
      <div class="user-contact">
        <h3>Contact Information</h3>
        
        <div v-if="user.profile.phoneNumber" class="contact-item">
          <span class="contact-label">Phone:</span>
          <span class="contact-value">{{ user.profile.phoneNumber }}</span>
        </div>
        
        <div v-if="user.profile.address" class="contact-item">
          <span class="contact-label">Address:</span>
          <span class="contact-value">
            {{ user.profile.address }}<br>
            <template v-if="user.profile.city || user.profile.state || user.profile.zipCode">
              {{ [user.profile.city, user.profile.state, user.profile.zipCode].filter(Boolean).join(', ') }}
            </template>
            <template v-if="user.profile.country">
              {{ user.profile.country }}
            </template>
          </span>
        </div>
        
        <div v-if="user.profile.website" class="contact-item">
          <span class="contact-label">Website:</span>
          <a :href="user.profile.website" target="_blank" rel="noopener noreferrer" class="contact-link">
            {{ user.profile.website.replace(/^https?:\/\//, '') }}
          </a>
        </div>
      </div>
      
      <div v-if="user.profile.socialLinks" class="user-social">
        <h3>Social Profiles</h3>
        
        <div v-if="user.profile.socialLinks.linkedin" class="social-item">
          <span class="social-label">LinkedIn:</span>
          <a :href="user.profile.socialLinks.linkedin" target="_blank" rel="noopener noreferrer" class="social-link">
            {{ user.profile.socialLinks.linkedin.replace(/^https?:\/\//, '') }}
          </a>
        </div>
        
        <div v-if="user.profile.socialLinks.twitter" class="social-item">
          <span class="social-label">Twitter:</span>
          <a :href="user.profile.socialLinks.twitter" target="_blank" rel="noopener noreferrer" class="social-link">
            {{ user.profile.socialLinks.twitter.replace(/^https?:\/\//, '') }}
          </a>
        </div>
        
        <div v-if="user.profile.socialLinks.github" class="social-item">
          <span class="social-label">GitHub:</span>
          <a :href="user.profile.socialLinks.github" target="_blank" rel="noopener noreferrer" class="social-link">
            {{ user.profile.socialLinks.github.replace(/^https?:\/\//, '') }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-profile-card {
  background-color: var(--color-background-soft);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.user-profile-header {
  display: flex;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  position: relative;
}

.user-avatar {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 1.5rem;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-initials {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-primary);
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
}

.user-info {
  flex-grow: 1;
}

.user-name {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-heading);
}

.user-company {
  margin: 0 0 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text);
}

.user-email {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-light);
}

.edit-button {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-primary);
  border-radius: 4px;
  background-color: transparent;
  color: var(--color-primary);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.edit-button:hover {
  background-color: var(--color-primary);
  color: white;
}

.user-profile-details {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .user-profile-details {
    grid-template-columns: 1fr 1fr;
  }
  
  .user-bio {
    grid-column: 1 / -1;
  }
}

h3 {
  margin: 0 0 1rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-heading);
}

.user-bio p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-text);
}

.contact-item,
.social-item {
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  display: flex;
  flex-direction: column;
}

@media (min-width: 480px) {
  .contact-item,
  .social-item {
    flex-direction: row;
  }
}

.contact-label,
.social-label {
  font-weight: 500;
  color: var(--color-text-light);
  margin-right: 0.5rem;
  min-width: 80px;
}

.contact-value {
  color: var(--color-text);
}

.contact-link,
.social-link {
  color: var(--color-primary);
  text-decoration: none;
  transition: color 0.2s;
}

.contact-link:hover,
.social-link:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}
</style>