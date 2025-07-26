<script setup lang="ts">
import NavBar from '../components/NavBar.vue';
import Footer from '../components/Footer.vue';
</script>

<template>
  <div class="layout-default bg-surface">
    <!-- NavBar component at the top -->
    <NavBar />
    
    <!-- Main content -->
    <main class="main">
      <slot></slot>
    </main>
    
    <!-- Footer component -->
    <Footer />
  </div>
</template>

<style scoped>
.layout-default {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  /* Using Tailwind bg-surface class instead */
  box-shadow: var(--box-shadow-lg);
}

/* Main content */
.main {
  flex: 1;
  padding: var(--container-padding) 1rem;
  max-width: var(--container-max-width);
  margin: 0 auto;
  width: 100%;
  background-color: var(--color-surface);
}
</style>