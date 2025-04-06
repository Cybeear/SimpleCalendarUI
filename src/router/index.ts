import {createRouter, createWebHistory} from 'vue-router'
import CalendarView from '@/components/CalendarView.vue'
const routes = [
  {
    path: '/',
    component: CalendarView
  },
  {
    path: '/event/:id',
    component: () => import('@/components/EventForm.vue')
  },
  {
    path: '/event',
    component: () => import('@/components/EventForm.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
