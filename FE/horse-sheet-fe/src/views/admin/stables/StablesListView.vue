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

      <div v-else class="table-container">
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
</style>
