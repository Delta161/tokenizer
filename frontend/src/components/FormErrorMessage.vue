<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  error?: string | null;
  touched?: boolean;
  showAlways?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  error: null,
  touched: false,
  showAlways: false
});

// Only show error if field is touched or showAlways is true
const shouldShow = computed(() => {
  return (props.touched || props.showAlways) && props.error;
});
</script>

<template>
  <transition name="fade">
    <div v-if="shouldShow" class="text-red-500 text-sm mt-1" role="alert">
      {{ error }}
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>