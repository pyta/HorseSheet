<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { individualActivityPriceListService } from '@/services/individual-activity-price-list.service';
import { stableService } from '@/services/stable.service';
import { activityService } from '@/services/activity.service';
import { participantService } from '@/services/participant.service';
import { useUIStore } from '@/stores/ui';
import { useConfirm } from '@/composables/useConfirm';
import type { IndividualActivityPriceList, Stable, Activity, Participant } from '@/types';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';

const uiStore = useUIStore();
const confirm = useConfirm();
const { t } = useI18n();
const priceLists = ref<IndividualActivityPriceList[]>([]);
const stables = ref<Stable[]>([]);
const activities = ref<Activity[]>([]);
const participants = ref<Participant[]>([]);
const loading = ref(false);

onMounted(async () => {
  await Promise.all([loadPriceLists(), loadStables(), loadActivities(), loadParticipants()]);
});

async function loadStables() {
  try {
    const data = await stableService.findAll();
    stables.value = Array.isArray(data) ? data : [];
  } catch {
    stables.value = [];
  }
}

async function loadActivities() {
  try {
    const data = await activityService.findAll();
    activities.value = Array.isArray(data) ? data : [];
  } catch {
    activities.value = [];
  }
}

async function loadParticipants() {
  try {
    const data = await participantService.findAll();
    participants.value = Array.isArray(data) ? data : [];
  } catch {
    participants.value = [];
  }
}

async function loadPriceLists() {
  try {
    loading.value = true;
    const data = await individualActivityPriceListService.findAll();
    priceLists.value = Array.isArray(data) ? data.filter((p) => !p.deletedAt) : [];
  } catch (error: any) {
    uiStore.showError(error.message || t('priceLists.individualActivity.loadError'));
    priceLists.value = [];
  } finally {
    loading.value = false;
  }
}

function getStableName(stableId: string): string {
  if (!Array.isArray(stables.value)) return stableId;
  return stables.value.find((s) => s.id === stableId)?.name || stableId;
}

function getActivityName(activityId: string | null | undefined): string {
  if (!activityId) return '-';
  if (!Array.isArray(activities.value)) return activityId;
  return activities.value.find((a) => a.id === activityId)?.name || activityId;
}

function getParticipantName(participantId: string): string {
  if (!Array.isArray(participants.value)) return participantId;
  return participants.value.find((p) => p.id === participantId)?.name || participantId;
}

function formatPrice(price: number | string | null | undefined): string {
  if (price === null || price === undefined) return '0.00';
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return '0.00';
  return numPrice.toFixed(2);
}

async function handleDelete(id: string) {
  if (await confirm.confirm(t('common.messages.confirmDelete'), { title: t('priceLists.individualActivity.title'), confirmText: t('common.buttons.delete') })) {
    try {
      await individualActivityPriceListService.delete(id);
      uiStore.showSuccess(t('priceLists.individualActivity.deleted'));
      await loadPriceLists();
    } catch (error: any) {
      uiStore.showError(error.message || t('common.messages.deleteError'));
    }
  }
}
</script>

<template>
  <div class="individual-activity-price-lists-list">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">{{ t('priceLists.individualActivity.list.title') }}</h2>
        <router-link to="/admin/individual-activity-price-lists/new" class="btn btn-primary">{{ t('priceLists.individualActivity.list.createNew') }}</router-link>
      </div>
      <div v-if="loading" class="loading"><div class="spinner"></div></div>
      <div v-else>
        <!-- Desktop Table View -->
        <div class="table-container desktop-view">
          <table class="table">
            <thead>
              <tr>
                <th>{{ t('common.labels.participant') }}</th>
                <th>{{ t('common.labels.activity') }}</th>
                <th>{{ t('common.labels.price') }}</th>
                <th>{{ t('common.labels.currency') }}</th>
                <th>{{ t('common.labels.stable') }}</th>
                <th>{{ t('common.labels.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="priceLists.length === 0">
                <td colspan="6" style="text-align: center; padding: 2rem; color: #7f8c8d">{{ t('common.labels.noPriceListsFound') }}</td>
              </tr>
              <tr v-for="pl in priceLists" :key="pl.id">
                <td>{{ getParticipantName(pl.participantId) }}</td>
                <td>{{ getActivityName(pl.activityId) }}</td>
                <td>{{ formatPrice(pl.price) }}</td>
                <td>{{ pl.currency }}</td>
                <td>{{ getStableName(pl.stableId) }}</td>
                <td>
                  <div class="table-actions">
                    <router-link :to="`/admin/individual-activity-price-lists/${pl.id}`" class="btn btn-secondary">{{ t('common.buttons.edit') }}</router-link>
                    <button class="btn btn-danger" @click="handleDelete(pl.id)">{{ t('common.buttons.delete') }}</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Tile View -->
        <div v-if="priceLists.length === 0" class="mobile-view empty-state">
          <p>{{ t('common.labels.noPriceListsFound') }}</p>
        </div>
        <div v-else class="mobile-view mobile-tiles">
          <div v-for="pl in priceLists" :key="pl.id" class="data-tile">
            <div class="tile-header">
              <h3 class="tile-title">{{ getParticipantName(pl.participantId) }}</h3>
              <span class="tile-price">{{ formatPrice(pl.price) }} {{ pl.currency }}</span>
            </div>
            <div class="tile-content">
              <div class="tile-row">
                <span class="tile-label">{{ t('common.labels.activity') }}:</span>
                <span class="tile-value">{{ getActivityName(pl.activityId) }}</span>
              </div>
              <div class="tile-row">
                <span class="tile-label">{{ t('common.labels.stable') }}:</span>
                <span class="tile-value">{{ getStableName(pl.stableId) }}</span>
              </div>
            </div>
            <div class="tile-actions">
              <router-link :to="`/admin/individual-activity-price-lists/${pl.id}`" class="btn btn-secondary btn-sm">{{ t('common.buttons.edit') }}</router-link>
              <button class="btn btn-danger btn-sm" @click="handleDelete(pl.id)">{{ t('common.buttons.delete') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ConfirmDialog :show="confirm.show.value" :title="confirm.title.value" :message="confirm.message.value" :confirm-text="confirm.confirmText.value" :cancel-text="confirm.cancelText.value" @confirm="confirm.handleConfirm" @cancel="confirm.handleCancel" />
  </div>
</template>

<style scoped>
.individual-activity-price-lists-list {
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
    flex: 1;
  }

  .tile-price {
    font-size: 1.25rem;
    font-weight: 700;
    color: #27ae60;
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
</style>
