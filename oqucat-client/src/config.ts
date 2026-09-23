export const baseURL = import.meta.env.VITE_API_URL ?? ''
export const baseWSURL = import.meta.env.VITE_WS_URL ?? ''
export const googleID = import.meta.env.VITE_WEB_GOOGLE_CLIENT_ID ?? ''
export const googleIDAndroid =
  import.meta.env.VITE_ANDROID_GOOGLE_CLIENT_ID ?? ''
export const tgBot = import.meta.env.VITE_TG_BOT ?? ''
export const vapidKey = import.meta.env.VITE_VAPID_KEY ?? ''
export const cloudflareSiteKey = import.meta.env.VITE_CLOUDFLARE_SITE_KEY ?? ''
export const isDev = import.meta.env.DEV
export const appName = import.meta.env.VITE_APP_NAME ?? ''
export const appVersion = import.meta.env.APP_VERSION ?? 'unknown'
