<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { userService } from '@/services/user.service';
import { useUIStore } from '@/stores/ui';
import { useConfirm } from '@/composables/useConfirm';
import type { User } from '@/types';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';

const router = useRouter();
const uiStore = useUIStore();
const confirm = useConfirm();
const { t } = useI18n();

const users = ref<User[]>([]);
const loading = ref(false);
const deleteId = ref<string | null>(null);

onMounted(async () => {
  await loadUsers();
});

async function loadUsers() {
  try {
    loading.value = true;
    const data = await userService.findAll();
    // Filter out soft-deleted items
    users.value = Array.isArray(data) ? data.filter((u) => !u.deletedAt) : [];
  } catch (error: any) {
    uiStore.showError(error.message || t('users.loadError'));
    users.value = [];
  } finally {
    loading.value = false;
  }
}

async function handleDelete(id: string) {
  const confirmed = await confirm.confirm(t('common.messages.confirmDelete'), {
    title: t('users.title'),
    confirmText: t('common.buttons.delete'),
  });

  if (confirmed) {
    try {
      await userService.delete(id);
      uiStore.showSuccess(t('users.deleted'));
      await loadUsers();
    } catch (error: any) {
      uiStore.showError(error.message || t('common.messages.deleteError'));
    }
  }
}

function getFullName(user: User): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.firstName || user.lastName || '-';
}

function getRoles(user: User): string {
  if (!user.roles || user.roles.length === 0) {
    return '-';
  }
  return user.roles.map((r) => r.name).join(', ');
}
</script>

<template>
  <div class="users-list">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">{{ t('users.title') }}</h2>
        <router-link to="/admin/users/new" class="btn btn-primary">{{ t('users.list.createNew') }}</router-link>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>

      <div v-else>
        <!-- Desktop Table View -->
        <div class="table-container desktop-view">
          <table class="table">
            <thead>
              <tr>
                <th>{{ t('common.labels.email') }}</th>
                <th>{{ t('common.labels.name') }}</th>
                <th>{{ t('common.labels.roles') }}</th>
                <th>{{ t('common.labels.active') }}</th>
                <th>{{ t('common.labels.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="users.length === 0">
                <td colspan="5" style="text-align: center; padding: 2rem; color: #7f8c8d">
                  {{ t('common.labels.noUsersFound') }} {{ t('common.labels.createFirst') }}
                </td>
              </tr>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.email }}</td>
                <td>{{ getFullName(user) }}</td>
                <td>{{ getRoles(user) }}</td>
                <td>{{ user.isActive ? t('common.labels.yes') : t('common.labels.no') }}</td>
                <td>
                  <div class="table-actions">
                    <router-link :to="`/admin/users/${user.id}`" class="btn btn-secondary">
                      {{ t('common.buttons.edit') }}
                    </router-link>
                    <button class="btn btn-danger" @click="handleDelete(user.id)">{{ t('common.buttons.delete') }}</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Tile View -->
        <div v-if="users.length === 0" class="mobile-view empty-state">
          <p>{{ t('common.labels.noUsersFound') }} {{ t('common.labels.createFirst') }}</p>
        </div>
        <div v-else class="mobile-view mobile-tiles">
          <div v-for="user in users" :key="user.id" class="data-tile">
            <div class="tile-header">
              <h3 class="tile-title">{{ getFullName(user) || user.email }}</h3>
              <span :class="['tile-badge', user.isActive ? 'badge-active' : 'badge-inactive']">
                {{ user.isActive ? t('common.labels.active') : t('common.labels.inactive') }}
              </span>
            </div>
            <div class="tile-content">
              <div class="tile-row">
                <span class="tile-label">{{ t('common.labels.email') }}:</span>
                <span class="tile-value">{{ user.email }}</span>
              </div>
              <div class="tile-row" v-if="getRoles(user) !== '-'">
                <span class="tile-label">{{ t('common.labels.roles') }}:</span>
                <span class="tile-value">{{ getRoles(user) }}</span>
              </div>
            </div>
            <div class="tile-actions">
              <router-link :to="`/admin/users/${user.id}`" class="btn btn-secondary btn-sm">{{ t('common.buttons.edit') }}</router-link>
              <button class="btn btn-danger btn-sm" @click="handleDelete(user.id)">{{ t('common.buttons.delete') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :show="confirm.show.value"
      :title="confirm.title.value"
      :message="confirm.message.value"
      :confirm-text="confirm.confirmText.value"
      :cancel-text="confirm.cancelText.value"
      @confirm="confirm.handleConfirm"
      @cancel="confirm.handleCancel"
    />
  </div>
</template>

<style scoped>
.users-list {
  max-width: 1400px;
}

/* Desktop View */
.desktop-view {
  display: block;
}

.mobile-view {
  display: none;
}

/* Mobile View */
@media (max-width: 768px) {
  .desktop-view {
    display: none;
  }

  .mobile-view {
    display: block;
  }

  .mobile-tiles {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0;
  }

  .data-tile {
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .tile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .tile-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
  }

  .tile-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .badge-active {
    background-color: #d4edda;
    color: #155724;
  }

  .badge-inactive {
    background-color: #f8d7da;
    color: #721c24;
  }

  .tile-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .tile-row {
    display: flex;
    gap: 0.5rem;
  }

  .tile-label {
    font-weight: 500;
    color: #7f8c8d;
    min-width: 80px;
  }

  .tile-value {
    color: #2c3e50;
    flex: 1;
  }

  .tile-actions {
    display: flex;
    gap: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid #f0f0f0;
  }

  .btn-sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }

  .empty-state {
    text-align: center;
    padding: 2rem;
    color: #7f8c8d;
  }
}
</style>

