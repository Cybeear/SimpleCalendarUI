import {createStore} from 'vuex'
import {CalendarEventResponse, CalendarEventResponseFormated} from '@/types/calendar'
import {CalendarService} from '@/services/eventService'

interface State {
  events: CalendarEventResponseFormated[]
  selectedEvent: CalendarEventResponseFormated | null
  currentDate: Date
}

export default createStore<State>({
  state: {
    events: [],
    selectedEvent: {} as CalendarEventResponseFormated | null,
    currentDate: new Date()
  },
  mutations: {
    SET_EVENTS (state, events: CalendarEventResponseFormated[]) {
      state.events = events
    },
    ADD_EVENT (state, event: CalendarEventResponseFormated) {
      state.events.push(event)
    },
    UPDATE_EVENT (state, updatedEvent: CalendarEventResponseFormated) {
      const index = state.events.findIndex(e => e.id === updatedEvent.id)
      if (index !== -1) {
        state.events.splice(index, 1, updatedEvent)
      }
    },
    DELETE_EVENT (state, id: string) {
      state.events = state.events.filter(e => e.id !== id)
    },
    SET_DATE (state, date: Date) {
      state.currentDate = date
    },
    SET_EVENT (state, event: CalendarEventResponseFormated) {
      state.selectedEvent = event
    }
  },
  actions: {
    async fetchEvents ({commit}) {
      await CalendarService.getEvents().then((events: CalendarEventResponseFormated[]) => {
        commit('SET_EVENTS', events)
      })
    },
    async createEvent ({commit}, eventData) {
      await CalendarService.createEvent(eventData).then((event: CalendarEventResponseFormated) => {
        commit('ADD_EVENT', event)
      })
    },
    async updateEvent ({commit}, {id, eventData}) {
      console.log(id, eventData)
      await CalendarService.updateEvent(id, eventData).then((event: CalendarEventResponseFormated) => {
        commit('UPDATE_EVENT', event)
      })
    },
    async deleteEvent ({commit}, id) {
      await CalendarService.deleteEvent(id).then(() => {
        commit('DELETE_EVENT', id)
      })
    }
  }
})
