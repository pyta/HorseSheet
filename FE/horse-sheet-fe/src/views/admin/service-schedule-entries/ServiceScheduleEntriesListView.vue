<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { serviceScheduleEntryService } from '@/services/service-schedule-entry.service';
import { stableService } from '@/services/stable.service';
import { serviceService } from '@/services/service.service';
import { useUIStore } from '@/stores/ui';
import { useConfirm } from '@/composables/useConfirm';
import type { ServiceScheduleEntry, Stable, Service } from '@/types';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';

const uiStore = useUIStore();
const confirm = useConfirm();
const entries = ref<ServiceScheduleEntry[]>([]);
const stables = ref<Stable[]>([]);
const services = ref<Service[]>([]);
const loading = ref(false);

onMounted(async () => {
  await Promise.all([loadEntries(), loadStables(), loadServices()]);
});

async function loadStables() {
  try {
    stables.value = await stableService.findAll();
  } catch {}
}

async function loadServices() {
  try {
    services.value = await serviceService.findAll();
  } catch {}
}

async function loadEntries() {
  try {
    loading.value = true;
    const data = await serviceScheduleEntryService.findAll();
    entries.value = Array.isArray(data) ? data.filter((e) => !e.deletedAt) : [];
  } catch (error: any) {
    uiStore.showError(error.message || 'Failed to load service schedule entries');
    entries.value = [];
  } finally {
    loading.value = false;
  }
}

function getStableName(stableId: string): string {
  return stables.value.find((s) => s.id === stableId)?.name || stableId;
}

function getServiceName(serviceId: string): string {
  return services.value.find((s) => s.id === serviceId)?.name || serviceId;
}

async function handleDelete(id: string) {
  if (await confirm.confirm('Are you sure you want to delete this entry?', { title: 'Delete Entry', confirmText: 'Delete' })) {
    try {
      await serviceScheduleEntryService.delete(id);
      uiStore.showSuccess('Entry deleted successfully');
      await loadEntries();
    } catch (error: any) {
      uiStore.showError(error.message || 'Failed to delete entry');
    }
  }
}
</script>

<template>
  <div class="service-schedule-entries-list">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Service Schedule Entries</h2>
        <router-link to="/admin/service-schedule-entries/new" class="btn btn-primary">Create New</router-link>
      </div>
      <div v-if="loading" class="loading"><div class="spinner"></div></div>
      <div v-else class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Duration</th>
              <th>Service</th>
              <th>Stable</th>
              <th>Participants</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="entries.length === 0">
              <td colspan="7" style="text-align: center; padding: 2rem; color: #7f8c8d">No entries found.</td>
            </tr>
            <tr v-for="entry in entries" :key="entry.id">
              <td>{{ entry.date }}</td>
              <td>{{ entry.duration }}</td>
              <td>{{ getServiceName(entry.serviceId) }}</td>
              <td>{{ getStableName(entry.stableId) }}</td>
              <td>{{ entry.participantIds?.length || 0 }}</td>
              <td>{{ entry.isActive ? 'Yes' : 'No' }}</td>
              <td>
                <div class="table-actions">
                  <router-link :to="`/admin/service-schedule-entries/${entry.id}`" class="btn btn-secondary">Edit</router-link>
                  <button class="btn btn-danger" @click="handleDelete(entry.id)">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <ConfirmDialog :show="confirm.show.value" :title="confirm.title.value" :message="confirm.message.value" :confirm-text="confirm.confirmText.value" :cancel-text="confirm.cancelText.value" @confirm="confirm.handleConfirm" @cancel="confirm.handleCancel" />
  </div>
</template>

<style scoped>
.service-schedule-entries-list {
  max-width: 1400px;
}
</style>
