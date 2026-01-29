<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { stableService } from '@/services/stable.service';
import { useUIStore } from '@/stores/ui';
import { useConfirm } from '@/composables/useConfirm';
import type { Stable } from '@/types';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';

const router = useRouter();
const uiStore = useUIStore();
const confirm = useConfirm();

const stables = ref<Stable[]>([]);
const loading = ref(false);
const deleteId = ref<string | null>(null);

onMounted(async () => {
  await loadStables();
});

async function loadStables() {
  try {
    loading.value = true;
    const data = await stableService.findAll();
    // Filter out soft-deleted items
    stables.value = Array.isArray(data) ? data.filter((s) => !s.deletedAt) : [];
  } catch (error: any) {
    uiStore.showError(error.message || 'Failed to load stables');
    stables.value = [];
  } finally {
    loading.value = false;
  }
}

async function handleDelete(id: string) {
  const confirmed = await confirm.confirm('Are you sure you want to delete this stable?', {
    title: 'Delete Stable',
    confirmText: 'Delete',
  });

  if (confirmed) {
    try {
      await stableService.delete(id);
      uiStore.showSuccess('Stable deleted successfully');
      await loadStables();
    } catch (error: any) {
      uiStore.showError(error.message || 'Failed to delete stable');
    }
  }
}
</script>

<template>
  <div class="stables-list">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Stables</h2>
        <router-link to="/admin/stables/new" class="btn btn-primary">Create New</router-link>
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
                <th>Address</th>
                <th>Contact Info</th>
                <th>Timezone</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="stables.length === 0">
                <td colspan="6" style="text-align: center; padding: 2rem; color: #7f8c8d">
                  No stables found. Create your first stable to get started.
                </td>
              </tr>
              <tr v-for="stable in stables" :key="stable.id">
                <td>{{ stable.name }}</td>
                <td>{{ stable.address || '-' }}</td>
                <td>{{ stable.contactInfo || '-' }}</td>
                <td>{{ stable.timezone || '-' }}</td>
                <td>{{ stable.isActive ? 'Yes' : 'No' }}</td>
                <td>
                  <div class="table-actions">
                    <router-link :to="`/admin/stables/${stable.id}`" class="btn btn-secondary">
                      Edit
                    </router-link>
                    <button class="btn btn-danger" @click="handleDelete(stable.id)">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Tile View -->
        <div v-if="stables.length === 0" class="mobile-view empty-state">
          <p>No stables found. Create your first stable to get started.</p>
        </div>
        <div v-else class="mobile-view mobile-tiles">
          <div v-for="stable in stables" :key="stable.id" class="data-tile">
            <div class="tile-header">
              <h3 class="tile-title">{{ stable.name }}</h3>
              <span :class="['tile-badge', stable.isActive ? 'badge-active' : 'badge-inactive']">
                {{ stable.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="tile-content">
              <div class="tile-row" v-if="stable.address">
                <span class="tile-label">Address:</span>
                <span class="tile-value">{{ stable.address }}</span>
              </div>
              <div class="tile-row" v-if="stable.contactInfo">
                <span class="tile-label">Contact:</span>
                <span class="tile-value">{{ stable.contactInfo }}</span>
              </div>
              <div class="tile-row" v-if="stable.timezone">
                <span class="tile-label">Timezone:</span>
                <span class="tile-value">{{ stable.timezone }}</span>
              </div>
            </div>
            <div class="tile-actions">
              <router-link :to="`/admin/stables/${stable.id}`" class="btn btn-secondary btn-sm">Edit</router-link>
              <button class="btn btn-danger btn-sm" @click="handleDelete(stable.id)">Delete</button>
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
.stables-list {
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
