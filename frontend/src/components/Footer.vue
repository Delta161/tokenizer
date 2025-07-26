<script setup lang="ts">
// Get current year for copyright
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="footer bg-primary text-white">
    <div class="footer-container">
      <div class="footer-content">
        <p class="copyright">&copy; {{ currentYear }} Tokenizer. All rights reserved.</p>
        <div class="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* Footer */
.footer {
  /* Using Tailwind bg-primary and text-white classes instead */
  padding: 2rem 1rem;
}

.footer-container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  width: 100%;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.copyright {
  margin: 0;
  font-size: 0.875rem;
  opacity: 0.8;
}

.footer-links {
  display: flex;
  gap: 1.5rem;
}

.footer-links a {
  font-size: 0.875rem;
  color: white;
  opacity: 0.8;
  text-decoration: none;
  transition: all 0.2s ease;
}

.footer-links a:hover {
  opacity: 1;
  text-decoration: underline;
}
</style>