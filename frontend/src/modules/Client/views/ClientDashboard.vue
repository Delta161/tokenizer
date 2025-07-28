<template>
  <div class="client-dashboard">
    <h1>Client Dashboard</h1>
    <p>Welcome to your client dashboard</p>
    <!-- Dashboard content will go here -->
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
.client-dashboard {
  padding: 20px;
}
</style>