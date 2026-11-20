import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

interface RateLimitRecord {
  timestamps: number[]
}

const rateLimitStore = new Map<string, RateLimitRecord>()

const WINDOW_MS = 60 * 1000 // 1 minute window
const AUTH_LIMIT = 5 // max 5 attempts per minute for auth endpoints
const SIGNUP_LIMIT = 5 // max 5 attempts per minute for signup endpoint
const CLEANUP_INTERVAL_MS = 60 * 1000

let lastCleanup = Date.now()

function getClientIp(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for')
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(',')[0].trim()
    if (firstIp) return firstIp
  }

  const xRealIp = request.headers.get('x-real-ip')
  if (xRealIp) return xRealIp.trim()

  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  if (cfConnectingIp) return cfConnectingIp.trim()

  return (request as any).ip || '127.0.0.1'
}

function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfter: number; resetTime: number } {
  const now = Date.now()

  // Periodic cleanup of stale entries or when memory grows large
  if (now - lastCleanup > CLEANUP_INTERVAL_MS || rateLimitStore.size > 10000) {
    lastCleanup = now
    const cutoff = now - windowMs
    for (const [k, v] of rateLimitStore.entries()) {
      const active = v.timestamps.filter((ts) => ts > cutoff)
      if (active.length === 0) {
        rateLimitStore.delete(k)
      } else {
        v.timestamps = active
      }
    }
  }

  const record = rateLimitStore.get(key) || { timestamps: [] }
  const cutoff = now - windowMs
  const activeTimestamps = record.timestamps.filter((ts) => ts > cutoff)

  if (activeTimestamps.length >= limit) {
    const oldestTimestamp = activeTimestamps[0]
    const resetTime = oldestTimestamp + windowMs
    const retryAfter = Math.max(1, Math.ceil((resetTime - now) / 1000))
    return {
      allowed: false,
      remaining: 0,
      retryAfter,
      resetTime: Math.ceil(resetTime / 1000),
    }
  }

  activeTimestamps.push(now)
  rateLimitStore.set(key, { timestamps: activeTimestamps })

  const remaining = limit - activeTimestamps.length
  const resetTime = activeTimestamps[0] + windowMs

  return {
    allowed: true,
    remaining,
    retryAfter: 0,
    resetTime: Math.ceil(resetTime / 1000),
  }
}

export function middleware(request: NextRequest) {
  if (request.method !== 'POST') {
    return NextResponse.next()
  }

  const pathname = request.nextUrl.pathname.replace(/\/+$/, '')
  const ip = getClientIp(request)

  let limit = 0
  let bucketKey = ''

  if (
    pathname === '/api/auth/callback/credentials' ||
    pathname === '/api/auth/login' ||
    pathname.startsWith('/api/auth/callback') ||
    pathname.startsWith('/api/auth/signin')
  ) {
    limit = AUTH_LIMIT
    bucketKey = `auth:${ip}`
  } else if (pathname === '/api/signup') {
    limit = SIGNUP_LIMIT
    bucketKey = `signup:${ip}`
  }

  if (limit > 0 && bucketKey) {
    const result = checkRateLimit(bucketKey, limit, WINDOW_MS)

    if (!result.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(result.retryAfter),
            'X-RateLimit-Limit': String(limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(result.resetTime),
          },
        }
      )
    }

    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', String(limit))
    response.headers.set('X-RateLimit-Remaining', String(result.remaining))
    response.headers.set('X-RateLimit-Reset', String(result.resetTime))
    return response
  }

  return NextResponse.next()
}

export { middleware as proxy }
export default middleware

export const config = {
  matcher: ['/api/auth/:path*', '/api/signup', '/api/signup/:path*'],
}
