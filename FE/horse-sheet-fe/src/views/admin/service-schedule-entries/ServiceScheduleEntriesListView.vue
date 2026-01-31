<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { serviceScheduleEntryService } from '@/services/service-schedule-entry.service';
import { stableService } from '@/services/stable.service';
import { serviceService } from '@/services/service.service';
import { useUIStore } from '@/stores/ui';
import { useConfirm } from '@/composables/useConfirm';
import type { ServiceScheduleEntry, Stable, Service } from '@/types';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';

const uiStore = useUIStore();
const confirm = useConfirm();
const { t } = useI18n();
const entries = ref<ServiceScheduleEntry[]>([]);
const stables = ref<Stable[]>([]);
const services = ref<Service[]>([]);
const loading = ref(false);

onMounted(async () => {
  await Promise.all([loadEntries(), loadStables(), loadServices()]);
});

async function loadStables() {
  try {
    stables.value = await stableService.findAll();
  } catch {}
}

async function loadServices() {
  try {
    services.value = await serviceService.findAll();
  } catch {}
}

async function loadEntries() {
  try {
    loading.value = true;
    const data = await serviceScheduleEntryService.findAll();
    entries.value = Array.isArray(data) ? data.filter((e) => !e.deletedAt) : [];
  } catch (error: any) {
    uiStore.showError(error.message || t('schedule.entry.loadError'));
    entries.value = [];
  } finally {
    loading.value = false;
  }
}

function getStableName(stableId: string): string {
  return stables.value.find((s) => s.id === stableId)?.name || stableId;
}

function getServiceName(serviceId: string): string {
  return services.value.find((s) => s.id === serviceId)?.name || serviceId;
}

async function handleDelete(id: string) {
  if (await confirm.confirm(t('schedule.entry.deleteConfirm'), { title: t('schedule.entry.deleteTitle'), confirmText: t('common.buttons.delete') })) {
    try {
      await serviceScheduleEntryService.delete(id);
      uiStore.showSuccess(t('schedule.entry.deleted'));
      await loadEntries();
    } catch (error: any) {
      uiStore.showError(error.message || t('common.messages.deleteError'));
    }
  }
}
</script>

<template>
  <div class="service-schedule-entries-list">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">{{ t('navigation.serviceSchedule') }}</h2>
        <router-link to="/admin/service-schedule-entries/new" class="btn btn-primary">{{ t('schedule.entries.createNew') }}</router-link>
      </div>
      <div v-if="loading" class="loading"><div class="spinner"></div></div>
      <div v-else>
        <!-- Desktop Table View -->
        <div class="table-container desktop-view">
          <table class="table">
            <thead>
              <tr>
                <th>{{ t('common.labels.date') }}</th>
                <th>{{ t('common.labels.duration') }}</th>
                <th>{{ t('common.labels.service') }}</th>
                <th>{{ t('common.labels.stable') }}</th>
                <th>{{ t('common.labels.participants') }}</th>
                <th>{{ t('common.labels.active') }}</th>
                <th>{{ t('common.labels.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="entries.length === 0">
                <td colspan="7" style="text-align: center; padding: 2rem; color: #7f8c8d">{{ t('common.labels.noEntriesFound') }}</td>
              </tr>
              <tr v-for="entry in entries" :key="entry.id">
                <td>{{ entry.date }}</td>
                <td>{{ entry.duration }}</td>
                <td>{{ getServiceName(entry.serviceId) }}</td>
                <td>{{ getStableName(entry.stableId) }}</td>
                <td>{{ entry.participantIds?.length || 0 }}</td>
                <td>{{ entry.isActive ? t('common.labels.yes') : t('common.labels.no') }}</td>
                <td>
                  <div class="table-actions">
                    <router-link :to="`/admin/service-schedule-entries/${entry.id}`" class="btn btn-secondary">{{ t('common.buttons.edit') }}</router-link>
                    <button class="btn btn-danger" @click="handleDelete(entry.id)">{{ t('common.buttons.delete') }}</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Tile View -->
        <div v-if="entries.length === 0" class="mobile-view empty-state">
          <p>{{ t('common.labels.noEntriesFound') }}</p>
        </div>
        <div v-else class="mobile-view mobile-tiles">
          <div v-for="entry in entries" :key="entry.id" class="data-tile">
            <div class="tile-header">
              <h3 class="tile-title">{{ getServiceName(entry.serviceId) }}</h3>
              <span :class="['tile-badge', entry.isActive ? 'badge-active' : 'badge-inactive']">
                {{ entry.isActive ? t('common.labels.active') : t('common.labels.inactive') }}
              </span>
            </div>
            <div class="tile-content">
              <div class="tile-row">
                <span class="tile-label">{{ t('common.labels.date') }}:</span>
                <span class="tile-value">{{ entry.date }}</span>
              </div>
              <div class="tile-row">
                <span class="tile-label">{{ t('common.labels.duration') }}:</span>
                <span class="tile-value">{{ entry.duration }} min</span>
              </div>
              <div class="tile-row">
                <span class="tile-label">{{ t('common.labels.stable') }}:</span>
                <span class="tile-value">{{ getStableName(entry.stableId) }}</span>
              </div>
              <div class="tile-row">
                <span class="tile-label">{{ t('common.labels.participants') }}:</span>
                <span class="tile-value">{{ entry.participantIds?.length || 0 }}</span>
              </div>
            </div>
            <div class="tile-actions">
              <router-link :to="`/admin/service-schedule-entries/${entry.id}`" class="btn btn-secondary btn-sm">{{ t('common.buttons.edit') }}</router-link>
              <button class="btn btn-danger btn-sm" @click="handleDelete(entry.id)">{{ t('common.buttons.delete') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ConfirmDialog :show="confirm.show.value" :title="confirm.title.value" :message="confirm.message.value" :confirm-text="confirm.confirmText.value" :cancel-text="confirm.cancelText.value" @confirm="confirm.handleConfirm" @cancel="confirm.handleCancel" />
  </div>
</template>

<style scoped>
.service-schedule-entries-list {
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
    min-width: 100px;
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
</style>
