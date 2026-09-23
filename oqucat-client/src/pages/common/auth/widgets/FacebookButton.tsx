import { FaFacebook as FacebookIcon } from 'react-icons/fa6'

import OAuthButton from './OAuthButtonBase'

export const FacebookButton = () => (
  <OAuthButton
    icon={<FacebookIcon />}
    provider="facebook"
    translationKey="common:auth.facebook.signIn"
  />
)
