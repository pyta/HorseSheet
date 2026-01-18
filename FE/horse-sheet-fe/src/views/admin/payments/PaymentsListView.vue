<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { paymentService } from '@/services/payment.service';
import { stableService } from '@/services/stable.service';
import { participantService } from '@/services/participant.service';
import { useUIStore } from '@/stores/ui';
import { useConfirm } from '@/composables/useConfirm';
import type { Payment, Stable, Participant } from '@/types';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';

const uiStore = useUIStore();
const confirm = useConfirm();
const payments = ref<Payment[]>([]);
const stables = ref<Stable[]>([]);
const participants = ref<Participant[]>([]);
const loading = ref(false);

onMounted(async () => {
  await Promise.all([loadPayments(), loadStables(), loadParticipants()]);
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
    const data = await participantService.findAll();
    participants.value = Array.isArray(data) ? data : [];
  } catch {
    participants.value = [];
  }
}

async function loadPayments() {
  try {
    loading.value = true;
    const data = await paymentService.findAll();
    payments.value = Array.isArray(data) ? data.filter((p) => !p.deletedAt) : [];
  } catch (error: any) {
    uiStore.showError(error.message || 'Failed to load payments');
    payments.value = [];
  } finally {
    loading.value = false;
  }
}

function getStableName(stableId: string): string {
  if (!Array.isArray(stables.value)) return stableId;
  return stables.value.find((s) => s.id === stableId)?.name || stableId;
}

function getParticipantName(participantId: string): string {
  if (!Array.isArray(participants.value)) return participantId;
  return participants.value.find((p) => p.id === participantId)?.name || participantId;
}

function formatPrice(price: number | string | null | undefined): string {
  if (price === null || price === undefined) return '0.00';
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return '0.00';
  return numPrice.toFixed(2);
}

async function handleDelete(id: string) {
  if (await confirm.confirm('Are you sure you want to delete this payment?', { title: 'Delete Payment', confirmText: 'Delete' })) {
    try {
      await paymentService.delete(id);
      uiStore.showSuccess('Payment deleted successfully');
      await loadPayments();
    } catch (error: any) {
      uiStore.showError(error.message || 'Failed to delete payment');
    }
  }
}
</script>

<template>
  <div class="payments-list">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Payments</h2>
        <router-link to="/admin/payments/new" class="btn btn-primary">Create New</router-link>
      </div>
      <div v-if="loading" class="loading"><div class="spinner"></div></div>
      <div v-else class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Participant</th>
              <th>Amount</th>
              <th>Payment Date</th>
              <th>Balance</th>
              <th>Stable</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="payments.length === 0">
              <td colspan="6" style="text-align: center; padding: 2rem; color: #7f8c8d">No payments found.</td>
            </tr>
            <tr v-for="payment in payments" :key="payment.id">
              <td>{{ getParticipantName(payment.participantId) }}</td>
              <td>{{ formatPrice(payment.amount) }}</td>
              <td>{{ payment.paymentDate }}</td>
              <td>{{ formatPrice(payment.balance) }}</td>
              <td>{{ getStableName(payment.stableId) }}</td>
              <td>
                <div class="table-actions">
                  <router-link :to="`/admin/payments/${payment.id}`" class="btn btn-secondary">Edit</router-link>
                  <button class="btn btn-danger" @click="handleDelete(payment.id)">Delete</button>
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
.payments-list {
  max-width: 1400px;
}
</style>
