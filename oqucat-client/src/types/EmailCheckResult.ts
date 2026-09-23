export type EmailCheckProvider =
  | 'credential'
  | 'google'
  | 'telegram-oidc'
  | 'github'
  | 'microsoft'
  | 'facebook'
  | 'passkey'

export type EmailCheckStatus = EmailCheckProvider[]
