<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { individualServicePriceListService } from '@/services/individual-service-price-list.service';
import { stableService } from '@/services/stable.service';
import { serviceService } from '@/services/service.service';
import { participantService } from '@/services/participant.service';
import { useUIStore } from '@/stores/ui';
import type { CreateIndividualServicePriceListDto, UpdateIndividualServicePriceListDto, Stable, Service, Participant } from '@/types';

const router = useRouter();
const route = useRoute();
const uiStore = useUIStore();
const isEdit = computed(() => !!route.params.id);
const loading = ref(false);
const submitting = ref(false);
const stables = ref<Stable[]>([]);
const services = ref<Service[]>([]);
const participants = ref<Participant[]>([]);
const form = ref<CreateIndividualServicePriceListDto>({ stableId: '', participantId: '', serviceId: null, price: 0, currency: 'PLN' });
const version = ref<number | undefined>(undefined);
const errors = ref<Record<string, string>>({});

onMounted(async () => {
  await Promise.all([loadStables(), loadServices(), loadParticipants()]);
  if (isEdit.value) await loadPriceList();
});

async function loadStables() {
  try {
    stables.value = (await stableService.findAll()).filter((s) => !s.deletedAt);
  } catch {}
}

async function loadServices() {
  try {
    services.value = (await serviceService.findAll()).filter((s) => !s.deletedAt);
  } catch {}
}

async function loadParticipants() {
  try {
    participants.value = (await participantService.findAll()).filter((p) => !p.deletedAt);
  } catch {}
}

const filteredServices = computed(() => {
  if (!form.value.stableId) return [];
  return services.value.filter((s) => s.stableId === form.value.stableId);
});

const filteredParticipants = computed(() => {
  if (!form.value.stableId) return [];
  return participants.value.filter((p) => p.stableId === form.value.stableId);
});

async function loadPriceList() {
  try {
    loading.value = true;
    const pl = await individualServicePriceListService.findOne(route.params.id as string);
    form.value = { stableId: pl.stableId, participantId: pl.participantId, serviceId: pl.serviceId || null, price: pl.price, currency: pl.currency };
    version.value = pl.version;
  } catch (error: any) {
    uiStore.showError(error.message || 'Failed to load price list');
    router.push('/admin/individual-service-price-lists');
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
  if (!form.value.price || form.value.price <= 0) {
    errors.value.price = 'Price must be greater than 0';
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
      await individualServicePriceListService.update(route.params.id as string, { ...form.value, version: version.value });
      uiStore.showSuccess('Price list updated successfully');
    } else {
      await individualServicePriceListService.create(form.value);
      uiStore.showSuccess('Price list created successfully');
    }
    router.push('/admin/individual-service-price-lists');
  } catch (error: any) {
    if (error.status === 409) {
      uiStore.showError('This price list has been modified by another user. Please refresh and try again.');
      if (isEdit.value) await loadPriceList();
    } else if (error.errors) {
      errors.value = error.errors;
    } else {
      uiStore.showError(error.message || 'Failed to save price list');
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="individual-service-price-list-form">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">{{ isEdit ? 'Edit Individual Service Price List' : 'Create New Individual Service Price List' }}</h2>
        <router-link to="/admin/individual-service-price-lists" class="btn btn-secondary">Back to List</router-link>
      </div>
      <div v-if="loading" class="loading"><div class="spinner"></div></div>
      <form v-else @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label required" for="stableId">Stable</label>
          <select id="stableId" v-model="form.stableId" class="form-select" :class="{ 'has-error': errors.stableId }" @change="form.participantId = ''; form.serviceId = null">
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
          <label class="form-label" for="serviceId">Service (optional)</label>
          <select id="serviceId" v-model="form.serviceId" class="form-select" :disabled="!form.stableId">
            <option :value="null">None (general price)</option>
            <option v-for="service in filteredServices" :key="service.id" :value="service.id">{{ service.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label required" for="price">Price</label>
          <input id="price" v-model.number="form.price" type="number" step="0.01" min="0" class="form-input" :class="{ 'has-error': errors.price }" />
          <span v-if="errors.price" class="form-error">{{ errors.price }}</span>
        </div>
        <div class="form-group">
          <label class="form-label" for="currency">Currency</label>
          <input id="currency" v-model="form.currency" type="text" class="form-input" placeholder="PLN" />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="submitting">{{ submitting ? 'Saving...' : isEdit ? 'Update' : 'Create' }}</button>
          <router-link to="/admin/individual-service-price-lists" class="btn btn-secondary">Cancel</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.individual-service-price-list-form {
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
