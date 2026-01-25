<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { userService } from '@/services/user.service';
import { roleService } from '@/services/role.service';
import { useUIStore } from '@/stores/ui';
import type { User, CreateUserDto, UpdateUserDto, Role } from '@/types';

const router = useRouter();
const route = useRoute();
const uiStore = useUIStore();

const isEdit = computed(() => !!route.params.id);
const loading = ref(false);
const submitting = ref(false);
const roles = ref<Role[]>([]);

const form = ref<CreateUserDto>({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  isActive: true,
  roleIds: [],
});

const version = ref<number | undefined>(undefined);
const errors = ref<Record<string, string>>({});

onMounted(async () => {
  await loadRoles();
  if (isEdit.value) {
    await loadUser();
  }
});

async function loadRoles() {
  try {
    const data = await roleService.findAll();
    roles.value = Array.isArray(data) ? data : [];
  } catch (error: any) {
    uiStore.showError(error.message || 'Failed to load roles');
    roles.value = [];
  }
}

async function loadUser() {
  try {
    loading.value = true;
    const user = await userService.findOne(route.params.id as string);
    form.value = {
      email: user.email,
      password: '', // Don't load password
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      isActive: user.isActive ?? true,
      roleIds: user.roles?.map((r) => r.id) || [],
    };
    version.value = user.version;
  } catch (error: any) {
    uiStore.showError(error.message || 'Failed to load user');
    router.push('/admin/users');
  } finally {
    loading.value = false;
  }
}

function validate(): boolean {
  errors.value = {};

  if (!form.value.email || form.value.email.trim() === '') {
    errors.value.email = 'Email is required';
    return false;
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.value.email)) {
    errors.value.email = 'Please enter a valid email address';
    return false;
  }

  // Password is required only for new users
  if (!isEdit.value && (!form.value.password || form.value.password.trim() === '')) {
    errors.value.password = 'Password is required';
    return false;
  }

  // Password strength validation (min 8 characters)
  if (form.value.password && form.value.password.length < 8) {
    errors.value.password = 'Password must be at least 8 characters long';
    return false;
  }

  return true;
}

async function handleSubmit() {
  if (!validate()) {
    return;
  }

  try {
    submitting.value = true;
    errors.value = {};

    if (isEdit.value) {
      const updateData: UpdateUserDto = {
        email: form.value.email,
        firstName: form.value.firstName || null,
        lastName: form.value.lastName || null,
        isActive: form.value.isActive,
        roleIds: form.value.roleIds,
        version: version.value,
      };
      // Only include password if it was provided
      if (form.value.password && form.value.password.trim() !== '') {
        updateData.password = form.value.password;
      }
      await userService.update(route.params.id as string, updateData);
      uiStore.showSuccess('User updated successfully');
    } else {
      await userService.create(form.value);
      uiStore.showSuccess('User created successfully');
    }

    router.push('/admin/users');
  } catch (error: any) {
    if (error.status === 409) {
      // Conflict - version mismatch
      uiStore.showError(
        'This user has been modified by another user. Please refresh and try again.'
      );
      if (isEdit.value) {
        await loadUser();
      }
    } else if (error.errors) {
      // Validation errors
      errors.value = error.errors;
    } else {
      uiStore.showError(error.message || 'Failed to save user');
    }
  } finally {
    submitting.value = false;
  }
}

function toggleRole(roleId: string) {
  if (!form.value.roleIds) {
    form.value.roleIds = [];
  }
  const index = form.value.roleIds.indexOf(roleId);
  if (index > -1) {
    form.value.roleIds.splice(index, 1);
  } else {
    form.value.roleIds.push(roleId);
  }
}

function isRoleSelected(roleId: string): boolean {
  return form.value.roleIds?.includes(roleId) || false;
}
</script>

<template>
  <div class="user-form">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">{{ isEdit ? 'Edit User' : 'Create New User' }}</h2>
        <router-link to="/admin/users" class="btn btn-secondary">Back to List</router-link>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
      </div>

      <form v-else @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label required" for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input"
            :class="{ 'has-error': errors.email }"
            placeholder="Enter email address"
          />
          <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label class="form-label" :for="isEdit ? 'password' : 'password-required'">
            Password
            <span v-if="!isEdit" class="required-indicator">*</span>
            <span v-else class="form-hint">(leave blank to keep current password)</span>
          </label>
          <input
            :id="isEdit ? 'password' : 'password-required'"
            v-model="form.password"
            type="password"
            class="form-input"
            :class="{ 'has-error': errors.password }"
            :placeholder="isEdit ? 'Enter new password (optional)' : 'Enter password'"
          />
          <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
        </div>

        <div class="form-group">
          <label class="form-label" for="firstName">First Name</label>
          <input
            id="firstName"
            v-model="form.firstName"
            type="text"
            class="form-input"
            placeholder="Enter first name"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="lastName">Last Name</label>
          <input
            id="lastName"
            v-model="form.lastName"
            type="text"
            class="form-input"
            placeholder="Enter last name"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="isActive">
            <input
              id="isActive"
              v-model="form.isActive"
              type="checkbox"
              style="margin-right: 0.5rem"
            />
            Active
          </label>
        </div>

        <div class="form-group">
          <label class="form-label">Roles</label>
          <div class="roles-list">
            <label
              v-for="role in roles"
              :key="role.id"
              class="role-checkbox"
              :class="{ selected: isRoleSelected(role.id) }"
            >
              <input
                type="checkbox"
                :checked="isRoleSelected(role.id)"
                @change="toggleRole(role.id)"
              />
              <div class="role-info">
                <span class="role-name">{{ role.name }}</span>
                <span v-if="role.description" class="role-description">{{ role.description }}</span>
              </div>
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? 'Saving...' : isEdit ? 'Update' : 'Create' }}
          </button>
          <router-link to="/admin/users" class="btn btn-secondary">Cancel</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.user-form {
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

.required-indicator {
  color: #e74c3c;
  margin-left: 0.25rem;
}

.form-hint {
  font-size: 0.875rem;
  color: #7f8c8d;
  font-weight: normal;
  margin-left: 0.5rem;
}

.roles-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.role-checkbox {
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #fff;
}

.role-checkbox:hover {
  border-color: #3498db;
  background-color: #f8f9fa;
}

.role-checkbox.selected {
  border-color: #3498db;
  background-color: #ebf5fb;
}

.role-checkbox input[type='checkbox'] {
  margin-right: 0.75rem;
  margin-top: 0.25rem;
  cursor: pointer;
}

.role-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.role-name {
  font-weight: 600;
  color: #2c3e50;
}

.role-description {
  font-size: 0.875rem;
  color: #7f8c8d;
}
</style>

