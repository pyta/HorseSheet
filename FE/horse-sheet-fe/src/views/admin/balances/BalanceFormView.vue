<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { balanceService } from '@/services/balance.service';
import { contactPersonService } from '@/services/contact-person.service';
import { useUIStore } from '@/stores/ui';
import type { CreateBalanceDto, UpdateBalanceDto, ContactPerson } from '@/types';

const router = useRouter();
const route = useRoute();
const uiStore = useUIStore();
const isEdit = computed(() => !!route.params.id);
const loading = ref(false);
const submitting = ref(false);
const contactPersons = ref<ContactPerson[]>([]);
const form = ref<CreateBalanceDto>({ contactPersonId: '', balance: 0 });
const version = ref<number | undefined>(undefined);
const errors = ref<Record<string, string>>({});

onMounted(async () => {
  await loadContactPersons();
  if (isEdit.value) await loadBalance();
});

async function loadContactPersons() {
  try {
    contactPersons.value = (await contactPersonService.findAll()).filter((cp) => !cp.deletedAt && cp.isActive);
  } catch {}
}

async function loadBalance() {
  try {
    loading.value = true;
    const b = await balanceService.findOne(route.params.id as string);
    form.value = { contactPersonId: b.contactPersonId, balance: Number(b.balance) };
    version.value = b.version;
  } catch (error: any) {
    uiStore.showError(error.message || 'Failed to load balance');
    router.push('/admin/balances');
  } finally {
    loading.value = false;
  }
}

function validate(): boolean {
  errors.value = {};
  if (!form.value.contactPersonId) {
    errors.value.contactPersonId = 'Contact person is required';
    return false;
  }
  if (form.value.balance === undefined || form.value.balance === null) {
    errors.value.balance = 'Balance is required';
    return false;
  }
  if (isNaN(form.value.balance)) {
    errors.value.balance = 'Balance must be a valid number';
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
      await balanceService.update(route.params.id as string, { ...form.value, version: version.value });
      uiStore.showSuccess('Balance updated successfully');
    } else {
      await balanceService.create(form.value);
      uiStore.showSuccess('Balance created successfully');
    }
    router.push('/admin/balances');
  } catch (error: any) {
    if (error.status === 409) {
      uiStore.showError('This balance has been modified by another user. Please refresh and try again.');
      if (isEdit.value) await loadBalance();
    } else if (error.errors) {
      errors.value = error.errors;
    } else {
      uiStore.showError(error.message || 'Failed to save balance');
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="balance-form">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">{{ isEdit ? 'Edit Balance' : 'Create New Balance' }}</h2>
        <router-link to="/admin/balances" class="btn btn-secondary">Back to List</router-link>
      </div>
      <div v-if="loading" class="loading"><div class="spinner"></div></div>
      <form v-else @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label required" for="contactPersonId">Contact Person</label>
          <select id="contactPersonId" v-model="form.contactPersonId" class="form-select" :class="{ 'has-error': errors.contactPersonId }">
            <option value="">Select a contact person</option>
            <option v-for="cp in contactPersons" :key="cp.id" :value="cp.id">{{ cp.name }}</option>
          </select>
          <span v-if="errors.contactPersonId" class="form-error">{{ errors.contactPersonId }}</span>
        </div>
        <div class="form-group">
          <label class="form-label required" for="balance">Balance</label>
          <input id="balance" v-model.number="form.balance" type="number" step="0.01" class="form-input" :class="{ 'has-error': errors.balance }" placeholder="Enter balance amount" />
          <span v-if="errors.balance" class="form-error">{{ errors.balance }}</span>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="submitting">{{ submitting ? 'Saving...' : isEdit ? 'Update' : 'Create' }}</button>
          <router-link to="/admin/balances" class="btn btn-secondary">Cancel</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.balance-form {
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

