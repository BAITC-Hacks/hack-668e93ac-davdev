import { createHash } from 'node:crypto'

export const isPasswordPwned = async (password: string): Promise<boolean> => {
  const hash = createHash('sha1').update(password).digest('hex').toUpperCase()
  const prefix = hash.slice(0, 5)
  const suffix = hash.slice(5)

  const response = await fetch(
    `https://api.pwnedpasswords.com/range/${prefix}`,
    {
      headers: {
        'Add-Padding': 'true',
        'User-Agent': 'BetterAuth Password Checker',
      },
    }
  )

  if (!response.ok) {
    throw new Error(`HIBP request failed with status ${response.status}`)
  }

  const hashes = await response.text()

  return hashes
    .split('\n')
    .some((line) => line.split(':', 1)[0].trim().toUpperCase() === suffix)
}
