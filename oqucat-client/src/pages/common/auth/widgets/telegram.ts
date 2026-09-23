declare global {
  var TelegramNative:
    | {
        login: () => void
      }
    | undefined
}

export interface TelegramLoginDetail {
  idToken: string
}

export const isTelegramLoginEvent = (
  event: Event
): event is CustomEvent<TelegramLoginDetail> => {
  if (!(event instanceof CustomEvent)) {
    return false
  }

  const detail: unknown = event.detail

  return (
    typeof detail === 'object' &&
    detail !== null &&
    'idToken' in detail &&
    typeof detail.idToken === 'string'
  )
}
