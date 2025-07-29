<script setup lang="ts">
import AuthComponent from '../components/auth.component.vue';

// The view is now just a wrapper for the component that handles all the business logic
</script>

<template>
  <div class="auth-view">
    <AuthComponent />
  </div>
</template>

<style scoped>
.auth-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--color-background);
}
</style>