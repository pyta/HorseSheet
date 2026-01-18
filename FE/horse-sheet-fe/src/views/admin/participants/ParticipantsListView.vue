<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { participantService } from '@/services/participant.service';
import { stableService } from '@/services/stable.service';
import { useUIStore } from '@/stores/ui';
import { useConfirm } from '@/composables/useConfirm';
import type { Participant, Stable } from '@/types';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';

const uiStore = useUIStore();
const confirm = useConfirm();
const participants = ref<Participant[]>([]);
const stables = ref<Stable[]>([]);
const loading = ref(false);

onMounted(async () => {
  await Promise.all([loadParticipants(), loadStables()]);
});

async function loadStables() {
  try {
    const data = await stableService.findAll();
    stables.value = Array.isArray(data) ? data : [];
  } catch {
    stables.value = [];
  }
}

async function loadParticipants() {
  try {
    loading.value = true;
    const data = await participantService.findAll();
    participants.value = Array.isArray(data) ? data.filter((p) => !p.deletedAt) : [];
  } catch (error: any) {
    uiStore.showError(error.message || 'Failed to load participants');
    participants.value = [];
  } finally {
    loading.value = false;
  }
}

function getStableName(stableId: string): string {
  if (!Array.isArray(stables.value)) return stableId;
  return stables.value.find((s) => s.id === stableId)?.name || stableId;
}

async function handleDelete(id: string) {
  if (await confirm.confirm('Are you sure you want to delete this participant?', { title: 'Delete Participant', confirmText: 'Delete' })) {
    try {
      await participantService.delete(id);
      uiStore.showSuccess('Participant deleted successfully');
      await loadParticipants();
    } catch (error: any) {
      uiStore.showError(error.message || 'Failed to delete participant');
    }
  }
}
</script>

<template>
  <div class="participants-list">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Participants</h2>
        <router-link to="/admin/participants/new" class="btn btn-primary">Create New</router-link>
      </div>
      <div v-if="loading" class="loading"><div class="spinner"></div></div>
      <div v-else class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Stable</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="participants.length === 0">
              <td colspan="6" style="text-align: center; padding: 2rem; color: #7f8c8d">No participants found.</td>
            </tr>
            <tr v-for="p in participants" :key="p.id">
              <td>{{ p.name }}</td>
              <td>{{ p.email || '-' }}</td>
              <td>{{ p.phone || '-' }}</td>
              <td>{{ getStableName(p.stableId) }}</td>
              <td>{{ p.isActive ? 'Yes' : 'No' }}</td>
              <td>
                <div class="table-actions">
                  <router-link :to="`/admin/participants/${p.id}`" class="btn btn-secondary">Edit</router-link>
                  <button class="btn btn-danger" @click="handleDelete(p.id)">Delete</button>
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
.participants-list {
  max-width: 1400px;
}
</style>
