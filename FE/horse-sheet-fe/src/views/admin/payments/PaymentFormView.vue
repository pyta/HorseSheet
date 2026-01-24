<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { paymentService } from '@/services/payment.service';
import { stableService } from '@/services/stable.service';
import { contactPersonService } from '@/services/contact-person.service';
import { useUIStore } from '@/stores/ui';
import type { CreatePaymentDto, UpdatePaymentDto, Stable, ContactPerson } from '@/types';

const router = useRouter();
const route = useRoute();
const uiStore = useUIStore();
const isEdit = computed(() => !!route.params.id);
const loading = ref(false);
const submitting = ref(false);
const stables = ref<Stable[]>([]);
const contactPersons = ref<ContactPerson[]>([]);
const form = ref<CreatePaymentDto>({ stableId: '', contactPersonId: '', amount: 0, paymentDate: '' });
const version = ref<number | undefined>(undefined);
const errors = ref<Record<string, string>>({});

onMounted(async () => {
  await Promise.all([loadStables(), loadContactPersons()]);
  if (isEdit.value) await loadPayment();
});

async function loadStables() {
  try {
    stables.value = (await stableService.findAll()).filter((s) => !s.deletedAt);
  } catch {}
}

async function loadContactPersons() {
  try {
    contactPersons.value = (await contactPersonService.findAll()).filter((cp) => !cp.deletedAt);
  } catch {}
}

const filteredContactPersons = computed(() => {
  if (!form.value.stableId) return [];
  return contactPersons.value.filter((cp) => cp.stableId === form.value.stableId);
});

async function loadPayment() {
  try {
    loading.value = true;
    const payment = await paymentService.findOne(route.params.id as string);
    form.value = {
      stableId: payment.stableId,
      contactPersonId: payment.contactPersonId,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
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
  if (!form.value.contactPersonId) {
    errors.value.contactPersonId = 'Contact person is required';
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
          <select id="stableId" v-model="form.stableId" class="form-select" :class="{ 'has-error': errors.stableId }" @change="form.contactPersonId = ''">
            <option value="">Select a stable</option>
            <option v-for="stable in stables" :key="stable.id" :value="stable.id">{{ stable.name }}</option>
          </select>
          <span v-if="errors.stableId" class="form-error">{{ errors.stableId }}</span>
        </div>
        <div class="form-group">
          <label class="form-label required" for="contactPersonId">Contact Person</label>
          <select id="contactPersonId" v-model="form.contactPersonId" class="form-select" :class="{ 'has-error': errors.contactPersonId }" :disabled="!form.stableId">
            <option value="">Select a contact person</option>
            <option v-for="contactPerson in filteredContactPersons" :key="contactPerson.id" :value="contactPerson.id">{{ contactPerson.name }}</option>
          </select>
          <span v-if="errors.contactPersonId" class="form-error">{{ errors.contactPersonId }}</span>
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
