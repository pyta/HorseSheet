<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { userService } from '@/services/user.service';
import { useUIStore } from '@/stores/ui';
import { useConfirm } from '@/composables/useConfirm';
import type { User } from '@/types';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';

const router = useRouter();
const uiStore = useUIStore();
const confirm = useConfirm();

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
    uiStore.showError(error.message || 'Failed to load users');
    users.value = [];
  } finally {
    loading.value = false;
  }
}

async function handleDelete(id: string) {
  const confirmed = await confirm.confirm('Are you sure you want to delete this user?', {
    title: 'Delete User',
    confirmText: 'Delete',
  });

  if (confirmed) {
    try {
      await userService.delete(id);
      uiStore.showSuccess('User deleted successfully');
      await loadUsers();
    } catch (error: any) {
      uiStore.showError(error.message || 'Failed to delete user');
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
        <h2 class="card-title">Users</h2>
        <router-link to="/admin/users/new" class="btn btn-primary">Create New</router-link>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>

      <div v-else class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Roles</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="users.length === 0">
              <td colspan="5" style="text-align: center; padding: 2rem; color: #7f8c8d">
                No users found. Create your first user to get started.
              </td>
            </tr>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.email }}</td>
              <td>{{ getFullName(user) }}</td>
              <td>{{ getRoles(user) }}</td>
              <td>{{ user.isActive ? 'Yes' : 'No' }}</td>
              <td>
                <div class="table-actions">
                  <router-link :to="`/admin/users/${user.id}`" class="btn btn-secondary">
                    Edit
                  </router-link>
                  <button class="btn btn-danger" @click="handleDelete(user.id)">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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
</style>

