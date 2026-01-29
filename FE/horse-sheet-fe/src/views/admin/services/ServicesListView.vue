<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { serviceService } from '@/services/service.service';
import { stableService } from '@/services/stable.service';
import { useUIStore } from '@/stores/ui';
import { useConfirm } from '@/composables/useConfirm';
import type { Service, Stable } from '@/types';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';

const router = useRouter();
const uiStore = useUIStore();
const confirm = useConfirm();

const services = ref<Service[]>([]);
const stables = ref<Stable[]>([]);
const loading = ref(false);

onMounted(async () => {
  await Promise.all([loadServices(), loadStables()]);
});

async function loadStables() {
  try {
    const data = await stableService.findAll();
    stables.value = Array.isArray(data) ? data : [];
  } catch {
    stables.value = [];
  }
}

async function loadServices() {
  try {
    loading.value = true;
    const data = await serviceService.findAll();
    services.value = Array.isArray(data) ? data.filter((s) => !s.deletedAt) : [];
  } catch (error: any) {
    uiStore.showError(error.message || 'Failed to load services');
    services.value = [];
  } finally {
    loading.value = false;
  }
}

function getStableName(stableId: string): string {
  if (!Array.isArray(stables.value)) return stableId;
  const stable = stables.value.find((s) => s.id === stableId);
  return stable?.name || stableId;
}

async function handleDelete(id: string) {
  const confirmed = await confirm.confirm('Are you sure you want to delete this service?', {
    title: 'Delete Service',
    confirmText: 'Delete',
  });

  if (confirmed) {
    try {
      await serviceService.delete(id);
      uiStore.showSuccess('Service deleted successfully');
      await loadServices();
    } catch (error: any) {
      uiStore.showError(error.message || 'Failed to delete service');
    }
  }
}
</script>

<template>
  <div class="services-list">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Services</h2>
        <router-link to="/admin/services/new" class="btn btn-primary">Create New</router-link>
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
                <th>Name</th>
                <th>Description</th>
                <th>Stable</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="services.length === 0">
                <td colspan="5" style="text-align: center; padding: 2rem; color: #7f8c8d">
                  No services found.
                </td>
              </tr>
              <tr v-for="service in services" :key="service.id">
                <td>{{ service.name }}</td>
                <td>{{ service.description || '-' }}</td>
                <td>{{ getStableName(service.stableId) }}</td>
                <td>{{ service.isActive ? 'Yes' : 'No' }}</td>
                <td>
                  <div class="table-actions">
                    <router-link :to="`/admin/services/${service.id}`" class="btn btn-secondary">
                      Edit
                    </router-link>
                    <button class="btn btn-danger" @click="handleDelete(service.id)">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Tile View -->
        <div v-if="services.length === 0" class="mobile-view empty-state">
          <p>No services found.</p>
        </div>
        <div v-else class="mobile-view mobile-tiles">
          <div v-for="service in services" :key="service.id" class="data-tile">
            <div class="tile-header">
              <h3 class="tile-title">{{ service.name }}</h3>
              <span :class="['tile-badge', service.isActive ? 'badge-active' : 'badge-inactive']">
                {{ service.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="tile-content">
              <div class="tile-row" v-if="service.description">
                <span class="tile-label">Description:</span>
                <span class="tile-value">{{ service.description }}</span>
              </div>
              <div class="tile-row">
                <span class="tile-label">Stable:</span>
                <span class="tile-value">{{ getStableName(service.stableId) }}</span>
              </div>
            </div>
            <div class="tile-actions">
              <router-link :to="`/admin/services/${service.id}`" class="btn btn-secondary btn-sm">Edit</router-link>
              <button class="btn btn-danger btn-sm" @click="handleDelete(service.id)">Delete</button>
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
.services-list {
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
