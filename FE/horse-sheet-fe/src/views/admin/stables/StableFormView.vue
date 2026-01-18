<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { stableService } from '@/services/stable.service';
import { useUIStore } from '@/stores/ui';
import type { Stable, CreateStableDto, UpdateStableDto } from '@/types';

const router = useRouter();
const route = useRoute();
const uiStore = useUIStore();

const isEdit = computed(() => !!route.params.id);
const loading = ref(false);
const submitting = ref(false);

const form = ref<CreateStableDto>({
  name: '',
  address: '',
  contactInfo: '',
  timezone: '',
  isActive: true,
});

const version = ref<number | undefined>(undefined);
const errors = ref<Record<string, string>>({});

onMounted(async () => {
  if (isEdit.value) {
    await loadStable();
  }
});

async function loadStable() {
  try {
    loading.value = true;
    const stable = await stableService.findOne(route.params.id as string);
    form.value = {
      name: stable.name,
      address: stable.address || '',
      contactInfo: stable.contactInfo || '',
      timezone: stable.timezone || '',
      isActive: stable.isActive ?? true,
    };
    version.value = stable.version;
  } catch (error: any) {
    uiStore.showError(error.message || 'Failed to load stable');
    router.push('/admin/stables');
  } finally {
    loading.value = false;
  }
}

function validate(): boolean {
  errors.value = {};

  if (!form.value.name || form.value.name.trim() === '') {
    errors.value.name = 'Name is required';
    return false;
  }

  return true;
}

async function handleSubmit() {
  if (!validate()) {
    return;
  }

  try {
    submitting.value = true;
    errors.value = {};

    if (isEdit.value) {
      const updateData: UpdateStableDto = {
        ...form.value,
        version: version.value,
      };
      await stableService.update(route.params.id as string, updateData);
      uiStore.showSuccess('Stable updated successfully');
    } else {
      await stableService.create(form.value);
      uiStore.showSuccess('Stable created successfully');
    }

    router.push('/admin/stables');
  } catch (error: any) {
    if (error.status === 409) {
      // Conflict - version mismatch
      uiStore.showError(
        'This stable has been modified by another user. Please refresh and try again.'
      );
      if (isEdit.value) {
        await loadStable();
      }
    } else if (error.errors) {
      // Validation errors
      errors.value = error.errors;
    } else {
      uiStore.showError(error.message || 'Failed to save stable');
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="stable-form">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">{{ isEdit ? 'Edit Stable' : 'Create New Stable' }}</h2>
        <router-link to="/admin/stables" class="btn btn-secondary">Back to List</router-link>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>

      <form v-else @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label required" for="name">Name</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="form-input"
            :class="{ 'has-error': errors.name }"
            placeholder="Enter stable name"
          />
          <span v-if="errors.name" class="form-error">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="address">Address</label>
          <input
            id="address"
            v-model="form.address"
            type="text"
            class="form-input"
            placeholder="Enter address"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="contactInfo">Contact Info</label>
          <input
            id="contactInfo"
            v-model="form.contactInfo"
            type="text"
            class="form-input"
            placeholder="Enter contact information"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="timezone">Timezone</label>
          <input
            id="timezone"
            v-model="form.timezone"
            type="text"
            class="form-input"
            placeholder="e.g., Europe/Warsaw"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="isActive">
            <input
              id="isActive"
              v-model="form.isActive"
              type="checkbox"
              style="margin-right: 0.5rem"
            />
            Active
          </label>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? 'Saving...' : isEdit ? 'Update' : 'Create' }}
          </button>
          <router-link to="/admin/stables" class="btn btn-secondary">Cancel</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.stable-form {
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
