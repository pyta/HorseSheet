<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import ScheduleCalendar from '@/components/schedule/ScheduleCalendar.vue';

const { t } = useI18n();
const authStore = useAuthStore();

const allQuickLinks = [
  { nameKey: 'navigation.stables', path: '/admin/stables', icon: '🏠', roles: ['admin', 'stable_owner'] },
  { nameKey: 'navigation.services', path: '/admin/services', icon: '⚙️', roles: ['admin', 'stable_owner', 'stable_manager'] },
  { nameKey: 'navigation.contactPersons', path: '/admin/contact-persons', icon: '👤', roles: ['admin', 'stable_owner', 'stable_manager'] },
  { nameKey: 'navigation.participants', path: '/admin/participants', icon: '👥', roles: ['admin', 'stable_owner', 'stable_manager'] },
  { nameKey: 'navigation.instructors', path: '/admin/instructors', icon: '🎓', roles: ['admin', 'stable_owner', 'stable_manager'] },
  { nameKey: 'navigation.activities', path: '/admin/activities', icon: '🏇', roles: ['admin', 'stable_owner', 'stable_manager'] },
  { nameKey: 'navigation.serviceSchedule', path: '/admin/service-schedule-entries', icon: '📅', roles: ['admin', 'stable_owner', 'stable_manager'] },
  { nameKey: 'navigation.activitySchedule', path: '/admin/activity-schedule-entries', icon: '📆', roles: ['admin', 'stable_owner', 'stable_manager'] },
  { nameKey: 'navigation.servicePrices', path: '/admin/service-price-lists', icon: '💰', roles: ['admin', 'stable_owner'] },
  { nameKey: 'navigation.activityPrices', path: '/admin/activity-price-lists', icon: '💵', roles: ['admin', 'stable_owner'] },
  { nameKey: 'navigation.individualServicePrices', path: '/admin/individual-service-price-lists', icon: '💳', roles: ['admin', 'stable_owner'] },
  { nameKey: 'navigation.individualActivityPrices', path: '/admin/individual-activity-price-lists', icon: '💴', roles: ['admin', 'stable_owner'] },
  { nameKey: 'navigation.payments', path: '/admin/payments', icon: '💸', roles: ['admin', 'stable_owner', 'stable_manager'] },
  { nameKey: 'navigation.balances', path: '/admin/balances', icon: '💵', roles: ['admin', 'stable_owner', 'stable_manager'] },
  { nameKey: 'navigation.users', path: '/admin/users', icon: '👥', roles: ['admin', 'stable_owner'] },
  { nameKey: 'navigation.roles', path: '/admin/roles', icon: '🔐', roles: ['admin'] },
];

const quickLinks = computed(() => {
  const roles = authStore.user?.roles ?? [];
  if (roles.includes('admin')) {
    return allQuickLinks.map((link) => ({ name: t(link.nameKey), path: link.path, icon: link.icon }));
  }
  if (roles.length === 0) {
    return [];
  }
  return allQuickLinks
    .filter((link) => link.roles.some((r) => roles.includes(r)))
    .map((link) => ({ name: t(link.nameKey), path: link.path, icon: link.icon }));
});

const roleLabel = computed(() => {
  const roles = authStore.user?.roles ?? [];
  if (roles.includes('admin')) return t('dashboard.roles.admin');
  if (roles.includes('stable_owner')) return t('dashboard.roles.stableOwner');
  if (roles.includes('stable_manager')) return t('dashboard.roles.stableManager');
  if (roles.includes('user')) return t('dashboard.roles.user');
  return '';
});

const showQuickLinks = computed(() => quickLinks.value.length > 0);
const showSchedule = computed(() => {
  const roles = authStore.user?.roles ?? [];
  return roles.includes('admin') || roles.includes('stable_owner') || roles.includes('stable_manager') || roles.includes('user');
});
</script>

<template>
  <div class="dashboard">
    <h1>{{ t('dashboard.title') }}</h1>
    <p class="subtitle">
      {{ t('dashboard.subtitle') }}
      <span v-if="roleLabel" class="role-badge">{{ roleLabel }}</span>
    </p>

    <div v-if="showQuickLinks" class="quick-links">
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

    <div v-if="showSchedule" class="schedule-section">
      <ScheduleCalendar />
    </div>

    <div v-if="!showQuickLinks && showSchedule" class="dashboard-user-only">
      <p class="user-message">{{ t('dashboard.userOnlyMessage') }}</p>
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

.role-badge {
  display: inline-block;
  margin-left: 0.5rem;
  padding: 0.25rem 0.6rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: #2c3e50;
  background: #ecf0f1;
  border-radius: 6px;
}

.dashboard-user-only {
  margin-top: 1.5rem;
}

.user-message {
  color: #7f8c8d;
  font-size: 1rem;
}
</style>
