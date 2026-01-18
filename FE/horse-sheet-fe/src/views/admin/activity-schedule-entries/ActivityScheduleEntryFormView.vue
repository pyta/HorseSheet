<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { activityScheduleEntryService } from '@/services/activity-schedule-entry.service';
import { stableService } from '@/services/stable.service';
import { activityService } from '@/services/activity.service';
import { instructorService } from '@/services/instructor.service';
import { participantService } from '@/services/participant.service';
import { useUIStore } from '@/stores/ui';
import type { CreateActivityScheduleEntryDto, UpdateActivityScheduleEntryDto, Stable, Activity, Instructor, Participant } from '@/types';

const router = useRouter();
const route = useRoute();
const uiStore = useUIStore();
const isEdit = computed(() => !!route.params.id);
const loading = ref(false);
const submitting = ref(false);
const stables = ref<Stable[]>([]);
const activities = ref<Activity[]>([]);
const instructors = ref<Instructor[]>([]);
const participants = ref<Participant[]>([]);
const form = ref<CreateActivityScheduleEntryDto>({ stableId: '', date: '', time: '', duration: 60, instructorId: '', activityId: '', participantIds: [], isActive: true });
const version = ref<number | undefined>(undefined);
const errors = ref<Record<string, string>>({});

onMounted(async () => {
  await Promise.all([loadStables(), loadActivities(), loadInstructors(), loadParticipants()]);
  if (isEdit.value) await loadEntry();
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

async function loadInstructors() {
  try {
    instructors.value = (await instructorService.findAll()).filter((i) => !i.deletedAt);
  } catch {}
}

async function loadParticipants() {
  try {
    participants.value = (await participantService.findAll()).filter((p) => !p.deletedAt);
  } catch {}
}

const filteredActivities = computed(() => {
  if (!form.value.stableId) return [];
  return activities.value.filter((a) => a.stableId === form.value.stableId);
});

const filteredInstructors = computed(() => {
  if (!form.value.stableId) return [];
  return instructors.value.filter((i) => i.stableId === form.value.stableId);
});

const filteredParticipants = computed(() => {
  if (!form.value.stableId) return [];
  return participants.value.filter((p) => p.stableId === form.value.stableId);
});

async function loadEntry() {
  try {
    loading.value = true;
    const entry = await activityScheduleEntryService.findOne(route.params.id as string);
    form.value = {
      stableId: entry.stableId,
      date: entry.date,
      time: entry.time,
      duration: entry.duration,
      instructorId: entry.instructorId,
      activityId: entry.activityId,
      participantIds: entry.participantIds || [],
      isActive: entry.isActive ?? true,
    };
    version.value = entry.version;
  } catch (error: any) {
    uiStore.showError(error.message || 'Failed to load entry');
    router.push('/admin/activity-schedule-entries');
  } finally {
    loading.value = false;
  }
}

function validate(): boolean {
  errors.value = {};
  if (!form.value.stableId) {
    errors.value.stableId = 'Stable is required';
    return false;
  }
  if (!form.value.date) {
    errors.value.date = 'Date is required';
    return false;
  }
  if (!form.value.time) {
    errors.value.time = 'Time is required';
    return false;
  }
  if (!form.value.duration || form.value.duration <= 0) {
    errors.value.duration = 'Duration must be greater than 0';
    return false;
  }
  if (!form.value.instructorId) {
    errors.value.instructorId = 'Instructor is required';
    return false;
  }
  if (!form.value.activityId) {
    errors.value.activityId = 'Activity is required';
    return false;
  }
  if (!form.value.participantIds || form.value.participantIds.length === 0) {
    errors.value.participantIds = 'At least one participant is required';
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
      await activityScheduleEntryService.update(route.params.id as string, { ...form.value, version: version.value });
      uiStore.showSuccess('Entry updated successfully');
    } else {
      await activityScheduleEntryService.create(form.value);
      uiStore.showSuccess('Entry created successfully');
    }
    router.push('/admin/activity-schedule-entries');
  } catch (error: any) {
    if (error.status === 409) {
      uiStore.showError('This entry has been modified by another user. Please refresh and try again.');
      if (isEdit.value) await loadEntry();
    } else if (error.errors) {
      errors.value = error.errors;
    } else {
      uiStore.showError(error.message || 'Failed to save entry');
    }
  } finally {
    submitting.value = false;
  }
}

function toggleParticipant(id: string) {
  const index = form.value.participantIds.indexOf(id);
  if (index > -1) {
    form.value.participantIds.splice(index, 1);
  } else {
    form.value.participantIds.push(id);
  }
}
</script>

<template>
  <div class="activity-schedule-entry-form">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">{{ isEdit ? 'Edit Activity Schedule Entry' : 'Create New Activity Schedule Entry' }}</h2>
        <router-link to="/admin/activity-schedule-entries" class="btn btn-secondary">Back to List</router-link>
      </div>
      <div v-if="loading" class="loading"><div class="spinner"></div></div>
      <form v-else @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label required" for="stableId">Stable</label>
          <select id="stableId" v-model="form.stableId" class="form-select" :class="{ 'has-error': errors.stableId }" @change="form.activityId = ''; form.instructorId = ''; form.participantIds = []">
            <option value="">Select a stable</option>
            <option v-for="stable in stables" :key="stable.id" :value="stable.id">{{ stable.name }}</option>
          </select>
          <span v-if="errors.stableId" class="form-error">{{ errors.stableId }}</span>
        </div>
        <div class="form-group">
          <label class="form-label required" for="date">Date</label>
          <input id="date" v-model="form.date" type="date" class="form-input" :class="{ 'has-error': errors.date }" />
          <span v-if="errors.date" class="form-error">{{ errors.date }}</span>
        </div>
        <div class="form-group">
          <label class="form-label required" for="time">Time</label>
          <input id="time" v-model="form.time" type="time" class="form-input" :class="{ 'has-error': errors.time }" />
          <span v-if="errors.time" class="form-error">{{ errors.time }}</span>
        </div>
        <div class="form-group">
          <label class="form-label required" for="duration">Duration (minutes)</label>
          <input id="duration" v-model.number="form.duration" type="number" min="1" class="form-input" :class="{ 'has-error': errors.duration }" />
          <span v-if="errors.duration" class="form-error">{{ errors.duration }}</span>
        </div>
        <div class="form-group">
          <label class="form-label required" for="instructorId">Instructor</label>
          <select id="instructorId" v-model="form.instructorId" class="form-select" :class="{ 'has-error': errors.instructorId }" :disabled="!form.stableId">
            <option value="">Select an instructor</option>
            <option v-for="instructor in filteredInstructors" :key="instructor.id" :value="instructor.id">{{ instructor.name }}</option>
          </select>
          <span v-if="errors.instructorId" class="form-error">{{ errors.instructorId }}</span>
        </div>
        <div class="form-group">
          <label class="form-label required" for="activityId">Activity</label>
          <select id="activityId" v-model="form.activityId" class="form-select" :class="{ 'has-error': errors.activityId }" :disabled="!form.stableId">
            <option value="">Select an activity</option>
            <option v-for="activity in filteredActivities" :key="activity.id" :value="activity.id">{{ activity.name }}</option>
          </select>
          <span v-if="errors.activityId" class="form-error">{{ errors.activityId }}</span>
        </div>
        <div class="form-group">
          <label class="form-label required">Participants</label>
          <div class="participants-list" :class="{ 'has-error': errors.participantIds }">
            <label v-for="p in filteredParticipants" :key="p.id" class="checkbox-label">
              <input type="checkbox" :checked="form.participantIds.includes(p.id)" @change="toggleParticipant(p.id)" />
              {{ p.name }}
            </label>
          </div>
          <span v-if="errors.participantIds" class="form-error">{{ errors.participantIds }}</span>
        </div>
        <div class="form-group">
          <label class="form-label" for="isActive">
            <input id="isActive" v-model="form.isActive" type="checkbox" style="margin-right: 0.5rem" />
            Active
          </label>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="submitting">{{ submitting ? 'Saving...' : isEdit ? 'Update' : 'Create' }}</button>
          <router-link to="/admin/activity-schedule-entries" class="btn btn-secondary">Cancel</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.activity-schedule-entry-form {
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
.participants-list {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  max-height: 200px;
  overflow-y: auto;
}
.checkbox-label {
  display: block;
  padding: 0.5rem;
  cursor: pointer;
}
.checkbox-label:hover {
  background-color: #f8f9fa;
}
</style>
