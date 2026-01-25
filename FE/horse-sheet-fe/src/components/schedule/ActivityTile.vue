<script setup lang="ts">
import type { ActivityScheduleEntry, Instructor } from '@/types';

const props = defineProps<{
  activity: ActivityScheduleEntry;
  instructor?: Instructor;
}>();

function getInstructorInitials(instructor?: Instructor): string {
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

const participantCount = props.activity.participantIds?.length || 0;
const initials = getInstructorInitials(props.instructor);
</script>

<template>
  <div class="activity-tile">
    <div class="activity-header">
      <div class="instructor-avatar">{{ initials }}</div>
      <span class="participant-count">{{ participantCount }}</span>
    </div>
  </div>
</template>

<style scoped>
.activity-tile {
  padding: 0.5rem;
  background-color: #f3e5f5;
  border-left: 3px solid #9c27b0;
  border-radius: 4px;
  font-size: 0.875rem;
}

.activity-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.instructor-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #9c27b0;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  flex-shrink: 0;
}

.participant-count {
  font-weight: 500;
  color: #7b1fa2;
}
</style>
