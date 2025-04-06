<template>
  <div class="event-form">
    <div class="form-container">
      <h2 class="form-title">
        {{ id ? (isEditing ? 'Edit Event' : 'Event Details') : 'New Event' }}
      </h2>
      <form v-if="isEditing || !id" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>Title *</label>
          <input
            v-model="formData.title"
            type="text"
            required
            class="form-input"
            :readonly="!isEditing && !!id"
          >
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea
            v-model="formData.description"
            class="form-input"
            rows="3"
            :readonly="!isEditing && !!id"
          ></textarea>
        </div>

        <div class="datetime-group">
          <div class="form-group">
            <label>Start Date & Time *</label>
            <input
              type="datetime-local"
              v-model="formData.start"
              required
              class="form-input"
              :readonly="!isEditing && !!id"
            >
          </div>

          <div class="form-group">
            <label>End Date & Time *</label>
            <input
              type="datetime-local"
              v-model="formData.end"
              required
              class="form-input"
              :readonly="!isEditing && !!id"
            >
          </div>
        </div>

        <div class="form-group">
          <label>Location</label>
          <input
            v-model="formData.location"
            type="text"
            class="form-input"
            :readonly="!isEditing && !!id"
          >
        </div>

        <div class="form-actions">
          <button
            type="button"
            class="btn btn-secondary"
            @click="handleCancel">
            {{ id ? 'Close' : 'Cancel' }}
          </button>

          <template v-if="id && !isEditing">
            <button
              type="button"
              class="btn btn-warning"
              @click="isEditing = true"
            >
              Edit
            </button>
            <button
              type="button"
              class="btn btn-danger"
              @click="handleDelete"
            >
              Delete
            </button>
          </template>

          <button
            v-else
            type="submit"
            class="btn btn-primary"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting" class="spinner"></span>
            {{ isSubmitting ? 'Saving...' : 'Save' }}
          </button>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </form>

      <div v-else class="view-mode">
        <div class="detail-item">
          <label>Title:</label>
          <p>{{ formData.title }}</p>
        </div>

        <div v-if="formData.description" class="detail-item">
          <label>Description:</label>
          <p>{{ formData.description }}</p>
        </div>

        <div class="detail-item">
          <label>Start:</label>
          <p>{{ formatDateTime(formData.start) }}</p>
        </div>

        <div class="detail-item">
          <label>End:</label>
          <p>{{ formatDateTime(formData.end) }}</p>
        </div>

        <div v-if="formData.location" class="detail-item">
          <label>Location:</label>
          <p>{{ formData.location }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useStore} from 'vuex'
import {format, parseISO} from 'date-fns'
import {CalendarEventRequest, CalendarEventResponseFormated} from '@/types/calendar'

interface EventFormData {
  title: string
  description?: string
  start: string
  end: string
  location?: string
}

const store = useStore()
const router = useRouter()
const route = useRoute()

const formData = ref<EventFormData>({
  title: '',
  start: '',
  end: '',
  description: '',
  location: ''
})

const id = computed(() => route.params.id as string)
let isEditing = !!id.value
const isSubmitting = ref(false)
const errorMessage = ref<string>('')

const currentEvent = computed(() => {
  if (!isEditing) return null
  return store.state.events.find(
    (e: CalendarEventResponseFormated) => e.id === id.value
  )
})

onMounted(async () => {
  if (isEditing) {
    formData.value = {
      title: currentEvent.value?.title,
      description: currentEvent.value?.description,
      start: timestampToLocalDateTime(currentEvent.value?.startTimestamp),
      end: timestampToLocalDateTime(currentEvent.value?.endTimestamp),
      location: currentEvent.value?.location
    }
  } else if (route.query.start) {
    const defaultDate = new Date(route.query.start as string)
    formData.value.start = format(defaultDate, 'yyyy-MM-dd\'T\'HH:mm')
    formData.value.end = format(defaultDate, 'yyyy-MM-dd\'T\'HH:mm')
  }
})
const timestampToLocalDateTime = (timestamp: number) => {
  if (!timestamp) return ''
  return format(new Date(timestamp), 'yyyy-MM-dd\'T\'HH:mm')
}
const formatDateTime = (dateString: string) => {
  if (!dateString) return ''
  return format(parseISO(dateString), 'MMM d, yyyy HH:mm')
}

const validateForm = () => {
  const start = new Date(formData.value.start)
  const end = new Date(formData.value.end)

  if (start >= end) {
    errorMessage.value = 'End date must be after start date'
    return false
  }

  errorMessage.value = ''
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  try {
    const data = formData.value
    const eventData: CalendarEventRequest = {
      title: data.title,
      description: data.description,
      startTimestamp: new Date(data.start).getTime(),
      endTimestamp: new Date(data.end).getTime(),
      location: data.location
    }

    if (isEditing) {
      await store.dispatch('updateEvent', {
        id: id.value,
        eventData
      })
    } else {
      await store.dispatch('createEvent', eventData)
    }

    await router.push('/')
  } catch (error) {
    errorMessage.value = 'Error saving event. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = async () => {
  if (confirm('Are you sure you want to delete this event?')) {
    try {
      await store.dispatch('deleteEvent', id.value)
      router.push('/')
    } catch (error) {
      errorMessage.value = 'Error deleting event'
    }
  }
}

const handleCancel = () => {
  if (id.value) {
    isEditing = false

    if (currentEvent.value) {
      formData.value = {
        title: currentEvent.value.title,
        description: currentEvent.value.description,
        start: format(new Date(currentEvent.value.startTimestamp), 'yyyy-MM-dd\'T\'HH:mm'),
        end: format(new Date(currentEvent.value.endTimestamp), 'yyyy-MM-dd\'T\'HH:mm'),
        location: currentEvent.value.location
      }
    }
  }
  router.push('/')
}
</script>

<style scoped lang="scss">
.event-form {
  padding: 1rem;
  min-height: 100vh;
  background-color: #f8f9fa;

  .form-container {
    min-width: 350px;
    max-width: 600px;
    margin: 0 auto;
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

.form-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #2c3e50;
  text-align: center;
}

.form-group {
  margin-bottom: 1.25rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #4a5568;
  }
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    border-color: #4299e1;
    outline: none;
    box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2);
  }

  &[readonly] {
    background-color: #f8fafc;
    cursor: not-allowed;
  }
}

.datetime-group {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, 1fr);
}

.form-actions {
  margin-top: 2rem;
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &-primary {
    background-color: #4299e1;
    color: white;

    &:hover {
      background-color: #3182ce;
    }
  }

  &-secondary {
    background-color: #e2e8f0;
    color: #2d3748;

    &:hover {
      background-color: #cbd5e0;
    }
  }

  &-warning {
    background-color: #f6ad55;
    color: white;

    &:hover {
      background-color: #ed8936;
    }
  }

  &-danger {
    background-color: #fc8181;
    color: white;

    &:hover {
      background-color: #f56565;
    }
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.error-message {
  color: #e53e3e;
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
}

.view-mode {
  .detail-item {
    margin-bottom: 1.5rem;

    label {
      font-weight: 500;
      color: #4a5568;
      margin-bottom: 0.5rem;
    }

    p {
      background: #f8fafc;
      padding: 0.75rem;
      border-radius: 6px;
      margin: 0;
    }
  }
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid #fff;
  border-bottom-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 768px) {

  .datetime-group {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .form-title {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .form-input {
    padding: 0.65rem;
  }

  .view-mode .detail-item p {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
}
</style>
