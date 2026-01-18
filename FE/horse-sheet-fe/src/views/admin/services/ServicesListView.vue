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

      <div v-else class="table-container">
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
</style>
