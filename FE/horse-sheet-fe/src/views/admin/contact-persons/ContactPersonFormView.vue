<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { contactPersonService } from '@/services/contact-person.service';
import { stableService } from '@/services/stable.service';
import { useUIStore } from '@/stores/ui';
import type { CreateContactPersonDto, UpdateContactPersonDto, Stable } from '@/types';

const router = useRouter();
const route = useRoute();
const uiStore = useUIStore();
const { t } = useI18n();
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
    uiStore.showError(error.message || t('contactPersons.loadError'));
    router.push('/admin/contact-persons');
  } finally {
    loading.value = false;
  }
}

function validate(): boolean {
  errors.value = {};
  if (!form.value.name?.trim()) {
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
  if (!validate()) return;
  try {
    submitting.value = true;
    errors.value = {};
    if (isEdit.value) {
      await contactPersonService.update(route.params.id as string, { ...form.value, version: version.value });
      uiStore.showSuccess(t('contactPersons.updated'));
    } else {
      await contactPersonService.create(form.value);
      uiStore.showSuccess(t('contactPersons.created'));
    }
    router.push('/admin/contact-persons');
  } catch (error: any) {
    if (error.status === 409) {
      uiStore.showError(t('common.messages.versionConflict'));
      if (isEdit.value) await loadContactPerson();
    } else if (error.errors) {
      errors.value = error.errors;
    } else {
      uiStore.showError(error.message || t('contactPersons.saveError'));
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
        <h2 class="card-title">{{ isEdit ? t('contactPersons.form.editTitle') : t('contactPersons.form.createTitle') }}</h2>
        <router-link to="/admin/contact-persons" class="btn btn-secondary">{{ t('common.buttons.backToList') }}</router-link>
      </div>
      <div v-if="loading" class="loading"><div class="spinner"></div></div>
      <form v-else @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label required" for="name">{{ t('common.labels.name') }}</label>
          <input id="name" v-model="form.name" type="text" class="form-input" :class="{ 'has-error': errors.name }" :placeholder="t('contactPersons.form.namePlaceholder')" />
          <span v-if="errors.name" class="form-error">{{ errors.name }}</span>
        </div>
        <div class="form-group">
          <label class="form-label" for="email">{{ t('common.labels.email') }}</label>
          <input id="email" v-model="form.email" type="email" class="form-input" :placeholder="t('common.labels.enterEmail')" />
        </div>
        <div class="form-group">
          <label class="form-label" for="phone">{{ t('common.labels.phone') }}</label>
          <input id="phone" v-model="form.phone" type="tel" class="form-input" :placeholder="t('common.labels.enterPhone')" />
        </div>
        <div class="form-group">
          <label class="form-label required" for="stableId">{{ t('common.labels.stable') }}</label>
          <select id="stableId" v-model="form.stableId" class="form-select" :class="{ 'has-error': errors.stableId }">
            <option value="">{{ t('common.labels.selectStable') }}</option>
            <option v-for="stable in stables" :key="stable.id" :value="stable.id">{{ stable.name }}</option>
          </select>
          <span v-if="errors.stableId" class="form-error">{{ errors.stableId }}</span>
        </div>
        <div class="form-group">
          <label class="form-label" for="isActive">
            <input id="isActive" v-model="form.isActive" type="checkbox" style="margin-right: 0.5rem" />
            {{ t('common.labels.active') }}
          </label>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="submitting">{{ submitting ? t('common.buttons.saving') : isEdit ? t('common.buttons.update') : t('common.buttons.create') }}</button>
          <router-link to="/admin/contact-persons" class="btn btn-secondary">{{ t('common.buttons.cancel') }}</router-link>
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
