import {format} from 'date-fns'

export const formatDateTime = (date: Date) =>
  format(date, 'yyyy-MM-dd\'T\'HH:mm')

export const formatDisplayDate = (date: Date) =>
  format(date, 'dd MMM yyyy HH:mm')
