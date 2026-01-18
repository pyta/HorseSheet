<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { instructorService } from '@/services/instructor.service';
import { stableService } from '@/services/stable.service';
import { useUIStore } from '@/stores/ui';
import { useConfirm } from '@/composables/useConfirm';
import type { Instructor, Stable } from '@/types';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';

const uiStore = useUIStore();
const confirm = useConfirm();
const instructors = ref<Instructor[]>([]);
const stables = ref<Stable[]>([]);
const loading = ref(false);

onMounted(async () => {
  await Promise.all([loadInstructors(), loadStables()]);
});

async function loadStables() {
  try {
    const data = await stableService.findAll();
    stables.value = Array.isArray(data) ? data : [];
  } catch {
    stables.value = [];
  }
}

async function loadInstructors() {
  try {
    loading.value = true;
    const data = await instructorService.findAll();
    instructors.value = Array.isArray(data) ? data.filter((i) => !i.deletedAt) : [];
  } catch (error: any) {
    uiStore.showError(error.message || 'Failed to load instructors');
    instructors.value = [];
  } finally {
    loading.value = false;
  }
}

function getStableName(stableId: string): string {
  if (!Array.isArray(stables.value)) return stableId;
  return stables.value.find((s) => s.id === stableId)?.name || stableId;
}

async function handleDelete(id: string) {
  if (await confirm.confirm('Are you sure you want to delete this instructor?', { title: 'Delete Instructor', confirmText: 'Delete' })) {
    try {
      await instructorService.delete(id);
      uiStore.showSuccess('Instructor deleted successfully');
      await loadInstructors();
    } catch (error: any) {
      uiStore.showError(error.message || 'Failed to delete instructor');
    }
  }
}
</script>

<template>
  <div class="instructors-list">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Instructors</h2>
        <router-link to="/admin/instructors/new" class="btn btn-primary">Create New</router-link>
      </div>
      <div v-if="loading" class="loading"><div class="spinner"></div></div>
      <div v-else class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Stable</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="instructors.length === 0">
              <td colspan="4" style="text-align: center; padding: 2rem; color: #7f8c8d">No instructors found.</td>
            </tr>
            <tr v-for="i in instructors" :key="i.id">
              <td>{{ i.name }}</td>
              <td>{{ getStableName(i.stableId) }}</td>
              <td>{{ i.isActive ? 'Yes' : 'No' }}</td>
              <td>
                <div class="table-actions">
                  <router-link :to="`/admin/instructors/${i.id}`" class="btn btn-secondary">Edit</router-link>
                  <button class="btn btn-danger" @click="handleDelete(i.id)">Delete</button>
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
.instructors-list {
  max-width: 1400px;
}
</style>
