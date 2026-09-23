import type { RequestHandler } from 'express'
import type { z } from 'zod'

interface RequestValidation<TParams, TQuery, TBody> {
  params?: z.ZodType<TParams>
  query?: z.ZodType<TQuery>
  body?: z.ZodType<TBody>
}

export const validateRequest =
  <TParams, TQuery, TBody>(
    schemas: RequestValidation<TParams, TQuery, TBody>
  ): RequestHandler<TParams, unknown, TBody, TQuery> =>
  (req, res, next) => {
    const errors: Record<string, string> = {}

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params)

      if (result.success) {
        req.params = result.data
      } else {
        for (const issue of result.error.issues) {
          errors[`params.${issue.path.join('.')}`] = issue.message
        }
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query)

      if (result.success) {
        Object.defineProperty(req, 'query', {
          configurable: true,
          enumerable: true,
          value: result.data,
          writable: true,
        })
      } else {
        for (const issue of result.error.issues) {
          errors[`query.${issue.path.join('.')}`] = issue.message
        }
      }
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body)

      if (result.success) {
        req.body = result.data
      } else {
        for (const issue of result.error.issues) {
          errors[issue.path.join('.')] = issue.message
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: 'validation_error',
        errors,
      })
    }

    return next()
  }
