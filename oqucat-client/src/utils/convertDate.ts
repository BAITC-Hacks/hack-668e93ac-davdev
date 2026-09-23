import { differenceInMinutes, formatDistanceToNow, format } from 'date-fns'
import { ru } from 'date-fns/locale'

export const convertDate = (date: Date | string | number) => {
  const inputDate = new Date(date || Date.now())

  const minutesAgo = differenceInMinutes(Date.now(), inputDate)

  if (minutesAgo < 60) {
    return formatDistanceToNow(inputDate, {
      addSuffix: true,
      locale: ru,
    })
  }

  return format(inputDate, 'd MMMM, HH:mm', { locale: ru })
}
