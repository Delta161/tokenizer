<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  vertical?: boolean;
  fullWidth?: boolean;
  gap?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  vertical: false,
  fullWidth: false,
  gap: 'md',
});

const classes = computed(() => {
  return {
    'button-group': true,
    'button-group-vertical': props.vertical,
    'button-group-full-width': props.fullWidth,
    [`button-group-gap-${props.gap}`]: true,
  };
});
</script>

<template>
  <div :class="classes">
    <slot></slot>
  </div>
</template>

<style scoped>
.button-group {
  display: flex;
  align-items: center;
}

.button-group-vertical {
  flex-direction: column;
  align-items: stretch;
}

.button-group-full-width {
  width: 100%;
}

.button-group-gap-sm {
  gap: 0.5rem;
}

.button-group-gap-md {
  gap: 1rem;
}

.button-group-gap-lg {
  gap: 1.5rem;
}
</style>