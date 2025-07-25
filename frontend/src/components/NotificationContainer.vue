<script setup lang="ts">
import { useGlobalNotification } from '@/composables/useNotification';
import { TransitionGroup } from 'vue';

const { notifications, dismiss } = useGlobalNotification();
</script>

<template>
  <div class="fixed top-4 right-4 z-50 w-80 space-y-2">
    <TransitionGroup name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'p-4 rounded-md shadow-md border-l-4',
          {
            'bg-green-50 border-green-500': notification.type === 'success',
            'bg-red-50 border-red-500': notification.type === 'error',
            'bg-blue-50 border-blue-500': notification.type === 'info',
            'bg-yellow-50 border-yellow-500': notification.type === 'warning'
          }
        ]"
        role="alert"
      >
        <div class="flex justify-between items-start">
          <div>
            <h3
              v-if="notification.title"
              :class="[
                'font-medium text-sm',
                {
                  'text-green-800': notification.type === 'success',
                  'text-red-800': notification.type === 'error',
                  'text-blue-800': notification.type === 'info',
                  'text-yellow-800': notification.type === 'warning'
                }
              ]"
            >
              {{ notification.title }}
            </h3>
            <p
              :class="[
                'text-sm',
                {
                  'text-green-700': notification.type === 'success',
                  'text-red-700': notification.type === 'error',
                  'text-blue-700': notification.type === 'info',
                  'text-yellow-700': notification.type === 'warning'
                }
              ]"
            >
              {{ notification.message }}
            </p>
          </div>
          
          <button
            v-if="notification.dismissible"
            @click="dismiss(notification.id)"
            :class="[
              'text-sm',
              {
                'text-green-500 hover:text-green-600': notification.type === 'success',
                'text-red-500 hover:text-red-600': notification.type === 'error',
                'text-blue-500 hover:text-blue-600': notification.type === 'info',
                'text-yellow-500 hover:text-yellow-600': notification.type === 'warning'
              }
            ]"
            aria-label="Dismiss"
          >
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.notification-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>