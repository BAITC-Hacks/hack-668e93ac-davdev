/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly APP_VERSION?: string
  readonly VITE_API_URL?: string
  readonly VITE_WS_URL?: string
  readonly VITE_WEB_GOOGLE_CLIENT_ID?: string
  readonly VITE_ANDROID_GOOGLE_CLIENT_ID?: string
  readonly VITE_TG_BOT?: string
  readonly VITE_VAPID_KEY?: string
  readonly VITE_APP_NAME?: string
  readonly VITE_CLOUDFLARE_SITE_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
