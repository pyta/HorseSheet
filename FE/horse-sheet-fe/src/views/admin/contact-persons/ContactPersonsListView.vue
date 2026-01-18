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
    </div>
    <ConfirmDialog :show="confirm.show.value" :title="confirm.title.value" :message="confirm.message.value" :confirm-text="confirm.confirmText.value" :cancel-text="confirm.cancelText.value" @confirm="confirm.handleConfirm" @cancel="confirm.handleCancel" />
  </div>
</template>

<style scoped>
.contact-persons-list {
  max-width: 1400px;
}
</style>
