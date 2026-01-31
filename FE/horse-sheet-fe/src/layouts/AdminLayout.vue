<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import LanguageSelector from '@/components/common/LanguageSelector.vue';

const route = useRoute();
const authStore = useAuthStore();
const { t } = useI18n();

const isMobileMenuOpen = ref(false);
const isMobile = ref(false);
const showCloseButton = ref(false);
let closeButtonTimeout: ReturnType<typeof setTimeout> | null = null;

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
  if (!isMobile.value) {
    isMobileMenuOpen.value = false;
  }
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
  if (closeButtonTimeout) {
    clearTimeout(closeButtonTimeout);
  }
});

// Close menu on route change
watch(() => route.path, () => {
  if (isMobile.value) {
    isMobileMenuOpen.value = false;
  }
});

// Lock body scroll when menu is open
watch(isMobileMenuOpen, (open) => {
  if (open && isMobile.value) {
    document.body.style.overflow = 'hidden';
    // Show close button after sidebar animation completes (0.3s)
    if (closeButtonTimeout) {
      clearTimeout(closeButtonTimeout);
    }
    closeButtonTimeout = setTimeout(() => {
      showCloseButton.value = true;
    }, 300);
  } else {
    document.body.style.overflow = '';
    // Hide close button immediately when closing
    showCloseButton.value = false;
    if (closeButtonTimeout) {
      clearTimeout(closeButtonTimeout);
      closeButtonTimeout = null;
    }
  }
});

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const handleLogout = async () => {
  await authStore.logout();
  if (isMobile.value) {
    isMobileMenuOpen.value = false;
  }
};

const menuItems = computed(() => [
  { name: t('navigation.dashboard'), path: '/admin', icon: '📊' },
  { name: t('navigation.stables'), path: '/admin/stables', icon: '🏠' },
  { name: t('navigation.services'), path: '/admin/services', icon: '⚙️' },
  { name: t('navigation.contactPersons'), path: '/admin/contact-persons', icon: '👤' },
  { name: t('navigation.participants'), path: '/admin/participants', icon: '👥' },
  { name: t('navigation.instructors'), path: '/admin/instructors', icon: '🎓' },
  { name: t('navigation.activities'), path: '/admin/activities', icon: '🏇' },
  { name: t('navigation.serviceSchedule'), path: '/admin/service-schedule-entries', icon: '📅' },
  { name: t('navigation.activitySchedule'), path: '/admin/activity-schedule-entries', icon: '📆' },
  { name: t('navigation.servicePrices'), path: '/admin/service-price-lists', icon: '💰' },
  { name: t('navigation.activityPrices'), path: '/admin/activity-price-lists', icon: '💵' },
  { name: t('navigation.individualServicePrices'), path: '/admin/individual-service-price-lists', icon: '💳' },
  { name: t('navigation.individualActivityPrices'), path: '/admin/individual-activity-price-lists', icon: '💴' },
  { name: t('navigation.payments'), path: '/admin/payments', icon: '💸' },
  { name: t('navigation.balances'), path: '/admin/balances', icon: '💵' },
  { name: t('navigation.users'), path: '/admin/users', icon: '👥' },
  { name: t('navigation.roles'), path: '/admin/roles', icon: '🔐' },
]);
</script>

<template>
  <div class="admin-layout">
    <!-- Hamburger button (mobile only) -->
    <button
      v-if="isMobile && !isMobileMenuOpen"
      class="hamburger-button"
      @click="toggleMobileMenu"
      aria-label="Toggle menu"
    >
      <span class="hamburger-icon" :class="{ open: isMobileMenuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </span>
    </button>

    <!-- Overlay (mobile only) -->
    <div
      v-if="isMobile && isMobileMenuOpen"
      class="sidebar-overlay"
      @click="closeMobileMenu"
    ></div>

    <!-- Close button (mobile only, fixed on right side of sidebar) -->
    <button
      v-if="isMobile && isMobileMenuOpen && showCloseButton"
      class="sidebar-close-button"
      @click="closeMobileMenu"
      aria-label="Close menu"
    >
      <span class="close-icon">✕</span>
    </button>

    <!-- Sidebar -->
    <aside
      class="sidebar"
      :class="{ 'mobile-open': isMobileMenuOpen && isMobile }"
    >
      <div class="sidebar-header">
        <h1>HorseSheet</h1>
        <p>{{ t('navigation.adminPanel') }}</p>
      </div>
      <div class="sidebar-language">
        <LanguageSelector />
      </div>
      <div class="sidebar-footer">
        <button @click="handleLogout" class="logout-button">
          <span class="nav-icon">🚪</span>
          <span class="nav-label">{{ t('common.buttons.logout') }}</span>
        </button>
      </div>
      <nav class="sidebar-nav">
        <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: route.path === item.path || (item.path !== '/admin' && route.path.startsWith(item.path)) }"
          @click="closeMobileMenu"
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
  position: relative;
}

/* Hamburger button */
.hamburger-button {
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1002;
  background-color: #2c3e50;
  border: none;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.hamburger-icon {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 24px;
  height: 20px;
}

.hamburger-icon span {
  display: block;
  height: 3px;
  width: 100%;
  background-color: white;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.hamburger-icon.open span:nth-child(1) {
  transform: rotate(45deg) translate(7px, 7px);
}

.hamburger-icon.open span:nth-child(2) {
  opacity: 0;
}

.hamburger-icon.open span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -7px);
}

/* Sidebar overlay */
.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
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
  z-index: 1000;
  transition: transform 0.3s ease;
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

.sidebar-language {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-close-button {
  display: none;
  position: fixed;
  top: 1rem;
  left: calc(280px - 44px - 1rem);
  z-index: 1002;
  background-color: #2c3e50;
  border: none;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: background-color 0.2s, opacity 0.2s ease, transform 0.2s ease;
  animation: fadeInButton 0.2s ease;
}

@keyframes fadeInButton {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.sidebar-close-button:hover {
  background-color: #34495e;
}

.close-icon {
  font-size: 1.5rem;
  line-height: 1;
  font-weight: bold;
  color: white;
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
  min-height: 44px;
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

.sidebar-footer {
  padding: 1rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-button {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  min-height: 44px;
}

.logout-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.main-content {
  flex: 1;
  margin-left: 250px;
  padding: 2rem;
  height: 100vh;
}

/* Mobile styles */
@media (max-width: 767px) {
  .hamburger-button {
    display: flex;
  }

  .sidebar-close-button {
    display: flex;
  }

  .sidebar-overlay {
    display: block;
  }

  .sidebar {
    width: 280px;
    transform: translateX(-100%);
  }

  .sidebar.mobile-open {
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
    padding: 1rem;
    padding-top: 4rem;
    width: 100%;
  }

  .sidebar-header {
    padding: 1rem;
  }

  .sidebar-header h1 {
    font-size: 1.25rem;
  }

  .sidebar-header p {
    font-size: 0.8rem;
  }

  .nav-item {
    padding: 1rem 1.5rem;
  }

  .nav-label {
    font-size: 0.95rem;
  }
}
</style>
