<script setup lang="ts">
import type { Service } from '@/types';

defineProps<{
  service: Service;
}>();
</script>

<template>
  <div class="service-tile">
    <span class="service-name">{{ service.name }}</span>
  </div>
</template>

<style scoped>
.service-tile {
  padding: 0.5rem;
  background-color: #e3f2fd;
  border-left: 3px solid #2196f3;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1976d2;
}

.service-name {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
