<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import NavBar from './components/NavBar.vue'
import { DefaultLayout, AuthLayout } from './layouts'

// Get current route
const route = useRoute()

// Determine which layout to use based on route meta
const layout = computed(() => {
  return route.meta.layout || 'DefaultLayout'
})
</script>

<template>
  <div id="app">
    <!-- Use AuthLayout for auth routes -->
    <AuthLayout v-if="layout === 'AuthLayout'">
      <RouterView />
    </AuthLayout>
    
    <!-- Use DefaultLayout for other routes -->
    <template v-else>
      <NavBar />
      <div class="container mx-auto py-4">
        <RouterView />
      </div>
    </template>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}

#app {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>
