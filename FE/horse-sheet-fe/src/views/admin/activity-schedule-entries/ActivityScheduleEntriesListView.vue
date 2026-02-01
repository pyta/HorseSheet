<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
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
const { t } = useI18n();
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
    uiStore.showError(error.message || t('schedule.entry.loadError'));
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

function getInstructor(instructorId: string): Instructor | undefined {
  return instructors.value.find((i) => i.id === instructorId);
}

function getInstructorInitials(instructorId: string): string {
  const instructor = getInstructor(instructorId);
  if (!instructor || !instructor.name) return '?';
  const parts = instructor.name.trim().split(/\s+/);
  if (parts.length >= 2) {
    const first = parts[0]?.[0];
    const last = parts[parts.length - 1]?.[0];
    if (first && last) {
      return (first + last).toUpperCase();
    }
  }
  return instructor.name.substring(0, 2).toUpperCase();
}

function calculateTimeTo(timeFrom: string, durationMinutes: number): string {
  try {
    const parts = timeFrom.split(':').map(Number);
    const hours = parts[0];
    const minutes = parts[1];
    if (hours === undefined || minutes === undefined) return '';
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  } catch {
    return '';
  }
}

const entriesByDate = computed(() => {
  const grouped: Record<string, ActivityScheduleEntry[]> = {};
  entries.value.forEach((entry) => {
    if (!grouped[entry.date]) {
      grouped[entry.date] = [];
    }
    const entriesForDate = grouped[entry.date];
    if (entriesForDate) {
      entriesForDate.push(entry);
    }
  });
  // Sort entries within each date by time
  Object.keys(grouped).forEach((date) => {
    const entriesForDate = grouped[date];
    if (entriesForDate) {
      entriesForDate.sort((a, b) => a.time.localeCompare(b.time));
    }
  });
  // Sort dates (newest first)
  return Object.keys(grouped)
    .sort((a, b) => b.localeCompare(a))
    .map((date) => ({ date, entries: grouped[date] || [] }));
});

async function handleDelete(id: string) {
  if (await confirm.confirm(t('schedule.entry.deleteConfirm'), { title: t('schedule.entry.deleteTitle'), confirmText: t('common.buttons.delete') })) {
    try {
      await activityScheduleEntryService.delete(id);
      uiStore.showSuccess(t('schedule.entry.deleted'));
      await loadEntries();
    } catch (error: any) {
      uiStore.showError(error.message || t('common.messages.deleteError'));
    }
  }
}
</script>

<template>
  <div class="activity-schedule-entries-list">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">{{ t('schedule.entries.title') }}</h2>
        <router-link to="/admin/activity-schedule-entries/new" class="btn btn-primary add-button">
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
                <th>{{ t('common.labels.date') }}</th>
                <th>{{ t('common.labels.time') }}</th>
                <th>{{ t('common.labels.durationMinutes') }}</th>
                <th>{{ t('common.labels.activity') }}</th>
                <th>{{ t('common.labels.instructor') }}</th>
                <th>{{ t('common.labels.stable') }}</th>
                <th>{{ t('common.labels.participants') }}</th>
                <th>{{ t('common.labels.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="entries.length === 0">
                <td colspan="8" style="text-align: center; padding: 2rem; color: #7f8c8d">{{ t('common.labels.noEntriesFound') }}</td>
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
                    <router-link :to="`/admin/activity-schedule-entries/${entry.id}`" class="btn btn-secondary">{{ t('common.buttons.edit') }}</router-link>
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
          <div v-for="group in entriesByDate" :key="group.date" class="date-group">
            <h3 class="date-header">{{ group.date }}</h3>
            <div class="tiles-container">
              <div v-for="entry in group.entries" :key="entry.id" class="activity-tile">
                <div class="tile-main">
                  <div class="time-range">
                    <span class="time-from">{{ entry.time }}</span>
                    <span class="time-separator">-</span>
                    <span class="time-to">{{ calculateTimeTo(entry.time, entry.duration) }}</span>
                  </div>
                  <div class="tile-meta">
                    <div class="instructor-avatar">{{ getInstructorInitials(entry.instructorId) }}</div>
                    <span class="participant-count">{{ entry.participantIds?.length || 0 }}</span>
                  </div>
                </div>
                <div class="tile-actions">
                  <router-link :to="`/admin/activity-schedule-entries/${entry.id}`" class="btn btn-secondary btn-sm">{{ t('common.buttons.edit') }}</router-link>
                  <button class="btn btn-danger btn-sm" @click="handleDelete(entry.id)">{{ t('common.buttons.delete') }}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ConfirmDialog :show="confirm.show.value" :title="confirm.title.value" :message="confirm.message.value" :confirm-text="confirm.confirmText.value" :cancel-text="confirm.cancelText.value" @confirm="confirm.handleConfirm" @cancel="confirm.handleCancel" />
  </div>
</template>

<style scoped>
.activity-schedule-entries-list {
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
    padding: 0;
  }

  .date-group {
    margin-bottom: 2rem;
  }

  .date-header {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #e0e0e0;
  }

  .tiles-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .activity-tile {
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .tile-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .time-range {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.125rem;
    font-weight: 600;
    color: #2c3e50;
  }

  .time-from,
  .time-to {
    font-weight: 700;
  }

  .time-separator {
    color: #7f8c8d;
    font-weight: 400;
  }

  .tile-meta {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .instructor-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #9c27b0;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 600;
    flex-shrink: 0;
  }

  .participant-count {
    font-weight: 500;
    color: #7b1fa2;
    font-size: 0.875rem;
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
