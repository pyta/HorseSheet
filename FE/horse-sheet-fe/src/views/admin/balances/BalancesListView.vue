<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { balanceService } from '@/services/balance.service';
import { contactPersonService } from '@/services/contact-person.service';
import { useUIStore } from '@/stores/ui';
import { useConfirm } from '@/composables/useConfirm';
import type { Balance, ContactPerson } from '@/types';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';

const uiStore = useUIStore();
const confirm = useConfirm();
const balances = ref<Balance[]>([]);
const contactPersons = ref<ContactPerson[]>([]);
const loading = ref(false);
const isAdmin = ref(true); // TODO: Replace with actual admin check from auth store

onMounted(async () => {
  await Promise.all([loadBalances(), loadContactPersons()]);
});

async function loadContactPersons() {
  try {
    const data = await contactPersonService.findAll();
    contactPersons.value = Array.isArray(data) ? data.filter((cp) => !cp.deletedAt && cp.isActive) : [];
  } catch {
    contactPersons.value = [];
  }
}

async function loadBalances() {
  try {
    loading.value = true;
    const data = await balanceService.findAll();
    balances.value = Array.isArray(data) ? data.filter((b) => !b.deletedAt) : [];
  } catch (error: any) {
    uiStore.showError(error.message || 'Failed to load balances');
    balances.value = [];
  } finally {
    loading.value = false;
  }
}

function getContactPersonName(contactPersonId: string): string {
  if (!Array.isArray(contactPersons.value)) return contactPersonId;
  return contactPersons.value.find((cp) => cp.id === contactPersonId)?.name || contactPersonId;
}

function formatBalance(balance: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(balance);
}

async function handleDelete(id: string) {
  if (await confirm.confirm('Are you sure you want to delete this balance?', { title: 'Delete Balance', confirmText: 'Delete' })) {
    try {
      await balanceService.delete(id);
      uiStore.showSuccess('Balance deleted successfully');
      await loadBalances();
    } catch (error: any) {
      uiStore.showError(error.message || 'Failed to delete balance');
    }
  }
}
</script>

<template>
  <div class="balances-list">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Balances</h2>
        <router-link v-if="isAdmin" to="/admin/balances/new" class="btn btn-primary">Create New</router-link>
      </div>
      <div v-if="loading" class="loading"><div class="spinner"></div></div>
      <div v-else class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Contact Person</th>
              <th>Balance</th>
              <th>Created At</th>
              <th>Updated At</th>
              <th v-if="isAdmin">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="balances.length === 0">
              <td :colspan="isAdmin ? 5 : 4" style="text-align: center; padding: 2rem; color: #7f8c8d">No balances found.</td>
            </tr>
            <tr v-for="b in balances" :key="b.id">
              <td>{{ b.contactPerson?.name || getContactPersonName(b.contactPersonId) }}</td>
              <td :class="{ 'balance-positive': b.balance >= 0, 'balance-negative': b.balance < 0 }">
                {{ formatBalance(b.balance) }}
              </td>
              <td>{{ new Date(b.createdAt).toLocaleDateString() }}</td>
              <td>{{ new Date(b.updatedAt).toLocaleDateString() }}</td>
              <td v-if="isAdmin">
                <div class="table-actions">
                  <router-link :to="`/admin/balances/${b.id}`" class="btn btn-secondary">Edit</router-link>
                  <button class="btn btn-danger" @click="handleDelete(b.id)">Delete</button>
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
.balances-list {
  max-width: 1400px;
}

.balance-positive {
  color: #27ae60;
  font-weight: 600;
}

.balance-negative {
  color: #e74c3c;
  font-weight: 600;
}
</style>

