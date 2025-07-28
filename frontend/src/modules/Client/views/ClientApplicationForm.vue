<template>
  <div class="client-application-page">
    <h1 class="text-2xl font-bold mb-6">Client Application</h1>
    <p class="text-gray-600 mb-8">
      Please complete the form below to apply for a client account. Our team will review your application and get back to you shortly.
    </p>
    
    <ClientApplicationForm />
  </div>
</template>

<script setup lang="ts">
import ClientApplicationForm from '../components/ClientApplicationForm.vue'
</script>

<style scoped>
.client-application-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
</style>