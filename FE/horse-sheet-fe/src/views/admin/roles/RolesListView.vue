<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { roleService } from '@/services/role.service';
import { useUIStore } from '@/stores/ui';
import type { Role } from '@/types';

const uiStore = useUIStore();

const roles = ref<Role[]>([]);
const loading = ref(false);

onMounted(async () => {
  await loadRoles();
});

async function loadRoles() {
  try {
    loading.value = true;
    const data = await roleService.findAll();
    roles.value = Array.isArray(data) ? data.filter((r) => !r.deletedAt) : [];
  } catch (error: any) {
    uiStore.showError(error.message || 'Failed to load roles');
    roles.value = [];
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="roles-list">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Roles</h2>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>

      <div v-else class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="roles.length === 0">
              <td colspan="3" style="text-align: center; padding: 2rem; color: #7f8c8d">
                No roles found.
              </td>
            </tr>
            <tr v-for="role in roles" :key="role.id">
              <td>
                <code class="role-code">{{ role.code }}</code>
              </td>
              <td>{{ role.name }}</td>
              <td>{{ role.description || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.roles-list {
  max-width: 1400px;
}

.role-code {
  background-color: #ecf0f1;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: #2c3e50;
}
</style>

