<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { paymentService } from '@/services/payment.service';
import { stableService } from '@/services/stable.service';
import { participantService } from '@/services/participant.service';
import { useUIStore } from '@/stores/ui';
import type { CreatePaymentDto, UpdatePaymentDto, Stable, Participant } from '@/types';

const router = useRouter();
const route = useRoute();
const uiStore = useUIStore();
const isEdit = computed(() => !!route.params.id);
const loading = ref(false);
const submitting = ref(false);
const stables = ref<Stable[]>([]);
const participants = ref<Participant[]>([]);
const form = ref<CreatePaymentDto>({ stableId: '', participantId: '', amount: 0, paymentDate: '', balance: 0 });
const version = ref<number | undefined>(undefined);
const errors = ref<Record<string, string>>({});

onMounted(async () => {
  await Promise.all([loadStables(), loadParticipants()]);
  if (isEdit.value) await loadPayment();
});

async function loadStables() {
  try {
    stables.value = (await stableService.findAll()).filter((s) => !s.deletedAt);
  } catch {}
}

async function loadParticipants() {
  try {
    participants.value = (await participantService.findAll()).filter((p) => !p.deletedAt);
  } catch {}
}

const filteredParticipants = computed(() => {
  if (!form.value.stableId) return [];
  return participants.value.filter((p) => p.stableId === form.value.stableId);
});

async function loadPayment() {
  try {
    loading.value = true;
    const payment = await paymentService.findOne(route.params.id as string);
    form.value = {
      stableId: payment.stableId,
      participantId: payment.participantId,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      balance: payment.balance,
    };
    version.value = payment.version;
  } catch (error: any) {
    uiStore.showError(error.message || 'Failed to load payment');
    router.push('/admin/payments');
  } finally {
    loading.value = false;
  }
}

function validate(): boolean {
  errors.value = {};
  if (!form.value.stableId) {
    errors.value.stableId = 'Stable is required';
    return false;
  }
  if (!form.value.participantId) {
    errors.value.participantId = 'Participant is required';
    return false;
  }
  if (!form.value.amount || form.value.amount <= 0) {
    errors.value.amount = 'Amount must be greater than 0';
    return false;
  }
  if (!form.value.paymentDate) {
    errors.value.paymentDate = 'Payment date is required';
    return false;
  }
  if (form.value.balance === undefined || form.value.balance === null) {
    errors.value.balance = 'Balance is required';
    return false;
  }
  return true;
}

async function handleSubmit() {
  if (!validate()) return;
  try {
    submitting.value = true;
    errors.value = {};
    if (isEdit.value) {
      await paymentService.update(route.params.id as string, { ...form.value, version: version.value });
      uiStore.showSuccess('Payment updated successfully');
    } else {
      await paymentService.create(form.value);
      uiStore.showSuccess('Payment created successfully');
    }
    router.push('/admin/payments');
  } catch (error: any) {
    if (error.status === 409) {
      uiStore.showError('This payment has been modified by another user. Please refresh and try again.');
      if (isEdit.value) await loadPayment();
    } else if (error.errors) {
      errors.value = error.errors;
    } else {
      uiStore.showError(error.message || 'Failed to save payment');
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="payment-form">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">{{ isEdit ? 'Edit Payment' : 'Create New Payment' }}</h2>
        <router-link to="/admin/payments" class="btn btn-secondary">Back to List</router-link>
      </div>
      <div v-if="loading" class="loading"><div class="spinner"></div></div>
      <form v-else @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label required" for="stableId">Stable</label>
          <select id="stableId" v-model="form.stableId" class="form-select" :class="{ 'has-error': errors.stableId }" @change="form.participantId = ''">
            <option value="">Select a stable</option>
            <option v-for="stable in stables" :key="stable.id" :value="stable.id">{{ stable.name }}</option>
          </select>
          <span v-if="errors.stableId" class="form-error">{{ errors.stableId }}</span>
        </div>
        <div class="form-group">
          <label class="form-label required" for="participantId">Participant</label>
          <select id="participantId" v-model="form.participantId" class="form-select" :class="{ 'has-error': errors.participantId }" :disabled="!form.stableId">
            <option value="">Select a participant</option>
            <option v-for="participant in filteredParticipants" :key="participant.id" :value="participant.id">{{ participant.name }}</option>
          </select>
          <span v-if="errors.participantId" class="form-error">{{ errors.participantId }}</span>
        </div>
        <div class="form-group">
          <label class="form-label required" for="amount">Amount</label>
          <input id="amount" v-model.number="form.amount" type="number" step="0.01" min="0" class="form-input" :class="{ 'has-error': errors.amount }" />
          <span v-if="errors.amount" class="form-error">{{ errors.amount }}</span>
        </div>
        <div class="form-group">
          <label class="form-label required" for="paymentDate">Payment Date</label>
          <input id="paymentDate" v-model="form.paymentDate" type="date" class="form-input" :class="{ 'has-error': errors.paymentDate }" />
          <span v-if="errors.paymentDate" class="form-error">{{ errors.paymentDate }}</span>
        </div>
        <div class="form-group">
          <label class="form-label required" for="balance">Balance</label>
          <input id="balance" v-model.number="form.balance" type="number" step="0.01" class="form-input" :class="{ 'has-error': errors.balance }" />
          <span v-if="errors.balance" class="form-error">{{ errors.balance }}</span>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="submitting">{{ submitting ? 'Saving...' : isEdit ? 'Update' : 'Create' }}</button>
          <router-link to="/admin/payments" class="btn btn-secondary">Cancel</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.payment-form {
  max-width: 800px;
}
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}
.has-error {
  border-color: #e74c3c !important;
}
</style>
