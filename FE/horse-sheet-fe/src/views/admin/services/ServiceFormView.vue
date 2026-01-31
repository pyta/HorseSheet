<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { serviceService } from '@/services/service.service';
import { stableService } from '@/services/stable.service';
import { useUIStore } from '@/stores/ui';
import type { Service, CreateServiceDto, UpdateServiceDto, Stable } from '@/types';

const router = useRouter();
const route = useRoute();
const uiStore = useUIStore();
const { t } = useI18n();

const isEdit = computed(() => !!route.params.id);
const loading = ref(false);
const submitting = ref(false);

const stables = ref<Stable[]>([]);
const form = ref<CreateServiceDto>({
  name: '',
  description: '',
  stableId: '',
  isActive: true,
});

const version = ref<number | undefined>(undefined);
const errors = ref<Record<string, string>>({});

onMounted(async () => {
  await loadStables();
  if (isEdit.value) {
    await loadService();
  }
});

async function loadStables() {
  try {
    stables.value = await stableService.findAll();
    stables.value = stables.value.filter((s) => !s.deletedAt);
  } catch (error: any) {
    uiStore.showError(t('stables.loadError'));
  }
}

async function loadService() {
  try {
    loading.value = true;
    const service = await serviceService.findOne(route.params.id as string);
    form.value = {
      name: service.name,
      description: service.description || '',
      stableId: service.stableId,
      isActive: service.isActive ?? true,
    };
    version.value = service.version;
  } catch (error: any) {
    uiStore.showError(error.message || t('services.loadError'));
    router.push('/admin/services');
  } finally {
    loading.value = false;
  }
}

function validate(): boolean {
  errors.value = {};

  if (!form.value.name || form.value.name.trim() === '') {
    errors.value.name = t('validation.name.required');
    return false;
  }

  if (!form.value.stableId) {
    errors.value.stableId = t('validation.stable.required');
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
      const updateData: UpdateServiceDto = {
        ...form.value,
        version: version.value,
      };
      await serviceService.update(route.params.id as string, updateData);
      uiStore.showSuccess(t('services.updated'));
    } else {
      await serviceService.create(form.value);
      uiStore.showSuccess(t('services.created'));
    }

    router.push('/admin/services');
  } catch (error: any) {
    if (error.status === 409) {
      uiStore.showError(t('common.messages.versionConflict'));
      if (isEdit.value) {
        await loadService();
      }
    } else if (error.errors) {
      errors.value = error.errors;
    } else {
      uiStore.showError(error.message || t('services.saveError'));
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="service-form">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">{{ isEdit ? t('services.form.editTitle') : t('services.form.createTitle') }}</h2>
        <router-link to="/admin/services" class="btn btn-secondary">{{ t('common.buttons.backToList') }}</router-link>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>

      <form v-else @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label required" for="name">{{ t('common.labels.name') }}</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            class="form-input"
            :class="{ 'has-error': errors.name }"
            :placeholder="t('services.form.namePlaceholder')"
          />
          <span v-if="errors.name" class="form-error">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="description">{{ t('common.labels.description') }}</label>
          <textarea
            id="description"
            v-model="form.description"
            class="form-textarea"
            :placeholder="t('common.labels.description')"
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label required" for="stableId">{{ t('common.labels.stable') }}</label>
          <select
            id="stableId"
            v-model="form.stableId"
            class="form-select"
            :class="{ 'has-error': errors.stableId }"
          >
            <option value="">{{ t('common.labels.selectStable') }}</option>
            <option v-for="stable in stables" :key="stable.id" :value="stable.id">
              {{ stable.name }}
            </option>
          </select>
          <span v-if="errors.stableId" class="form-error">{{ errors.stableId }}</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="isActive">
            <input
              id="isActive"
              v-model="form.isActive"
              type="checkbox"
              style="margin-right: 0.5rem"
            />
            {{ t('common.labels.active') }}
          </label>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? t('common.buttons.saving') : isEdit ? t('common.buttons.update') : t('common.buttons.create') }}
          </button>
          <router-link to="/admin/services" class="btn btn-secondary">{{ t('common.buttons.cancel') }}</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.service-form {
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
