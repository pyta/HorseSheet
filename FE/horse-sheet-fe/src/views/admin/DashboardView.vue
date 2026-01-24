<script setup lang="ts">
import { RouterLink } from 'vue-router';
import ScheduleCalendar from '@/components/schedule/ScheduleCalendar.vue';

const quickLinks = [
  { name: 'Stables', path: '/admin/stables', icon: '🏠' },
  { name: 'Services', path: '/admin/services', icon: '⚙️' },
  { name: 'Participants', path: '/admin/participants', icon: '👥' },
  { name: 'Activities', path: '/admin/activities', icon: '🏇' },
  { name: 'Service Schedule', path: '/admin/service-schedule-entries', icon: '📅' },
  { name: 'Activity Schedule', path: '/admin/activity-schedule-entries', icon: '📆' },
  { name: 'Payments', path: '/admin/payments', icon: '💸' },
  { name: 'Balances', path: '/admin/balances', icon: '💵' },
];
</script>

<template>
  <div class="dashboard">
    <h1>Admin Dashboard</h1>
    <p class="subtitle">Welcome to the HorseSheet admin panel</p>

    <div class="quick-links">
      <h2>Quick Links</h2>
      <div class="links-grid">
        <RouterLink
          v-for="link in quickLinks"
          :key="link.path"
          :to="link.path"
          class="quick-link-card"
        >
          <span class="link-icon">{{ link.icon }}</span>
          <span class="link-name">{{ link.name }}</span>
        </RouterLink>
      </div>
    </div>

    <div class="schedule-section">
      <ScheduleCalendar />
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1200px;
}

.dashboard h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  color: #2c3e50;
}

.subtitle {
  color: #7f8c8d;
  margin-bottom: 2rem;
}

.quick-links h2 {
  margin: 2rem 0 1rem 0;
  font-size: 1.5rem;
  color: #2c3e50;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.quick-link-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: #2c3e50;
  transition: all 0.2s;
}

.quick-link-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.link-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.link-name {
  font-size: 1rem;
  font-weight: 500;
}

.schedule-section {
  margin-top: 3rem;
}
</style>
