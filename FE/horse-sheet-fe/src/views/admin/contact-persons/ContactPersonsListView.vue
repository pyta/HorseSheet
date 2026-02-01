<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { contactPersonService } from '@/services/contact-person.service';
import { stableService } from '@/services/stable.service';
import { useUIStore } from '@/stores/ui';
import { useConfirm } from '@/composables/useConfirm';
import type { ContactPerson, Stable } from '@/types';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';

const uiStore = useUIStore();
const confirm = useConfirm();
const { t } = useI18n();

const contactPersons = ref<ContactPerson[]>([]);
const stables = ref<Stable[]>([]);
const loading = ref(false);

onMounted(async () => {
  await Promise.all([loadContactPersons(), loadStables()]);
});

async function loadStables() {
  try {
    const data = await stableService.findAll();
    stables.value = Array.isArray(data) ? data : [];
  } catch {
    stables.value = [];
  }
}

async function loadContactPersons() {
  try {
    loading.value = true;
    const data = await contactPersonService.findAll();
    contactPersons.value = Array.isArray(data) ? data.filter((c) => !c.deletedAt) : [];
  } catch (error: any) {
    uiStore.showError(error.message || t('contactPersons.loadError'));
    contactPersons.value = [];
  } finally {
    loading.value = false;
  }
}

function getStableName(stableId: string): string {
  if (!Array.isArray(stables.value)) return stableId;
  return stables.value.find((s) => s.id === stableId)?.name || stableId;
}

async function handleDelete(id: string) {
  if (await confirm.confirm(t('common.messages.confirmDelete'), { title: t('contactPersons.title'), confirmText: t('common.buttons.delete') })) {
    try {
      await contactPersonService.delete(id);
      uiStore.showSuccess(t('contactPersons.deleted'));
      await loadContactPersons();
    } catch (error: any) {
      uiStore.showError(error.message || t('common.messages.deleteError'));
    }
  }
}
</script>

<template>
  <div class="contact-persons-list">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">{{ t('contactPersons.title') }}</h2>
        <router-link to="/admin/contact-persons/new" class="btn btn-primary add-button">
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
                <th>{{ t('common.labels.email') }}</th>
                <th>{{ t('common.labels.phone') }}</th>
                <th>{{ t('common.labels.stable') }}</th>
                <th>{{ t('common.labels.active') }}</th>
                <th>{{ t('common.labels.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="contactPersons.length === 0">
                <td colspan="6" style="text-align: center; padding: 2rem; color: #7f8c8d">{{ t('common.labels.noContactPersonsFound') }}</td>
              </tr>
              <tr v-for="cp in contactPersons" :key="cp.id">
                <td>{{ cp.name }}</td>
                <td>{{ cp.email || '-' }}</td>
                <td>{{ cp.phone || '-' }}</td>
                <td>{{ getStableName(cp.stableId) }}</td>
                <td>{{ cp.isActive ? t('common.labels.yes') : t('common.labels.no') }}</td>
                <td>
                  <div class="table-actions">
                    <router-link :to="`/admin/contact-persons/${cp.id}`" class="btn btn-secondary">{{ t('common.buttons.edit') }}</router-link>
                    <button class="btn btn-danger" @click="handleDelete(cp.id)">{{ t('common.buttons.delete') }}</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Tile View -->
        <div v-if="contactPersons.length === 0" class="mobile-view empty-state">
          <p>{{ t('common.labels.noContactPersonsFound') }}</p>
        </div>
        <div v-else class="mobile-view mobile-tiles">
          <div v-for="cp in contactPersons" :key="cp.id" class="data-tile">
            <div class="tile-header">
              <h3 class="tile-title">{{ cp.name }}</h3>
              <span :class="['tile-badge', cp.isActive ? 'badge-active' : 'badge-inactive']">
                {{ cp.isActive ? t('common.labels.active') : t('common.labels.inactive') }}
              </span>
            </div>
            <div class="tile-content">
              <div class="tile-row" v-if="cp.email">
                <span class="tile-label">{{ t('common.labels.email') }}:</span>
                <span class="tile-value">{{ cp.email }}</span>
              </div>
              <div class="tile-row" v-if="cp.phone">
                <span class="tile-label">{{ t('common.labels.phone') }}:</span>
                <span class="tile-value">{{ cp.phone }}</span>
              </div>
              <div class="tile-row">
                <span class="tile-label">{{ t('common.labels.stable') }}:</span>
                <span class="tile-value">{{ getStableName(cp.stableId) }}</span>
              </div>
            </div>
            <div class="tile-actions">
              <router-link :to="`/admin/contact-persons/${cp.id}`" class="btn btn-secondary btn-sm">{{ t('common.buttons.edit') }}</router-link>
              <button class="btn btn-danger btn-sm" @click="handleDelete(cp.id)">{{ t('common.buttons.delete') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ConfirmDialog :show="confirm.show.value" :title="confirm.title.value" :message="confirm.message.value" :confirm-text="confirm.confirmText.value" :cancel-text="confirm.cancelText.value" @confirm="confirm.handleConfirm" @cancel="confirm.handleCancel" />
  </div>
</template>

<style scoped>
.contact-persons-list {
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
