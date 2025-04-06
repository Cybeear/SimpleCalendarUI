import axios from 'axios'
import {v4 as uuidV4} from 'uuid'
import type {CalendarEventResponse, CalendarEventResponseFormated} from '@/types/calendar'

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': localStorage.getItem('locale') || 'en'
  }
})

api.interceptors.request.use(config => {
  if (config.method?.toLowerCase() === 'post') {
    config.headers['Idempotency-Key'] = uuidV4()
  }
  return config
})

export const CalendarService = {
  async getEvents (): Promise<CalendarEventResponseFormated[]> {
    const { data } = await api.get('/events')
    return data.map((event: CalendarEventResponse) => ({
      ...event,
      startDate: new Date(event.startTimestamp),
      endDate: new Date(event.endTimestamp)
    }))
  },

  async createEvent (event: Omit<CalendarEventResponse, 'id'>): Promise<CalendarEventResponseFormated> {
    return await api.post('/events', event)
  },

  async updateEvent (id: string, event: Partial<CalendarEventResponse>): Promise<CalendarEventResponseFormated> {
    return await api.put(`/events/${id}`, event)
  },

  async deleteEvent (id: string): Promise<void> {
    await api.delete(`/events/${id}`)
  }
}
