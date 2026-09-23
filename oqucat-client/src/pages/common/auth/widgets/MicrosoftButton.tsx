import { FaMicrosoft as MicrosoftIcon } from 'react-icons/fa6'

import OAuthButton from './OAuthButtonBase'

export const MicrosoftButton = () => (
  <OAuthButton
    icon={<MicrosoftIcon />}
    provider="microsoft"
    translationKey="common:auth.microsoft.signIn"
  />
)
