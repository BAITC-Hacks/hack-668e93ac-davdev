import { isTauri } from '@/utils/isTauri'

export {
  subscribeToTauriMessages,
  subscribeToTauriNotificationOpens,
  type TauriFcmMessage,
  type TauriFcmNotificationOpen,
} from './tauri'

export const registerPush = async () => {
  if (isTauri) {
    const { registerTauriFcm } = await import('./tauri')
    return registerTauriFcm()
  }

  const { registerWebFcm } = await import('./web')
  return registerWebFcm()
}
