<template>
  <div class="calendar-header">
    <div class="navigation-container">
      <button class="nav-button" @click="handlePrevMonth">
        <i class="fa-solid fa-chevron-left nav-icon"></i>
      </button>

      <div class="month-cards">
        <div
          class="month-card adjacent-month"
          @click="handleAdjacentMonth(-1)"
        >
          {{ prevMonthName }}
        </div>

        <div class="month-card current-month">
          <h2>{{ currentMonthName }}</h2>
          <div class="year">{{ currentYear }}</div>
        </div>

        <div
          class="month-card adjacent-month"
          @click="handleAdjacentMonth(1)"
        >
          {{ nextMonthName }}
        </div>
      </div>

      <button class="nav-button" @click="handleNextMonth">
        <i class="fa-solid fa-chevron-right nav-icon"></i>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent} from 'vue'
import {addMonths, format} from 'date-fns'

export default defineComponent({
  props: {
    currentDate: {
      type: Date,
      required: true
    }
  },

  emits: ['month-change'],

  setup (props, {emit}) {
    const currentMonthName = computed(() => format(props.currentDate, 'MMMM'))
    const currentYear = computed(() => format(props.currentDate, 'yyyy'))
    const prevMonthName = computed(() => format(addMonths(props.currentDate, -1), 'MMMM'))
    const nextMonthName = computed(() => format(addMonths(props.currentDate, 1), 'MMMM'))

    const handleMonthChange = (delta: number) => {
      emit('month-change', delta)
    }

    return {
      currentMonthName,
      currentYear,
      prevMonthName,
      nextMonthName,
      handlePrevMonth: () => handleMonthChange(-1),
      handleNextMonth: () => handleMonthChange(1),
      handleAdjacentMonth: (delta: number) => handleMonthChange(delta)
    }
  }
})
</script>

<style scoped lang="scss">
.calendar-header {
  margin: 20px 5px;
}

.navigation-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.month-cards {
  display: flex;
  gap: 15px;
  flex-grow: 1;
}

.month-card {
  flex: 1;
  padding: 15px;
  border-radius: 8px;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;

  &:hover {
    background: #e0e0e0;
  }

  &.current-month {
    background: #2196F3;
    color: white;
    transform: scale(1.05);
  }
}

.nav-button {
  background: none;
  border: none;
  padding: 10px;
  cursor: pointer;

  .material-icons {
    font-size: 32px;
    color: #666;
  }

  &:hover .material-icons {
    color: #333;
  }
}
</style>
