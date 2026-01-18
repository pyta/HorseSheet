import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export const useUIStore = defineStore('ui', () => {
  const notifications = ref<Notification[]>([]);
  const loading = ref(false);

  function showNotification(notification: Omit<Notification, 'id'>) {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      id,
      duration: 5000,
      ...notification,
    };
    notifications.value.push(newNotification);

    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }

  function removeNotification(id: string) {
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  }

  function showSuccess(message: string) {
    return showNotification({ type: 'success', message });
  }

  function showError(message: string) {
    return showNotification({ type: 'error', message });
  }

  function showWarning(message: string) {
    return showNotification({ type: 'warning', message });
  }

  function showInfo(message: string) {
    return showNotification({ type: 'info', message });
  }

  function setLoading(value: boolean) {
    loading.value = value;
  }

  return {
    notifications,
    loading,
    showNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    setLoading,
  };
});
