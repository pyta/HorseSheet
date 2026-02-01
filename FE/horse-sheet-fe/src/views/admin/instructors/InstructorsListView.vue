<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { instructorService } from '@/services/instructor.service';
import { stableService } from '@/services/stable.service';
import { useUIStore } from '@/stores/ui';
import { useConfirm } from '@/composables/useConfirm';
import type { Instructor, Stable } from '@/types';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';

const uiStore = useUIStore();
const confirm = useConfirm();
const { t } = useI18n();
const instructors = ref<Instructor[]>([]);
const stables = ref<Stable[]>([]);
const loading = ref(false);

onMounted(async () => {
  await Promise.all([loadInstructors(), loadStables()]);
});

async function loadStables() {
  try {
    const data = await stableService.findAll();
    stables.value = Array.isArray(data) ? data : [];
  } catch {
    stables.value = [];
  }
}

async function loadInstructors() {
  try {
    loading.value = true;
    const data = await instructorService.findAll();
    instructors.value = Array.isArray(data) ? data.filter((i) => !i.deletedAt) : [];
  } catch (error: any) {
    uiStore.showError(error.message || t('instructors.loadError'));
    instructors.value = [];
  } finally {
    loading.value = false;
  }
}

function getStableName(stableId: string): string {
  if (!Array.isArray(stables.value)) return stableId;
  return stables.value.find((s) => s.id === stableId)?.name || stableId;
}

async function handleDelete(id: string) {
  if (await confirm.confirm(t('common.messages.confirmDelete'), { title: t('instructors.title'), confirmText: t('common.buttons.delete') })) {
    try {
      await instructorService.delete(id);
      uiStore.showSuccess(t('instructors.deleted'));
      await loadInstructors();
    } catch (error: any) {
      uiStore.showError(error.message || t('common.messages.deleteError'));
    }
  }
}
</script>

<template>
  <div class="instructors-list">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">{{ t('instructors.title') }}</h2>
        <router-link to="/admin/instructors/new" class="btn btn-primary add-button">
          <span class="add-icon">+</span>
          <span class="add-label">{{ t('common.buttons.add') }}</span>
        </router-link>
      </div>
      <div v-if="loading" class="loading"><div class="spinner"></div></div>
      <div v-else>
        <!-- Desktop Table View -->
        <div class="table-container desktop-view">
          <table class="table">
            <thead>
              <tr>
                <th>{{ t('common.labels.name') }}</th>
                <th>{{ t('common.labels.stable') }}</th>
                <th>{{ t('common.labels.active') }}</th>
                <th>{{ t('common.labels.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="instructors.length === 0">
                <td colspan="4" style="text-align: center; padding: 2rem; color: #7f8c8d">{{ t('common.labels.noInstructorsFound') }}</td>
              </tr>
              <tr v-for="i in instructors" :key="i.id">
                <td>{{ i.name }}</td>
                <td>{{ getStableName(i.stableId) }}</td>
                <td>{{ i.isActive ? t('common.labels.yes') : t('common.labels.no') }}</td>
                <td>
                  <div class="table-actions">
                    <router-link :to="`/admin/instructors/${i.id}`" class="btn btn-secondary">{{ t('common.buttons.edit') }}</router-link>
                    <button class="btn btn-danger" @click="handleDelete(i.id)">{{ t('common.buttons.delete') }}</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Tile View -->
        <div v-if="instructors.length === 0" class="mobile-view empty-state">
          <p>{{ t('common.labels.noInstructorsFound') }}</p>
        </div>
        <div v-else class="mobile-view mobile-tiles">
          <div v-for="i in instructors" :key="i.id" class="data-tile">
            <div class="tile-header">
              <h3 class="tile-title">{{ i.name }}</h3>
              <span :class="['tile-badge', i.isActive ? 'badge-active' : 'badge-inactive']">
                {{ i.isActive ? t('common.labels.active') : t('common.labels.inactive') }}
              </span>
            </div>
            <div class="tile-content">
              <div class="tile-row">
                <span class="tile-label">{{ t('common.labels.stable') }}:</span>
                <span class="tile-value">{{ getStableName(i.stableId) }}</span>
              </div>
            </div>
            <div class="tile-actions">
              <router-link :to="`/admin/instructors/${i.id}`" class="btn btn-secondary btn-sm">{{ t('common.buttons.edit') }}</router-link>
              <button class="btn btn-danger btn-sm" @click="handleDelete(i.id)">{{ t('common.buttons.delete') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ConfirmDialog :show="confirm.show.value" :title="confirm.title.value" :message="confirm.message.value" :confirm-text="confirm.confirmText.value" :cancel-text="confirm.cancelText.value" @confirm="confirm.handleConfirm" @cancel="confirm.handleCancel" />
  </div>
</template>

<style scoped>
.instructors-list {
  max-width: 1400px;
}

/* Desktop View */
.desktop-view {
  display: block;
}

.mobile-view {
  display: none;
}

/* Mobile View */
@media (max-width: 768px) {
  .desktop-view {
    display: none;
  }

  .mobile-view {
    display: block;
  }

  .mobile-tiles {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0;
  }

  .data-tile {
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .tile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .tile-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
  }

  .tile-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .badge-active {
    background-color: #d4edda;
    color: #155724;
  }

  .badge-inactive {
    background-color: #f8d7da;
    color: #721c24;
  }

  .tile-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .tile-row {
    display: flex;
    gap: 0.5rem;
  }

  .tile-label {
    font-weight: 500;
    color: #7f8c8d;
    min-width: 80px;
  }

  .tile-value {
    color: #2c3e50;
    flex: 1;
  }

  .tile-actions {
    display: flex;
    gap: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid #f0f0f0;
  }

  .btn-sm {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }

  .empty-state {
    text-align: center;
    padding: 2rem;
    color: #7f8c8d;
  }
}

.add-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.add-icon {
  font-size: 1.2rem;
  font-weight: bold;
  line-height: 1;
}

.add-label {
  display: inline;
}

@media (max-width: 768px) {
  .add-label {
    display: none;
  }
}
</style>
