const getUserHour = (tz: string) =>
  Number(
    new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      hour12: false,
      timeZone: tz,
    }).format(new Date())
  )

export default getUserHour
