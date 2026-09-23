import { FaGithub as GitHubIcon } from 'react-icons/fa6'

import OAuthButton from './OAuthButtonBase'

export const GithubButton = () => (
  <OAuthButton
    icon={<GitHubIcon />}
    provider="github"
    translationKey="common:auth.github.signIn"
  />
)
