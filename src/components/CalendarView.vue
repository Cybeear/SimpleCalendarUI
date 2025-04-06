<template>
  <div class="calendar-container">
    <CalendarHeader
      :current-date="currentDate"
      @month-change="handleMonthChange"
    />

    <CalendarGrid
      :current-date="currentDate"
      :events="events"
      @event-selected="handleEventSelect"
    />
  </div>
</template>

<script lang="ts">
import {computed, defineComponent} from 'vue'
import {useStore} from 'vuex'
import {useRouter} from 'vue-router'
import CalendarHeader from '@/components/CalendarHeader.vue'
import CalendarGrid from '@/components/CalendarGrid.vue'
import {CalendarEventResponseFormated} from '@/types/calendar'

export default defineComponent({
  components: {
    CalendarHeader,
    CalendarGrid
  },

  setup () {
    const router = useRouter()
    const store = useStore()
    store.dispatch('fetchEvents')

    const currentDate = computed(() => store.state.currentDate)
    const events = computed(() => store.state.events)

    const handleMonthChange = (delta: number) => {
      const newDate = new Date(currentDate.value)
      newDate.setMonth(newDate.getMonth() + delta)
      store.commit('SET_DATE', newDate)
    }

    const handleEventSelect = (event: CalendarEventResponseFormated) => {
      store.commit('SET_EVENT', event)
      router.push(`/event/${event.id}`)
    }

    return {
      currentDate,
      events,
      handleMonthChange,
      handleEventSelect
    }
  }
})
</script>

<style scoped lang="scss">
.calendar-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px);
}

.calendar-wrapper {
  flex: 1;
  overflow: auto;
  padding: 0 8px 16px;
}
</style>
