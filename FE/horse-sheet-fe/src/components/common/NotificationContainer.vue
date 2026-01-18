<script setup lang="ts">
import { useUIStore } from '@/stores/ui';

const uiStore = useUIStore();

const getNotificationClass = (type: string) => {
  const classes: Record<string, string> = {
    success: 'notification-success',
    error: 'notification-error',
    warning: 'notification-warning',
    info: 'notification-info',
  };
  return classes[type] || 'notification-info';
};
</script>

<template>
  <div class="notification-container">
    <TransitionGroup name="notification" tag="div">
      <div
        v-for="notification in uiStore.notifications"
        :key="notification.id"
        :class="['notification', getNotificationClass(notification.type)]"
        @click="uiStore.removeNotification(notification.id)"
      >
        <span class="notification-message">{{ notification.message }}</span>
        <button class="notification-close" @click.stop="uiStore.removeNotification(notification.id)">
          ×
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.notification-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 400px;
}

.notification {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  min-width: 300px;
}

.notification-success {
  background-color: #4caf50;
  color: white;
}

.notification-error {
  background-color: #f44336;
  color: white;
}

.notification-warning {
  background-color: #ff9800;
  color: white;
}

.notification-info {
  background-color: #2196f3;
  color: white;
}

.notification-message {
  flex: 1;
}

.notification-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  margin-left: 1rem;
  line-height: 1;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
