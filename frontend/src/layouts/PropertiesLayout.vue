<script setup lang="ts">
import NavBar from '../components/NavBar.vue';
import Footer from '../components/Footer.vue';
</script>

<template>
  <div class="layout-properties bg-surface">
    <!-- NavBar component at the top -->
    <NavBar />
    
    <!-- Property-specific header section -->
    <div class="property-header">
      <slot name="header"></slot>
    </div>
    
    <!-- Main content -->
    <main class="main">
      <!-- Sidebar for property filters/navigation if needed -->
      <aside v-if="$slots.sidebar" class="sidebar">
        <slot name="sidebar"></slot>
      </aside>
      
      <!-- Main property content area -->
      <div class="content">
        <slot></slot>
      </div>
    </main>
    
    <!-- Footer component -->
    <Footer />
  </div>
</template>

<style scoped>
.layout-properties {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  box-shadow: var(--box-shadow-lg);
}

.property-header {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 1rem;
}

/* Main content */
.main {
  flex: 1;
  display: flex;
  max-width: var(--container-max-width);
  margin: 0 auto;
  width: 100%;
  background-color: var(--color-surface);
  padding: var(--container-padding) 1rem;
}

/* Sidebar */
.sidebar {
  width: 280px;
  padding-right: 2rem;
  flex-shrink: 0;
}

/* Content area */
.content {
  flex: 1;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .main {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    padding-right: 0;
    padding-bottom: 2rem;
  }
}
</style>