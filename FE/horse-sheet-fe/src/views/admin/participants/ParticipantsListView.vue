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
      <div v-else>
        <!-- Desktop Table View -->
        <div class="table-container desktop-view">
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

        <!-- Mobile Tile View -->
        <div v-if="participants.length === 0" class="mobile-view empty-state">
          <p>No participants found.</p>
        </div>
        <div v-else class="mobile-view mobile-tiles">
          <div v-for="p in participants" :key="p.id" class="data-tile">
            <div class="tile-header">
              <h3 class="tile-title">{{ p.name }}</h3>
              <span :class="['tile-badge', p.isActive ? 'badge-active' : 'badge-inactive']">
                {{ p.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="tile-content">
              <div class="tile-row" v-if="p.email">
                <span class="tile-label">Email:</span>
                <span class="tile-value">{{ p.email }}</span>
              </div>
              <div class="tile-row" v-if="p.phone">
                <span class="tile-label">Phone:</span>
                <span class="tile-value">{{ p.phone }}</span>
              </div>
              <div class="tile-row">
                <span class="tile-label">Stable:</span>
                <span class="tile-value">{{ getStableName(p.stableId) }}</span>
              </div>
            </div>
            <div class="tile-actions">
              <router-link :to="`/admin/participants/${p.id}`" class="btn btn-secondary btn-sm">Edit</router-link>
              <button class="btn btn-danger btn-sm" @click="handleDelete(p.id)">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ConfirmDialog :show="confirm.show.value" :title="confirm.title.value" :message="confirm.message.value" :confirm-text="confirm.confirmText.value" :cancel-text="confirm.cancelText.value" @confirm="confirm.handleConfirm" @cancel="confirm.handleCancel" />
  </div>
</template>

<style scoped>
.participants-list {
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
