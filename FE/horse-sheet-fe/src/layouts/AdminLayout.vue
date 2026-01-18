<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();

const menuItems = [
  { name: 'Dashboard', path: '/admin', icon: '📊' },
  { name: 'Stables', path: '/admin/stables', icon: '🏠' },
  { name: 'Services', path: '/admin/services', icon: '⚙️' },
  { name: 'Contact Persons', path: '/admin/contact-persons', icon: '👤' },
  { name: 'Participants', path: '/admin/participants', icon: '👥' },
  { name: 'Instructors', path: '/admin/instructors', icon: '🎓' },
  { name: 'Activities', path: '/admin/activities', icon: '🏇' },
  { name: 'Service Schedule', path: '/admin/service-schedule-entries', icon: '📅' },
  { name: 'Activity Schedule', path: '/admin/activity-schedule-entries', icon: '📆' },
  { name: 'Service Prices', path: '/admin/service-price-lists', icon: '💰' },
  { name: 'Activity Prices', path: '/admin/activity-price-lists', icon: '💵' },
  { name: 'Individual Service Prices', path: '/admin/individual-service-price-lists', icon: '💳' },
  { name: 'Individual Activity Prices', path: '/admin/individual-activity-price-lists', icon: '💴' },
  { name: 'Payments', path: '/admin/payments', icon: '💸' },
];
</script>

<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1>HorseSheet</h1>
        <p>Admin Panel</p>
      </div>
      <nav class="sidebar-nav">
        <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: route.path === item.path || (item.path !== '/admin' && route.path.startsWith(item.path)) }"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.name }}</span>
        </RouterLink>
      </nav>
    </aside>
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
}

.sidebar-header p {
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
  opacity: 0.8;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  background-color: #3498db;
  color: white;
}

.nav-icon {
  margin-right: 0.75rem;
  font-size: 1.25rem;
}

.nav-label {
  font-size: 0.9rem;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  padding: 2rem;
  min-height: 100vh;
}
</style>
