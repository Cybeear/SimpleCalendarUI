export type CalendarView = 'year' | 'month' | 'day'

export interface CalendarEventResponse {
  id: string
  title: string
  description?: string
  startTimestamp: number
  endTimestamp: number
  location?: string
}

export interface CalendarEventRequest {
  title: string
  description?: string
  startTimestamp: number
  endTimestamp: number
  location?: string
}

export interface CalendarEventResponseFormated extends CalendarEventResponse {
  startDate: Date
  endDate: Date
}

export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  events: CalendarEventResponseFormated[]
}
