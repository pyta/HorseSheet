<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ScheduleCalendar from '@/components/schedule/ScheduleCalendar.vue';

const { t } = useI18n();

const quickLinks = computed(() => [
  { name: t('navigation.stables'), path: '/admin/stables', icon: '🏠' },
  { name: t('navigation.services'), path: '/admin/services', icon: '⚙️' },
  { name: t('navigation.participants'), path: '/admin/participants', icon: '👥' },
  { name: t('navigation.activities'), path: '/admin/activities', icon: '🏇' },
  { name: t('navigation.serviceSchedule'), path: '/admin/service-schedule-entries', icon: '📅' },
  { name: t('navigation.activitySchedule'), path: '/admin/activity-schedule-entries', icon: '📆' },
  { name: t('navigation.payments'), path: '/admin/payments', icon: '💸' },
  { name: t('navigation.balances'), path: '/admin/balances', icon: '💵' },
]);
</script>

<template>
  <div class="dashboard">
    <h1>{{ t('dashboard.title') }}</h1>
    <p class="subtitle">{{ t('dashboard.subtitle') }}</p>

    <div class="quick-links">
      <h2>{{ t('dashboard.quickLinks') }}</h2>
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
