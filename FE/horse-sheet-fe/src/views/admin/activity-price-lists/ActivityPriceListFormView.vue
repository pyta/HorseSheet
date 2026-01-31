<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { activityPriceListService } from '@/services/activity-price-list.service';
import { stableService } from '@/services/stable.service';
import { activityService } from '@/services/activity.service';
import { useUIStore } from '@/stores/ui';
import type { CreateActivityPriceListDto, UpdateActivityPriceListDto, Stable, Activity } from '@/types';

const router = useRouter();
const route = useRoute();
const uiStore = useUIStore();
const { t } = useI18n();
const isEdit = computed(() => !!route.params.id);
const loading = ref(false);
const submitting = ref(false);
const stables = ref<Stable[]>([]);
const activities = ref<Activity[]>([]);
const form = ref<CreateActivityPriceListDto>({ stableId: '', activityId: '', price: 0, currency: 'PLN', isActive: true });
const version = ref<number | undefined>(undefined);
const errors = ref<Record<string, string>>({});

onMounted(async () => {
  await Promise.all([loadStables(), loadActivities()]);
  if (isEdit.value) await loadPriceList();
});

async function loadStables() {
  try {
    stables.value = (await stableService.findAll()).filter((s) => !s.deletedAt);
  } catch {}
}

async function loadActivities() {
  try {
    activities.value = (await activityService.findAll()).filter((a) => !a.deletedAt);
  } catch {}
}

const filteredActivities = computed(() => {
  if (!form.value.stableId) return [];
  return activities.value.filter((a) => a.stableId === form.value.stableId);
});

async function loadPriceList() {
  try {
    loading.value = true;
    const pl = await activityPriceListService.findOne(route.params.id as string);
    form.value = { stableId: pl.stableId, activityId: pl.activityId, price: pl.price, currency: pl.currency, isActive: pl.isActive ?? true };
    version.value = pl.version;
  } catch (error: any) {
    uiStore.showError(error.message || 'Failed to load price list');
    router.push('/admin/activity-price-lists');
  } finally {
    loading.value = false;
  }
}

function validate(): boolean {
  errors.value = {};
  if (!form.value.stableId) {
    errors.value.stableId = t('validation.stable.required');
    return false;
  }
  if (!form.value.activityId) {
    errors.value.activityId = t('validation.activity.required');
    return false;
  }
  if (!form.value.price || form.value.price <= 0) {
    errors.value.price = t('validation.price.mustBeGreaterThanZero');
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
      await activityPriceListService.update(route.params.id as string, { ...form.value, version: version.value });
      uiStore.showSuccess(t('priceLists.activity.updated'));
    } else {
      await activityPriceListService.create(form.value);
      uiStore.showSuccess(t('priceLists.activity.created'));
    }
    router.push('/admin/activity-price-lists');
  } catch (error: any) {
    if (error.status === 409) {
      uiStore.showError(t('common.messages.versionConflict'));
      if (isEdit.value) await loadPriceList();
    } else if (error.errors) {
      errors.value = error.errors;
    } else {
      uiStore.showError(error.message || t('priceLists.activity.saveError'));
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="activity-price-list-form">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">{{ isEdit ? t('priceLists.activity.form.editTitle') : t('priceLists.activity.form.createTitle') }}</h2>
        <router-link to="/admin/activity-price-lists" class="btn btn-secondary">{{ t('common.buttons.backToList') }}</router-link>
      </div>
      <div v-if="loading" class="loading"><div class="spinner"></div></div>
      <form v-else @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label required" for="stableId">{{ t('common.labels.stable') }}</label>
          <select id="stableId" v-model="form.stableId" class="form-select" :class="{ 'has-error': errors.stableId }" @change="form.activityId = ''">
            <option value="">{{ t('common.labels.selectStable') }}</option>
            <option v-for="stable in stables" :key="stable.id" :value="stable.id">{{ stable.name }}</option>
          </select>
          <span v-if="errors.stableId" class="form-error">{{ errors.stableId }}</span>
        </div>
        <div class="form-group">
          <label class="form-label required" for="activityId">{{ t('common.labels.activity') }}</label>
          <select id="activityId" v-model="form.activityId" class="form-select" :class="{ 'has-error': errors.activityId }" :disabled="!form.stableId">
            <option value="">{{ t('common.labels.selectActivity') }}</option>
            <option v-for="activity in filteredActivities" :key="activity.id" :value="activity.id">{{ activity.name }}</option>
          </select>
          <span v-if="errors.activityId" class="form-error">{{ errors.activityId }}</span>
        </div>
        <div class="form-group">
          <label class="form-label required" for="price">{{ t('common.labels.price') }}</label>
          <input id="price" v-model.number="form.price" type="number" step="0.01" min="0" class="form-input" :class="{ 'has-error': errors.price }" />
          <span v-if="errors.price" class="form-error">{{ errors.price }}</span>
        </div>
        <div class="form-group">
          <label class="form-label" for="currency">{{ t('common.labels.currency') }}</label>
          <input id="currency" v-model="form.currency" type="text" class="form-input" placeholder="PLN" />
        </div>
        <div class="form-group">
          <label class="form-label" for="isActive">
            <input id="isActive" v-model="form.isActive" type="checkbox" style="margin-right: 0.5rem" />
            {{ t('common.labels.active') }}
          </label>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="submitting">{{ submitting ? t('common.buttons.saving') : isEdit ? t('common.buttons.update') : t('common.buttons.create') }}</button>
          <router-link to="/admin/activity-price-lists" class="btn btn-secondary">{{ t('common.buttons.cancel') }}</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.activity-price-list-form {
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
