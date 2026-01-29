<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { contactPersonService } from '@/services/contact-person.service';
import { stableService } from '@/services/stable.service';
import { useUIStore } from '@/stores/ui';
import { useConfirm } from '@/composables/useConfirm';
import type { ContactPerson, Stable } from '@/types';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';

const uiStore = useUIStore();
const confirm = useConfirm();

const contactPersons = ref<ContactPerson[]>([]);
const stables = ref<Stable[]>([]);
const loading = ref(false);

onMounted(async () => {
  await Promise.all([loadContactPersons(), loadStables()]);
});

async function loadStables() {
  try {
    const data = await stableService.findAll();
    stables.value = Array.isArray(data) ? data : [];
  } catch {
    stables.value = [];
  }
}

async function loadContactPersons() {
  try {
    loading.value = true;
    const data = await contactPersonService.findAll();
    contactPersons.value = Array.isArray(data) ? data.filter((c) => !c.deletedAt) : [];
  } catch (error: any) {
    uiStore.showError(error.message || 'Failed to load contact persons');
    contactPersons.value = [];
  } finally {
    loading.value = false;
  }
}

function getStableName(stableId: string): string {
  if (!Array.isArray(stables.value)) return stableId;
  return stables.value.find((s) => s.id === stableId)?.name || stableId;
}

async function handleDelete(id: string) {
  if (await confirm.confirm('Are you sure you want to delete this contact person?', { title: 'Delete Contact Person', confirmText: 'Delete' })) {
    try {
      await contactPersonService.delete(id);
      uiStore.showSuccess('Contact person deleted successfully');
      await loadContactPersons();
    } catch (error: any) {
      uiStore.showError(error.message || 'Failed to delete contact person');
    }
  }
}
</script>

<template>
  <div class="contact-persons-list">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Contact Persons</h2>
        <router-link to="/admin/contact-persons/new" class="btn btn-primary">Create New</router-link>
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
              <tr v-if="contactPersons.length === 0">
                <td colspan="6" style="text-align: center; padding: 2rem; color: #7f8c8d">No contact persons found.</td>
              </tr>
              <tr v-for="cp in contactPersons" :key="cp.id">
                <td>{{ cp.name }}</td>
                <td>{{ cp.email || '-' }}</td>
                <td>{{ cp.phone || '-' }}</td>
                <td>{{ getStableName(cp.stableId) }}</td>
                <td>{{ cp.isActive ? 'Yes' : 'No' }}</td>
                <td>
                  <div class="table-actions">
                    <router-link :to="`/admin/contact-persons/${cp.id}`" class="btn btn-secondary">Edit</router-link>
                    <button class="btn btn-danger" @click="handleDelete(cp.id)">Delete</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Tile View -->
        <div v-if="contactPersons.length === 0" class="mobile-view empty-state">
          <p>No contact persons found.</p>
        </div>
        <div v-else class="mobile-view mobile-tiles">
          <div v-for="cp in contactPersons" :key="cp.id" class="data-tile">
            <div class="tile-header">
              <h3 class="tile-title">{{ cp.name }}</h3>
              <span :class="['tile-badge', cp.isActive ? 'badge-active' : 'badge-inactive']">
                {{ cp.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="tile-content">
              <div class="tile-row" v-if="cp.email">
                <span class="tile-label">Email:</span>
                <span class="tile-value">{{ cp.email }}</span>
              </div>
              <div class="tile-row" v-if="cp.phone">
                <span class="tile-label">Phone:</span>
                <span class="tile-value">{{ cp.phone }}</span>
              </div>
              <div class="tile-row">
                <span class="tile-label">Stable:</span>
                <span class="tile-value">{{ getStableName(cp.stableId) }}</span>
              </div>
            </div>
            <div class="tile-actions">
              <router-link :to="`/admin/contact-persons/${cp.id}`" class="btn btn-secondary btn-sm">Edit</router-link>
              <button class="btn btn-danger btn-sm" @click="handleDelete(cp.id)">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ConfirmDialog :show="confirm.show.value" :title="confirm.title.value" :message="confirm.message.value" :confirm-text="confirm.confirmText.value" :cancel-text="confirm.cancelText.value" @confirm="confirm.handleConfirm" @cancel="confirm.handleCancel" />
  </div>
</template>

<style scoped>
.contact-persons-list {
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
