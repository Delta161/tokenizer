<template>
  <div class="client-profile">
    <h1>Client Profile</h1>
    
    <div v-if="loading" class="loading">
      Loading profile...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else-if="client" class="profile-details">
      <div class="profile-field">
        <strong>Company Name:</strong> {{ client.companyName }}
      </div>
      <div class="profile-field">
        <strong>Contact Email:</strong> {{ client.contactEmail }}
      </div>
      <div class="profile-field" v-if="client.contactPhone">
        <strong>Contact Phone:</strong> {{ client.contactPhone }}
      </div>
      <div class="profile-field">
        <strong>Country:</strong> {{ client.country }}
      </div>
      <div class="profile-field" v-if="client.legalEntityNumber">
        <strong>Legal Entity Number:</strong> {{ client.legalEntityNumber }}
      </div>
      <div class="profile-field" v-if="client.walletAddress">
        <strong>Wallet Address:</strong> {{ client.walletAddress }}
      </div>
      <div class="profile-field">
        <strong>Status:</strong> {{ client.status }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { clientController } from '../controllers/client.controller'
import type { Client } from '../types/Client'

const client = ref<Client | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    client.value = await clientController.getCurrentClientProfile()
  } catch (err) {
    error.value = 'Failed to load client profile'
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.client-profile {
  padding: 20px;
}

.profile-details {
  margin-top: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
}

.profile-field {
  margin-bottom: 10px;
}

.loading, .error {
  margin-top: 20px;
  padding: 10px;
  border-radius: 4px;
}

.loading {
  background-color: #f8f9fa;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
}
</style>