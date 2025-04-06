<template>
  <div class="calendar-wrapper">
    <div class="calendar-grid">
      <div class="weekdays-header">
        <div
          v-for="day in weekdayNames"
          :key="day"
          class="weekday-cell">
          {{ day }}
        </div>
      </div>

      <div class="days-grid">
        <div
          v-for="(day, index) in visibleDays"
          :key="index"
          class="day-cell"
          :class="{
          'current-month': day.isCurrentMonth,
          'today': isToday(day.date),
          'has-events': day.events.length > 0
        }"
          @click="handleDayClick(day.date)"
          @dblclick="handleDayDblClick(day.date)">
          <div class="day-header">
            <span class="day-number">{{ day.date.getDate() }}</span>
            <span
              v-if="!day.isCurrentMonth"
              class="month-indicator"
            >
            {{ formatMonth(day.date) }}
          </span>
          </div>

          <div class="day-timeline">
            <div
              v-for="event in day.events"
              :key="event.id"
              class="event-item"
              :style="getEventStyle(event)"
              @click.stop="$emit('event-selected', event)"
            >
              <div class="event-title">{{ event.title }}</div>
              <div class="event-time">
                {{ formatTime(event.startDate) }} - {{ formatTime(event.endDate) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, defineProps, withDefaults} from 'vue'
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameMonth,
  isToday as dateIsToday,
  startOfMonth,
  subDays
} from 'date-fns'
import type {CalendarDay, CalendarEventResponseFormated} from '@/types/calendar'
import {useRouter} from 'vue-router'

interface Props {
  currentDate: Date
  events?: CalendarEventResponseFormated[]
  currentView?: 'month' | 'week' | 'day'
}

const props = withDefaults(defineProps<Props>(), {
  events: () => [],
  currentView: 'month'
})
const router = useRouter()

const weekdayNames = computed(() => {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
})

const eventColors = [
  '#4299e1',
  '#48bb78',
  '#ed8936',
  '#9f7aea',
  '#f56565',
  '#38b2ac',
  '#ecc94b'
]

const visibleDays = computed<CalendarDay[]>(() => {
  const start = startOfMonth(props.currentDate)
  const end = endOfMonth(props.currentDate)

  let gridStart = start
  while (gridStart.getDay() !== 0) {
    gridStart = subDays(gridStart, 1)
  }

  let gridEnd = end
  while (gridEnd.getDay() !== 6) {
    gridEnd = addDays(gridEnd, 1)
  }

  return eachDayOfInterval({
    start: gridStart,
    end: gridEnd
  }).map(date => ({
    date,
    isCurrentMonth: isSameMonth(date, props.currentDate),
    events: props.events.filter(event =>
      isSameDay(event.startDate, date) || isSameDay(event.endDate, date)
    )
  }))
})

let lastTap = 0
const handleDayClick = (date: Date) => {
  const now = Date.now()
  const DOUBLE_TAP_DELAY = 300

  if (now - lastTap < DOUBLE_TAP_DELAY) {
    handleDayDblClick(date)
    lastTap = 0
  } else {
    lastTap = now
  }
}

const handleDayDblClick = (date: Date) => {
  openEventForm(date)
}

const openEventForm = (date: Date) => {
  const start = format(date, 'yyyy-MM-dd\'T\'HH:mm')
  router.push({
    path: '/event',
    query: {start}
  })
}

const formatMonth = (date: Date) => format(date, 'MMM')
const formatTime = (date: Date) => format(date, 'HH:mm')
const isToday = (date: Date) => dateIsToday(date)
const isSameDay = (date1: Date, date2: Date) =>
  date1.getDate() === date2.getDate() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getFullYear() === date2.getFullYear()

const dayStartHour = 0
const dayEndHour = 24

const getEventPosition = (event: CalendarEventResponseFormated) => {
  const startHour = event.startDate.getHours() + event.startDate.getMinutes() / 60
  const endHour = event.endDate.getHours() + event.endDate.getMinutes() / 60
  const duration = Math.min(endHour, dayEndHour) - Math.max(startHour, dayStartHour)

  return {
    top: ((Math.max(startHour, dayStartHour) - dayStartHour) / (dayEndHour - dayStartHour)) * 100 + '%',
    height: (duration / (dayEndHour - dayStartHour)) * 100 + '%'
  }
}

const getEventColor = (event: CalendarEventResponseFormated) => {
  const hash = event.id ? event.id.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0
  return eventColors[hash % eventColors.length]
}

const darkenColor = (color: string, percent: number) => {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) - amt
  const G = (num >> 8 & 0x00FF) - amt
  const B = (num & 0x0000FF) - amt
  return `#${(
    0x1000000 +
    (R < 0 ? 0 : R) * 0x10000 +
    (G < 0 ? 0 : G) * 0x100 +
    (B < 0 ? 0 : B)
  ).toString(16).slice(1)}`
}

const getEventStyle = (event: CalendarEventResponseFormated) => {
  const position = getEventPosition(event)
  return {
    backgroundColor: getEventColor(event),
    border: `1px solid ${darkenColor(getEventColor(event), 20)}`,
    top: position.top,
    height: position.height,
    marginBottom: '2px'
  }
}
</script>

<style scoped lang="scss">
.calendar-wrapper {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.calendar-grid {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 320px;
  background: white;
  height: 100%;

  .weekdays-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    background: #f8fafc;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .days-grid {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch; /* Для плавного скролла на iOS */
    overscroll-behavior: contain; /* Улучшает поведение скролла */
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    grid-auto-rows: minmax(100px, auto);
    height: 0; /* Важно для правильного расчета flex */

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .day-cell {
    min-height: 100px;
    border-right: 1px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
    padding: 4px;
    position: relative;
  }

  @media (max-width: 768px) {
    .weekdays-header {
      display: none;
    }

    .days-grid {
      grid-template-columns: 1fr;
      grid-auto-rows: minmax(120px, auto);
    }

    .day-cell {
      min-height: auto;
      height: auto;
      border-right: none;
      border-bottom: 1px solid #e2e8f0;
      padding: 12px 8px;
    }
  }

  @media (max-width: 480px) {
    .day-cell {
      padding: 8px 4px;
    }

    .event-item {
      padding: 4px;
      font-size: 0.8rem;
    }
  }
}
</style>
