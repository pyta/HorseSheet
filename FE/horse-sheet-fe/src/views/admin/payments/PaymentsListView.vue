<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { paymentService } from '@/services/payment.service';
import { stableService } from '@/services/stable.service';
import { contactPersonService } from '@/services/contact-person.service';
import { useUIStore } from '@/stores/ui';
import { useConfirm } from '@/composables/useConfirm';
import type { Payment, Stable, ContactPerson } from '@/types';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';

const uiStore = useUIStore();
const confirm = useConfirm();
const payments = ref<Payment[]>([]);
const stables = ref<Stable[]>([]);
const contactPersons = ref<ContactPerson[]>([]);
const loading = ref(false);

onMounted(async () => {
  await Promise.all([loadPayments(), loadStables(), loadContactPersons()]);
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
    const data = await contactPersonService.findAll();
    contactPersons.value = Array.isArray(data) ? data : [];
  } catch {
    contactPersons.value = [];
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

function getContactPersonName(contactPersonId: string): string {
  if (!Array.isArray(contactPersons.value)) return contactPersonId;
  return contactPersons.value.find((cp) => cp.id === contactPersonId)?.name || contactPersonId;
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
      <div v-else>
        <!-- Desktop Table View -->
        <div class="table-container desktop-view">
          <table class="table">
            <thead>
              <tr>
                <th>Contact Person</th>
                <th>Amount</th>
                <th>Payment Date</th>
                <th>Stable</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="payments.length === 0">
                <td colspan="5" style="text-align: center; padding: 2rem; color: #7f8c8d">No payments found.</td>
              </tr>
              <tr v-for="payment in payments" :key="payment.id">
                <td>{{ getContactPersonName(payment.contactPersonId) }}</td>
                <td>{{ formatPrice(payment.amount) }}</td>
                <td>{{ payment.paymentDate }}</td>
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

        <!-- Mobile Tile View -->
        <div v-if="payments.length === 0" class="mobile-view empty-state">
          <p>No payments found.</p>
        </div>
        <div v-else class="mobile-view mobile-tiles">
          <div v-for="payment in payments" :key="payment.id" class="data-tile">
            <div class="tile-header">
              <h3 class="tile-title">{{ getContactPersonName(payment.contactPersonId) }}</h3>
              <span class="tile-amount">{{ formatPrice(payment.amount) }}</span>
            </div>
            <div class="tile-content">
              <div class="tile-row">
                <span class="tile-label">Date:</span>
                <span class="tile-value">{{ payment.paymentDate }}</span>
              </div>
              <div class="tile-row">
                <span class="tile-label">Stable:</span>
                <span class="tile-value">{{ getStableName(payment.stableId) }}</span>
              </div>
            </div>
            <div class="tile-actions">
              <router-link :to="`/admin/payments/${payment.id}`" class="btn btn-secondary btn-sm">Edit</router-link>
              <button class="btn btn-danger btn-sm" @click="handleDelete(payment.id)">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ConfirmDialog :show="confirm.show.value" :title="confirm.title.value" :message="confirm.message.value" :confirm-text="confirm.confirmText.value" :cancel-text="confirm.cancelText.value" @confirm="confirm.handleConfirm" @cancel="confirm.handleCancel" />
  </div>
</template>

<style scoped>
.payments-list {
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
    flex: 1;
  }

  .tile-amount {
    font-size: 1.25rem;
    font-weight: 700;
    color: #27ae60;
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
