import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    redirect: '/admin',
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('@/views/admin/DashboardView.vue'),
      },
      // Stables
      {
        path: 'stables',
        name: 'admin-stables',
        component: () => import('@/views/admin/stables/StablesListView.vue'),
      },
      {
        path: 'stables/new',
        name: 'admin-stables-new',
        component: () => import('@/views/admin/stables/StableFormView.vue'),
      },
      {
        path: 'stables/:id',
        name: 'admin-stables-edit',
        component: () => import('@/views/admin/stables/StableFormView.vue'),
      },
      // Services
      {
        path: 'services',
        name: 'admin-services',
        component: () => import('@/views/admin/services/ServicesListView.vue'),
      },
      {
        path: 'services/new',
        name: 'admin-services-new',
        component: () => import('@/views/admin/services/ServiceFormView.vue'),
      },
      {
        path: 'services/:id',
        name: 'admin-services-edit',
        component: () => import('@/views/admin/services/ServiceFormView.vue'),
      },
      // Contact Persons
      {
        path: 'contact-persons',
        name: 'admin-contact-persons',
        component: () => import('@/views/admin/contact-persons/ContactPersonsListView.vue'),
      },
      {
        path: 'contact-persons/new',
        name: 'admin-contact-persons-new',
        component: () => import('@/views/admin/contact-persons/ContactPersonFormView.vue'),
      },
      {
        path: 'contact-persons/:id',
        name: 'admin-contact-persons-edit',
        component: () => import('@/views/admin/contact-persons/ContactPersonFormView.vue'),
      },
      // Participants
      {
        path: 'participants',
        name: 'admin-participants',
        component: () => import('@/views/admin/participants/ParticipantsListView.vue'),
      },
      {
        path: 'participants/new',
        name: 'admin-participants-new',
        component: () => import('@/views/admin/participants/ParticipantFormView.vue'),
      },
      {
        path: 'participants/:id',
        name: 'admin-participants-edit',
        component: () => import('@/views/admin/participants/ParticipantFormView.vue'),
      },
      // Instructors
      {
        path: 'instructors',
        name: 'admin-instructors',
        component: () => import('@/views/admin/instructors/InstructorsListView.vue'),
      },
      {
        path: 'instructors/new',
        name: 'admin-instructors-new',
        component: () => import('@/views/admin/instructors/InstructorFormView.vue'),
      },
      {
        path: 'instructors/:id',
        name: 'admin-instructors-edit',
        component: () => import('@/views/admin/instructors/InstructorFormView.vue'),
      },
      // Activities
      {
        path: 'activities',
        name: 'admin-activities',
        component: () => import('@/views/admin/activities/ActivitiesListView.vue'),
      },
      {
        path: 'activities/new',
        name: 'admin-activities-new',
        component: () => import('@/views/admin/activities/ActivityFormView.vue'),
      },
      {
        path: 'activities/:id',
        name: 'admin-activities-edit',
        component: () => import('@/views/admin/activities/ActivityFormView.vue'),
      },
      // Service Schedule Entries
      {
        path: 'service-schedule-entries',
        name: 'admin-service-schedule-entries',
        component: () => import('@/views/admin/service-schedule-entries/ServiceScheduleEntriesListView.vue'),
      },
      {
        path: 'service-schedule-entries/new',
        name: 'admin-service-schedule-entries-new',
        component: () => import('@/views/admin/service-schedule-entries/ServiceScheduleEntryFormView.vue'),
      },
      {
        path: 'service-schedule-entries/:id',
        name: 'admin-service-schedule-entries-edit',
        component: () => import('@/views/admin/service-schedule-entries/ServiceScheduleEntryFormView.vue'),
      },
      // Activity Schedule Entries
      {
        path: 'activity-schedule-entries',
        name: 'admin-activity-schedule-entries',
        component: () => import('@/views/admin/activity-schedule-entries/ActivityScheduleEntriesListView.vue'),
      },
      {
        path: 'activity-schedule-entries/new',
        name: 'admin-activity-schedule-entries-new',
        component: () => import('@/views/admin/activity-schedule-entries/ActivityScheduleEntryFormView.vue'),
      },
      {
        path: 'activity-schedule-entries/:id',
        name: 'admin-activity-schedule-entries-edit',
        component: () => import('@/views/admin/activity-schedule-entries/ActivityScheduleEntryFormView.vue'),
      },
      // Service Price Lists
      {
        path: 'service-price-lists',
        name: 'admin-service-price-lists',
        component: () => import('@/views/admin/service-price-lists/ServicePriceListsListView.vue'),
      },
      {
        path: 'service-price-lists/new',
        name: 'admin-service-price-lists-new',
        component: () => import('@/views/admin/service-price-lists/ServicePriceListFormView.vue'),
      },
      {
        path: 'service-price-lists/:id',
        name: 'admin-service-price-lists-edit',
        component: () => import('@/views/admin/service-price-lists/ServicePriceListFormView.vue'),
      },
      // Activity Price Lists
      {
        path: 'activity-price-lists',
        name: 'admin-activity-price-lists',
        component: () => import('@/views/admin/activity-price-lists/ActivityPriceListsListView.vue'),
      },
      {
        path: 'activity-price-lists/new',
        name: 'admin-activity-price-lists-new',
        component: () => import('@/views/admin/activity-price-lists/ActivityPriceListFormView.vue'),
      },
      {
        path: 'activity-price-lists/:id',
        name: 'admin-activity-price-lists-edit',
        component: () => import('@/views/admin/activity-price-lists/ActivityPriceListFormView.vue'),
      },
      // Individual Service Price Lists
      {
        path: 'individual-service-price-lists',
        name: 'admin-individual-service-price-lists',
        component: () => import('@/views/admin/individual-service-price-lists/IndividualServicePriceListsListView.vue'),
      },
      {
        path: 'individual-service-price-lists/new',
        name: 'admin-individual-service-price-lists-new',
        component: () => import('@/views/admin/individual-service-price-lists/IndividualServicePriceListFormView.vue'),
      },
      {
        path: 'individual-service-price-lists/:id',
        name: 'admin-individual-service-price-lists-edit',
        component: () => import('@/views/admin/individual-service-price-lists/IndividualServicePriceListFormView.vue'),
      },
      // Individual Activity Price Lists
      {
        path: 'individual-activity-price-lists',
        name: 'admin-individual-activity-price-lists',
        component: () => import('@/views/admin/individual-activity-price-lists/IndividualActivityPriceListsListView.vue'),
      },
      {
        path: 'individual-activity-price-lists/new',
        name: 'admin-individual-activity-price-lists-new',
        component: () => import('@/views/admin/individual-activity-price-lists/IndividualActivityPriceListFormView.vue'),
      },
      {
        path: 'individual-activity-price-lists/:id',
        name: 'admin-individual-activity-price-lists-edit',
        component: () => import('@/views/admin/individual-activity-price-lists/IndividualActivityPriceListFormView.vue'),
      },
      // Payments
      {
        path: 'payments',
        name: 'admin-payments',
        component: () => import('@/views/admin/payments/PaymentsListView.vue'),
      },
      {
        path: 'payments/new',
        name: 'admin-payments-new',
        component: () => import('@/views/admin/payments/PaymentFormView.vue'),
      },
      {
        path: 'payments/:id',
        name: 'admin-payments-edit',
        component: () => import('@/views/admin/payments/PaymentFormView.vue'),
      },
      // Balances
      {
        path: 'balances',
        name: 'admin-balances',
        component: () => import('@/views/admin/balances/BalancesListView.vue'),
      },
      {
        path: 'balances/new',
        name: 'admin-balances-new',
        component: () => import('@/views/admin/balances/BalanceFormView.vue'),
      },
      {
        path: 'balances/:id',
        name: 'admin-balances-edit',
        component: () => import('@/views/admin/balances/BalanceFormView.vue'),
      },
      // Users
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('@/views/admin/users/UsersListView.vue'),
      },
      {
        path: 'users/new',
        name: 'admin-users-new',
        component: () => import('@/views/admin/users/UserFormView.vue'),
      },
      {
        path: 'users/:id',
        name: 'admin-users-edit',
        component: () => import('@/views/admin/users/UserFormView.vue'),
      },
      // Roles
      {
        path: 'roles',
        name: 'admin-roles',
        component: () => import('@/views/admin/roles/RolesListView.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Router guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Initialize auth on first navigation (restore session from refresh token)
  if (!authStore.isInitialized) {
    await authStore.initializeAuth();
  }
  
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  
  // Check authentication by checking if token exists (more reliable than computed)
  const isAuthenticated = !!authStore.accessToken || authStore.isAuthenticated;

  if (requiresAuth && !isAuthenticated) {
    // Redirect to login if route requires auth and user is not authenticated
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else if (to.name === 'login' && isAuthenticated) {
    // Redirect to admin if already logged in and trying to access login page
    next('/admin');
  } else {
    next();
  }
});

export default router;
