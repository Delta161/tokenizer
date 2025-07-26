<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'warning' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  type: 'button',
  fullWidth: false,
});

const emit = defineEmits(['click']);

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event);
  }
};

const classes = computed(() => {
  return {
    'btn': true,
    [`btn-${props.variant}`]: true,
    [`btn-${props.size}`]: true,
    'btn-full-width': props.fullWidth,
    'btn-disabled': props.disabled,
  };
});
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border-radius: var(--border-radius-md);
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  outline: none;
}

/* Variants */
.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(.btn-disabled) {
  background-color: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-md);
}

.btn-secondary {
  background-color: var(--color-accent-3);
  color: white;
}

.btn-secondary:hover:not(.btn-disabled) {
  background-color: var(--color-accent-3-dark);
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-md);
}

.btn-outline {
  background-color: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.btn-outline:hover:not(.btn-disabled) {
  background-color: var(--color-primary);
  color: white;
  transform: translateY(-2px);
}

.btn-danger {
  background-color: var(--color-error);
  color: white;
}

.btn-danger:hover:not(.btn-disabled) {
  background-color: var(--color-error-dark);
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-md);
}

.btn-warning {
  background-color: var(--color-warning);
  color: white;
}

.btn-warning:hover:not(.btn-disabled) {
  background-color: var(--color-warning-dark);
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-md);
}

.btn-success {
  background-color: var(--color-success);
  color: white;
}

.btn-success:hover:not(.btn-disabled) {
  background-color: var(--color-success-dark);
  transform: translateY(-2px);
  box-shadow: var(--box-shadow-md);
}

/* Sizes */
.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-md {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

/* Full width */
.btn-full-width {
  width: 100%;
}

/* Disabled state */
.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>