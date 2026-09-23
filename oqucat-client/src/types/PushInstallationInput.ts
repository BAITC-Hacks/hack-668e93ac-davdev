export interface PushInstallationInput {
  installationId: string
  platform: 'web' | 'android' | 'ios'
  identifierType: 'fid' | 'token'
}
