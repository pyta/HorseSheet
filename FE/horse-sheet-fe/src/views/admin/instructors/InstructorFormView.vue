<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { instructorService } from '@/services/instructor.service';
import { stableService } from '@/services/stable.service';
import { useUIStore } from '@/stores/ui';
import type { CreateInstructorDto, UpdateInstructorDto, Stable } from '@/types';

const router = useRouter();
const route = useRoute();
const uiStore = useUIStore();
const isEdit = computed(() => !!route.params.id);
const loading = ref(false);
const submitting = ref(false);
const stables = ref<Stable[]>([]);
const form = ref<CreateInstructorDto>({ name: '', stableId: '', isActive: true });
const version = ref<number | undefined>(undefined);
const errors = ref<Record<string, string>>({});

onMounted(async () => {
  await loadStables();
  if (isEdit.value) await loadInstructor();
});

async function loadStables() {
  try {
    stables.value = (await stableService.findAll()).filter((s) => !s.deletedAt);
  } catch {}
}

async function loadInstructor() {
  try {
    loading.value = true;
    const i = await instructorService.findOne(route.params.id as string);
    form.value = { name: i.name, stableId: i.stableId, isActive: i.isActive ?? true };
    version.value = i.version;
  } catch (error: any) {
    uiStore.showError(error.message || 'Failed to load instructor');
    router.push('/admin/instructors');
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
      await instructorService.update(route.params.id as string, { ...form.value, version: version.value });
      uiStore.showSuccess('Instructor updated successfully');
    } else {
      await instructorService.create(form.value);
      uiStore.showSuccess('Instructor created successfully');
    }
    router.push('/admin/instructors');
  } catch (error: any) {
    if (error.status === 409) {
      uiStore.showError('This instructor has been modified by another user. Please refresh and try again.');
      if (isEdit.value) await loadInstructor();
    } else if (error.errors) {
      errors.value = error.errors;
    } else {
      uiStore.showError(error.message || 'Failed to save instructor');
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="instructor-form">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">{{ isEdit ? 'Edit Instructor' : 'Create New Instructor' }}</h2>
        <router-link to="/admin/instructors" class="btn btn-secondary">Back to List</router-link>
      </div>
      <div v-if="loading" class="loading"><div class="spinner"></div></div>
      <form v-else @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label required" for="name">Name</label>
          <input id="name" v-model="form.name" type="text" class="form-input" :class="{ 'has-error': errors.name }" placeholder="Enter name" />
          <span v-if="errors.name" class="form-error">{{ errors.name }}</span>
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
          <router-link to="/admin/instructors" class="btn btn-secondary">Cancel</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.instructor-form {
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
