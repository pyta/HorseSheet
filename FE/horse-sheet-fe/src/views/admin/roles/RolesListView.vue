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

      <div v-else>
        <!-- Desktop Table View -->
        <div class="table-container desktop-view">
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

        <!-- Mobile Tile View -->
        <div v-if="roles.length === 0" class="mobile-view empty-state">
          <p>No roles found.</p>
        </div>
        <div v-else class="mobile-view mobile-tiles">
          <div v-for="role in roles" :key="role.id" class="data-tile">
            <div class="tile-header">
              <h3 class="tile-title">{{ role.name }}</h3>
              <code class="role-code-mobile">{{ role.code }}</code>
            </div>
            <div class="tile-content">
              <div class="tile-row" v-if="role.description">
                <span class="tile-label">Description:</span>
                <span class="tile-value">{{ role.description }}</span>
              </div>
            </div>
          </div>
        </div>
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

  .role-code-mobile {
    background-color: #ecf0f1;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-family: 'Courier New', monospace;
    font-size: 0.75rem;
    color: #2c3e50;
  }

  .tile-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
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

  .empty-state {
    text-align: center;
    padding: 2rem;
    color: #7f8c8d;
  }
}
</style>

