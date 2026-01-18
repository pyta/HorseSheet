<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { participantService } from '@/services/participant.service';
import { stableService } from '@/services/stable.service';
import { contactPersonService } from '@/services/contact-person.service';
import { useUIStore } from '@/stores/ui';
import type { CreateParticipantDto, UpdateParticipantDto, Stable, ContactPerson } from '@/types';

const router = useRouter();
const route = useRoute();
const uiStore = useUIStore();
const isEdit = computed(() => !!route.params.id);
const loading = ref(false);
const submitting = ref(false);
const stables = ref<Stable[]>([]);
const contactPersons = ref<ContactPerson[]>([]);
const form = ref<CreateParticipantDto>({ name: '', email: '', phone: '', stableId: '', defaultContactPersonId: '', isActive: true });
const version = ref<number | undefined>(undefined);
const errors = ref<Record<string, string>>({});

onMounted(async () => {
  await Promise.all([loadStables(), loadContactPersons()]);
  if (isEdit.value) await loadParticipant();
});

async function loadStables() {
  try {
    stables.value = (await stableService.findAll()).filter((s) => !s.deletedAt);
  } catch {}
}

async function loadContactPersons() {
  try {
    contactPersons.value = (await contactPersonService.findAll()).filter((c) => !c.deletedAt);
  } catch {}
}

const filteredContactPersons = computed(() => {
  if (!form.value.stableId) return [];
  return contactPersons.value.filter((cp) => cp.stableId === form.value.stableId);
});

async function loadParticipant() {
  try {
    loading.value = true;
    const p = await participantService.findOne(route.params.id as string);
    form.value = { name: p.name, email: p.email || '', phone: p.phone || '', stableId: p.stableId, defaultContactPersonId: p.defaultContactPersonId, isActive: p.isActive ?? true };
    version.value = p.version;
  } catch (error: any) {
    uiStore.showError(error.message || 'Failed to load participant');
    router.push('/admin/participants');
  } finally {
    loading.value = false;
  }
}

function validate(): boolean {
  errors.value = {};
  if (!form.value.name?.trim()) {
    errors.value.name = 'Name is required';
    return false;
  }
  if (!form.value.stableId) {
    errors.value.stableId = 'Stable is required';
    return false;
  }
  if (!form.value.defaultContactPersonId) {
    errors.value.defaultContactPersonId = 'Default contact person is required';
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
      await participantService.update(route.params.id as string, { ...form.value, version: version.value });
      uiStore.showSuccess('Participant updated successfully');
    } else {
      await participantService.create(form.value);
      uiStore.showSuccess('Participant created successfully');
    }
    router.push('/admin/participants');
  } catch (error: any) {
    if (error.status === 409) {
      uiStore.showError('This participant has been modified by another user. Please refresh and try again.');
      if (isEdit.value) await loadParticipant();
    } else if (error.errors) {
      errors.value = error.errors;
    } else {
      uiStore.showError(error.message || 'Failed to save participant');
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="participant-form">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">{{ isEdit ? 'Edit Participant' : 'Create New Participant' }}</h2>
        <router-link to="/admin/participants" class="btn btn-secondary">Back to List</router-link>
      </div>
      <div v-if="loading" class="loading"><div class="spinner"></div></div>
      <form v-else @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label required" for="name">Name</label>
          <input id="name" v-model="form.name" type="text" class="form-input" :class="{ 'has-error': errors.name }" placeholder="Enter name" />
          <span v-if="errors.name" class="form-error">{{ errors.name }}</span>
        </div>
        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <input id="email" v-model="form.email" type="email" class="form-input" placeholder="Enter email" />
        </div>
        <div class="form-group">
          <label class="form-label" for="phone">Phone</label>
          <input id="phone" v-model="form.phone" type="tel" class="form-input" placeholder="Enter phone" />
        </div>
        <div class="form-group">
          <label class="form-label required" for="stableId">Stable</label>
          <select id="stableId" v-model="form.stableId" class="form-select" :class="{ 'has-error': errors.stableId }" @change="form.defaultContactPersonId = ''">
            <option value="">Select a stable</option>
            <option v-for="stable in stables" :key="stable.id" :value="stable.id">{{ stable.name }}</option>
          </select>
          <span v-if="errors.stableId" class="form-error">{{ errors.stableId }}</span>
        </div>
        <div class="form-group">
          <label class="form-label required" for="defaultContactPersonId">Default Contact Person</label>
          <select id="defaultContactPersonId" v-model="form.defaultContactPersonId" class="form-select" :class="{ 'has-error': errors.defaultContactPersonId }" :disabled="!form.stableId">
            <option value="">Select a contact person</option>
            <option v-for="cp in filteredContactPersons" :key="cp.id" :value="cp.id">{{ cp.name }}</option>
          </select>
          <span v-if="errors.defaultContactPersonId" class="form-error">{{ errors.defaultContactPersonId }}</span>
        </div>
        <div class="form-group">
          <label class="form-label" for="isActive">
            <input id="isActive" v-model="form.isActive" type="checkbox" style="margin-right: 0.5rem" />
            Active
          </label>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="submitting">{{ submitting ? 'Saving...' : isEdit ? 'Update' : 'Create' }}</button>
          <router-link to="/admin/participants" class="btn btn-secondary">Cancel</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.participant-form {
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
