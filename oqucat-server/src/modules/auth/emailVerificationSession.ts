import { randomBytes } from 'node:crypto'

import { APIError, createAuthEndpoint } from 'better-auth/api'
import { setSessionCookie } from 'better-auth/cookies'
import { z } from 'zod'

const ticketLifetimeMs = 60_000

interface VerificationTicket {
  email: string
  expiresAt: number
}

const tickets = new Map<string, VerificationTicket>()

const issueEmailVerificationTicket = (email: string) => {
  const ticket = randomBytes(32).toString('base64url')
  const now = Date.now()

  for (const [key, value] of tickets) {
    if (value.expiresAt <= now) {
      tickets.delete(key)
    }
  }

  tickets.set(ticket, { email, expiresAt: now + ticketLifetimeMs })
  return ticket
}

const consumeEmailVerificationTicket = (ticket: string) => {
  const value = tickets.get(ticket)
  tickets.delete(ticket)

  if (!value || value.expiresAt <= Date.now()) {
    return null
  }

  return value
}

const emailVerificationSession = () =>
  ({
    id: 'email-verification-session',
    endpoints: {
      completeEmailVerification: createAuthEndpoint(
        '/complete-email-verification',
        {
          method: 'POST',
          body: z.object({
            ticket: z.string().min(1),
          }),
        },
        async (ctx) => {
          const ticket = consumeEmailVerificationTicket(ctx.body.ticket)
          if (!ticket) {
            throw APIError.from('UNAUTHORIZED', {
              code: 'UNAUTHORIZED',
              message: 'Unauthorized',
            })
          }

          const user = await ctx.context.internalAdapter.findUserByEmail(
            ticket.email
          )
          if (!user?.user.emailVerified) {
            throw APIError.from('UNAUTHORIZED', {
              code: 'UNAUTHORIZED',
              message: 'Unauthorized',
            })
          }

          const session = await ctx.context.internalAdapter.createSession(
            user.user.id
          )
          await setSessionCookie(ctx, { session, user: user.user })
          return ctx.json({ status: true })
        }
      ),
    },
  }) as const

export { emailVerificationSession, issueEmailVerificationTicket }
