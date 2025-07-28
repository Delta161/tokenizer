<template>
  <div class="application-submitted">
    <div class="success-container">
      <div class="icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h1 class="title">Application Submitted!</h1>
      
      <p class="message">
        Thank you for submitting your client application. Our team will review your information and get back to you shortly.
      </p>
      
      <p class="sub-message">
        You will receive an email notification at the provided contact email once your application has been reviewed.
      </p>
      
      <div class="actions">
        <router-link to="/" class="home-button">
          Return to Home
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No additional script logic needed for this view
</script>

<style scoped>
.application-submitted {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.success-container {
  max-width: 600px;
  text-align: center;
  padding: 40px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.icon-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16px;
}

.message {
  font-size: 1.125rem;
  color: #4b5563;
  margin-bottom: 12px;
}

.sub-message {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 24px;
}

.actions {
  margin-top: 32px;
}

.home-button {
  display: inline-block;
  padding: 10px 20px;
  background-color: #4f46e5;
  color: white;
  font-weight: 500;
  border-radius: 6px;
  text-decoration: none;
  transition: background-color 0.2s;
}

.home-button:hover {
  background-color: #4338ca;
}
</style>