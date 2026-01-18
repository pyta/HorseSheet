<script setup lang="ts">
import { ref, onMounted } from 'vue';
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
    uiStore.showError(error.message || 'Failed to load individual activity price lists');
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
  if (await confirm.confirm('Are you sure you want to delete this price list?', { title: 'Delete Price List', confirmText: 'Delete' })) {
    try {
      await individualActivityPriceListService.delete(id);
      uiStore.showSuccess('Price list deleted successfully');
      await loadPriceLists();
    } catch (error: any) {
      uiStore.showError(error.message || 'Failed to delete price list');
    }
  }
}
</script>

<template>
  <div class="individual-activity-price-lists-list">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Individual Activity Price Lists</h2>
        <router-link to="/admin/individual-activity-price-lists/new" class="btn btn-primary">Create New</router-link>
      </div>
      <div v-if="loading" class="loading"><div class="spinner"></div></div>
      <div v-else class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Participant</th>
              <th>Activity</th>
              <th>Price</th>
              <th>Currency</th>
              <th>Stable</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="priceLists.length === 0">
              <td colspan="6" style="text-align: center; padding: 2rem; color: #7f8c8d">No price lists found.</td>
            </tr>
            <tr v-for="pl in priceLists" :key="pl.id">
              <td>{{ getParticipantName(pl.participantId) }}</td>
              <td>{{ getActivityName(pl.activityId) }}</td>
              <td>{{ formatPrice(pl.price) }}</td>
              <td>{{ pl.currency }}</td>
              <td>{{ getStableName(pl.stableId) }}</td>
              <td>
                <div class="table-actions">
                  <router-link :to="`/admin/individual-activity-price-lists/${pl.id}`" class="btn btn-secondary">Edit</router-link>
                  <button class="btn btn-danger" @click="handleDelete(pl.id)">Delete</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <ConfirmDialog :show="confirm.show.value" :title="confirm.title.value" :message="confirm.message.value" :confirm-text="confirm.confirmText.value" :cancel-text="confirm.cancelText.value" @confirm="confirm.handleConfirm" @cancel="confirm.handleCancel" />
  </div>
</template>

<style scoped>
.individual-activity-price-lists-list {
  max-width: 1400px;
}
</style>
