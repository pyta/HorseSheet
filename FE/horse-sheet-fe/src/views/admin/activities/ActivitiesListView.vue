<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { activityService } from '@/services/activity.service';
import { stableService } from '@/services/stable.service';
import { useUIStore } from '@/stores/ui';
import { useConfirm } from '@/composables/useConfirm';
import type { Activity, Stable } from '@/types';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';

const uiStore = useUIStore();
const confirm = useConfirm();
const activities = ref<Activity[]>([]);
const stables = ref<Stable[]>([]);
const loading = ref(false);

onMounted(async () => {
  await Promise.all([loadActivities(), loadStables()]);
});

async function loadStables() {
  try {
    const data = await stableService.findAll();
    stables.value = Array.isArray(data) ? data : [];
  } catch {
    stables.value = [];
  }
}

async function loadActivities() {
  try {
    loading.value = true;
    const data = await activityService.findAll();
    activities.value = Array.isArray(data) ? data.filter((a) => !a.deletedAt) : [];
  } catch (error: any) {
    uiStore.showError(error.message || 'Failed to load activities');
    activities.value = [];
  } finally {
    loading.value = false;
  }
}

function getStableName(stableId: string): string {
  if (!Array.isArray(stables.value)) return stableId;
  return stables.value.find((s) => s.id === stableId)?.name || stableId;
}

async function handleDelete(id: string) {
  if (await confirm.confirm('Are you sure you want to delete this activity?', { title: 'Delete Activity', confirmText: 'Delete' })) {
    try {
      await activityService.delete(id);
      uiStore.showSuccess('Activity deleted successfully');
      await loadActivities();
    } catch (error: any) {
      uiStore.showError(error.message || 'Failed to delete activity');
    }
  }
}
</script>

<template>
  <div class="activities-list">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Activities</h2>
        <router-link to="/admin/activities/new" class="btn btn-primary">Create New</router-link>
      </div>
      <div v-if="loading" class="loading"><div class="spinner"></div></div>
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
            <tr v-if="activities.length === 0">
              <td colspan="5" style="text-align: center; padding: 2rem; color: #7f8c8d">No activities found.</td>
            </tr>
            <tr v-for="a in activities" :key="a.id">
              <td>{{ a.name }}</td>
              <td>{{ a.description || '-' }}</td>
              <td>{{ getStableName(a.stableId) }}</td>
              <td>{{ a.isActive ? 'Yes' : 'No' }}</td>
              <td>
                <div class="table-actions">
                  <router-link :to="`/admin/activities/${a.id}`" class="btn btn-secondary">Edit</router-link>
                  <button class="btn btn-danger" @click="handleDelete(a.id)">Delete</button>
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
.activities-list {
  max-width: 1400px;
}
</style>
