<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { contactPersonService } from '@/services/contact-person.service';
import { stableService } from '@/services/stable.service';
import { useUIStore } from '@/stores/ui';
import type { CreateContactPersonDto, UpdateContactPersonDto, Stable } from '@/types';

const router = useRouter();
const route = useRoute();
const uiStore = useUIStore();
const isEdit = computed(() => !!route.params.id);
const loading = ref(false);
const submitting = ref(false);
const stables = ref<Stable[]>([]);
const form = ref<CreateContactPersonDto>({ name: '', email: '', phone: '', stableId: '', isActive: true });
const version = ref<number | undefined>(undefined);
const errors = ref<Record<string, string>>({});

onMounted(async () => {
  await loadStables();
  if (isEdit.value) await loadContactPerson();
});

async function loadStables() {
  try {
    stables.value = (await stableService.findAll()).filter((s) => !s.deletedAt);
  } catch {}
}

async function loadContactPerson() {
  try {
    loading.value = true;
    const cp = await contactPersonService.findOne(route.params.id as string);
    form.value = { name: cp.name, email: cp.email || '', phone: cp.phone || '', stableId: cp.stableId, isActive: cp.isActive ?? true };
    version.value = cp.version;
  } catch (error: any) {
    uiStore.showError(error.message || 'Failed to load contact person');
    router.push('/admin/contact-persons');
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
  return true;
}

async function handleSubmit() {
  if (!validate()) return;
  try {
    submitting.value = true;
    errors.value = {};
    if (isEdit.value) {
      await contactPersonService.update(route.params.id as string, { ...form.value, version: version.value });
      uiStore.showSuccess('Contact person updated successfully');
    } else {
      await contactPersonService.create(form.value);
      uiStore.showSuccess('Contact person created successfully');
    }
    router.push('/admin/contact-persons');
  } catch (error: any) {
    if (error.status === 409) {
      uiStore.showError('This contact person has been modified by another user. Please refresh and try again.');
      if (isEdit.value) await loadContactPerson();
    } else if (error.errors) {
      errors.value = error.errors;
    } else {
      uiStore.showError(error.message || 'Failed to save contact person');
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="contact-person-form">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">{{ isEdit ? 'Edit Contact Person' : 'Create New Contact Person' }}</h2>
        <router-link to="/admin/contact-persons" class="btn btn-secondary">Back to List</router-link>
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
          <select id="stableId" v-model="form.stableId" class="form-select" :class="{ 'has-error': errors.stableId }">
            <option value="">Select a stable</option>
            <option v-for="stable in stables" :key="stable.id" :value="stable.id">{{ stable.name }}</option>
          </select>
          <span v-if="errors.stableId" class="form-error">{{ errors.stableId }}</span>
        </div>
        <div class="form-group">
          <label class="form-label" for="isActive">
            <input id="isActive" v-model="form.isActive" type="checkbox" style="margin-right: 0.5rem" />
            Active
          </label>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="submitting">{{ submitting ? 'Saving...' : isEdit ? 'Update' : 'Create' }}</button>
          <router-link to="/admin/contact-persons" class="btn btn-secondary">Cancel</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.contact-person-form {
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
