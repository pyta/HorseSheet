<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventInput } from '@fullcalendar/core';

import { activityScheduleEntryService } from '@/services/activity-schedule-entry.service';
import { serviceScheduleEntryService } from '@/services/service-schedule-entry.service';
import { instructorService } from '@/services/instructor.service';
import { activityService } from '@/services/activity.service';
import { serviceService } from '@/services/service.service';
import type {
  ActivityScheduleEntry,
  ServiceScheduleEntry,
  Instructor,
  Activity,
  Service,
} from '@/types';
import { useUIStore } from '@/stores/ui';

const uiStore = useUIStore();

// Define plugins array - must be defined after imports
const plugins = [dayGridPlugin, timeGridPlugin, interactionPlugin];

// Visibility controls
const showServices = ref(true);
const showActivities = ref(true);

// Data
const activityEntries = ref<ActivityScheduleEntry[]>([]);
const serviceEntries = ref<ServiceScheduleEntry[]>([]);
const instructors = ref<Instructor[]>([]);
const activities = ref<Activity[]>([]);
const services = ref<Service[]>([]);
const loading = ref(false);

// Calendar events
const calendarEvents = computed<EventInput[]>(() => {
  const events: EventInput[] = [];

  // Add activity events
  if (showActivities.value) {
    activityEntries.value.forEach((entry) => {
      if (!entry.isActive) return;

      const activity = activities.value.find((a) => a.id === entry.activityId);
      const instructor = instructors.value.find((i) => i.id === entry.instructorId);

      // Parse date and time
      const dateStr = entry.date;
      const timeStr = entry.time;
      const timeParts = timeStr.split(':');
      const hours = timeParts[0] ? Number(timeParts[0]) : 0;
      const minutes = timeParts[1] ? Number(timeParts[1]) : 0;
      const startDate = new Date(dateStr);
      startDate.setHours(hours, minutes, 0, 0);

      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + entry.duration);

      events.push({
        id: `activity-${entry.id}`,
        title: activity?.name || 'Activity',
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        extendedProps: {
          type: 'activity',
          entry,
          activity,
          instructor,
        },
        classNames: ['activity-event'],
      });
    });
  }

  // Add service events
  if (showServices.value) {
    serviceEntries.value.forEach((entry) => {
      if (!entry.isActive) return;

      const service = services.value.find((s) => s.id === entry.serviceId);

      // Parse duration (e.g., "day", "month", "week")
      const startDate = new Date(entry.date);
      startDate.setHours(0, 0, 0, 0);

      let endDate = new Date(startDate);
      switch (entry.duration.toLowerCase()) {
        case 'day':
          endDate.setDate(endDate.getDate() + 1);
          break;
        case 'week':
          endDate.setDate(endDate.getDate() + 7);
          break;
        case 'month':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        default:
          // Try to parse as number of days
          const days = parseInt(entry.duration, 10);
          if (!isNaN(days)) {
            endDate.setDate(endDate.getDate() + days);
          } else {
            endDate.setDate(endDate.getDate() + 1);
          }
      }

      events.push({
        id: `service-${entry.id}`,
        title: service?.name || 'Service',
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        allDay: true,
        extendedProps: {
          type: 'service',
          entry,
          service,
        },
        classNames: ['service-event'],
      });
    });
  }

  return events;
});

// Helper function to get instructor initials
function getInstructorInitials(instructor?: Instructor): string {
  if (!instructor || !instructor.name) return '?';
  const parts = instructor.name.trim().split(/\s+/).filter((p) => p.length > 0);
  if (parts.length >= 2) {
    const firstPart = parts[0];
    const lastPart = parts[parts.length - 1];
    if (firstPart && lastPart && firstPart[0] && lastPart[0]) {
      return (firstPart[0] + lastPart[0]).toUpperCase();
    }
  }
  if (parts.length > 0 && parts[0] && parts[0].length >= 2) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return '?';
}

// Event content renderer - returns DOM element
function renderEventContent(eventInfo: any) {
  const extendedProps = eventInfo.event.extendedProps || {};
  const { type, entry, activity, instructor, service } = extendedProps;

  const wrapper = document.createElement('div');
  wrapper.style.width = '100%';
  wrapper.style.height = '100%';

  if (type === 'activity') {
    const participantCount = entry.participantIds?.length || 0;
    const initials = getInstructorInitials(instructor);

    wrapper.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background-color: #f3e5f5; border-left: 3px solid #9c27b0; border-radius: 4px; font-size: 0.875rem;">
        <div style="width: 24px; height: 24px; border-radius: 50%; background-color: #9c27b0; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; flex-shrink: 0;">
          ${initials}
        </div>
        <span style="font-weight: 500; color: #7b1fa2;">${participantCount}</span>
      </div>
    `;
  } else if (type === 'service') {
    const serviceName = service?.name || 'Service';
    wrapper.innerHTML = `
      <div style="padding: 0.5rem; background-color: #e3f2fd; border-left: 3px solid #2196f3; border-radius: 4px; font-size: 0.875rem; font-weight: 500; color: #1976d2; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
        ${serviceName}
      </div>
    `;
  } else {
    wrapper.textContent = eventInfo.event.title;
  }

  return { domNodes: [wrapper] };
}

async function loadData() {
  try {
    loading.value = true;
    const [activityEntriesData, serviceEntriesData, instructorsData, activitiesData, servicesData] =
      await Promise.all([
        activityScheduleEntryService.findAll(),
        serviceScheduleEntryService.findAll(),
        instructorService.findAll(),
        activityService.findAll(),
        serviceService.findAll(),
      ]);

    activityEntries.value = activityEntriesData.filter((e) => !e.deletedAt);
    serviceEntries.value = serviceEntriesData.filter((e) => !e.deletedAt);
    instructors.value = instructorsData;
    activities.value = activitiesData;
    services.value = servicesData;
  } catch (error: any) {
    uiStore.showError(error.message || 'Failed to load schedule data');
  } finally {
    loading.value = false;
  }
}

// Calendar options
const calendarOptions = computed(() => ({
  plugins: plugins,
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
  events: calendarEvents.value,
  eventContent: renderEventContent,
  height: 'auto',
  editable: false,
  selectable: false,
}));

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="schedule-calendar">
    <div class="calendar-toolbox">
      <h2>Schedule Preview</h2>
      <div class="visibility-controls">
        <label class="checkbox-label">
          <input type="checkbox" v-model="showServices" />
          <span>Show Services</span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" v-model="showActivities" />
          <span>Show Activities</span>
        </label>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
    </div>

    <div v-else class="calendar-container">
      <FullCalendar :options="calendarOptions" />
    </div>
  </div>
</template>

<style scoped>
.schedule-calendar {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.calendar-toolbox {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.calendar-toolbox h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
}

.visibility-controls {
  display: flex;
  gap: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.checkbox-label input[type='checkbox'] {
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.checkbox-label span {
  font-size: 0.95rem;
  color: #2c3e50;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.calendar-container {
  min-height: 600px;
}

/* FullCalendar custom styles */
:deep(.fc-event) {
  border: none;
  padding: 0;
  margin: 2px 0;
}

:deep(.fc-event .fc-event-main) {
  padding: 0;
}

:deep(.activity-event) {
  background-color: transparent;
}

:deep(.service-event) {
  background-color: transparent;
}

:deep(.fc-daygrid-event) {
  margin: 2px 0;
}

:deep(.fc-timegrid-event) {
  margin: 1px 0;
}
</style>
