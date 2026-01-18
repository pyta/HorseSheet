<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { activityScheduleEntryService } from '@/services/activity-schedule-entry.service';
import { stableService } from '@/services/stable.service';
import { activityService } from '@/services/activity.service';
import { instructorService } from '@/services/instructor.service';
import { useUIStore } from '@/stores/ui';
import { useConfirm } from '@/composables/useConfirm';
import type { ActivityScheduleEntry, Stable, Activity, Instructor } from '@/types';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';

const uiStore = useUIStore();
const confirm = useConfirm();
const entries = ref<ActivityScheduleEntry[]>([]);
const stables = ref<Stable[]>([]);
const activities = ref<Activity[]>([]);
const instructors = ref<Instructor[]>([]);
const loading = ref(false);

onMounted(async () => {
  await Promise.all([loadEntries(), loadStables(), loadActivities(), loadInstructors()]);
});

async function loadStables() {
  try {
    stables.value = await stableService.findAll();
  } catch {}
}

async function loadActivities() {
  try {
    activities.value = await activityService.findAll();
  } catch {}
}

async function loadInstructors() {
  try {
    instructors.value = await instructorService.findAll();
  } catch {}
}

async function loadEntries() {
  try {
    loading.value = true;
    const data = await activityScheduleEntryService.findAll();
    entries.value = Array.isArray(data) ? data.filter((e) => !e.deletedAt) : [];
  } catch (error: any) {
    uiStore.showError(error.message || 'Failed to load activity schedule entries');
    entries.value = [];
  } finally {
    loading.value = false;
  }
}

function getStableName(stableId: string): string {
  return stables.value.find((s) => s.id === stableId)?.name || stableId;
}

function getActivityName(activityId: string): string {
  return activities.value.find((a) => a.id === activityId)?.name || activityId;
}

function getInstructorName(instructorId: string): string {
  return instructors.value.find((i) => i.id === instructorId)?.name || instructorId;
}

async function handleDelete(id: string) {
  if (await confirm.confirm('Are you sure you want to delete this entry?', { title: 'Delete Entry', confirmText: 'Delete' })) {
    try {
      await activityScheduleEntryService.delete(id);
      uiStore.showSuccess('Entry deleted successfully');
      await loadEntries();
    } catch (error: any) {
      uiStore.showError(error.message || 'Failed to delete entry');
    }
  }
}
</script>

<template>
  <div class="activity-schedule-entries-list">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Activity Schedule Entries</h2>
        <router-link to="/admin/activity-schedule-entries/new" class="btn btn-primary">Create New</router-link>
      </div>
      <div v-if="loading" class="loading"><div class="spinner"></div></div>
      <div v-else class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Duration (min)</th>
              <th>Activity</th>
              <th>Instructor</th>
              <th>Stable</th>
              <th>Participants</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="entries.length === 0">
              <td colspan="8" style="text-align: center; padding: 2rem; color: #7f8c8d">No entries found.</td>
            </tr>
            <tr v-for="entry in entries" :key="entry.id">
              <td>{{ entry.date }}</td>
              <td>{{ entry.time }}</td>
              <td>{{ entry.duration }}</td>
              <td>{{ getActivityName(entry.activityId) }}</td>
              <td>{{ getInstructorName(entry.instructorId) }}</td>
              <td>{{ getStableName(entry.stableId) }}</td>
              <td>{{ entry.participantIds?.length || 0 }}</td>
              <td>
                <div class="table-actions">
                  <router-link :to="`/admin/activity-schedule-entries/${entry.id}`" class="btn btn-secondary">Edit</router-link>
                  <button class="btn btn-danger" @click="handleDelete(entry.id)">Delete</button>
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
.activity-schedule-entries-list {
  max-width: 1400px;
}
</style>
